import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../utils";

async function getCachedSummary(tenantId: string): Promise<any | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const key = `fin:summary:${tenantId}`;
    const res = await fetch(`${url}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.result) {
      return JSON.parse(data.result);
    }
  } catch (err) {
    console.error("Redis read cache error:", err);
  }
  return null;
}

async function setCachedSummary(tenantId: string, value: any): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    const key = `fin:summary:${tenantId}`;
    await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["SET", key, JSON.stringify(value)],
        ["EXPIRE", key, 30], // 30 seconds TTL
      ]),
    });
  } catch (err) {
    console.error("Redis write cache error:", err);
  }
}

export async function GET(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  // 1. Try to read from Upstash Redis cache first
  const cached = await getCachedSummary(tenantId);
  if (cached) {
    return NextResponse.json(cached);
  }

  const supabase = createServiceRoleClient();

  // Validate requester is a member of the tenant and check role access
  const { data: requester, error: requesterError } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .single();

  if (requesterError || !requester) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
  if (!allowedRoles.includes(requester.role)) {
    return NextResponse.json(
      { message: "Forbidden: Only committee members can view financial summaries" },
      { status: 403 }
    );
  }

  try {
    let resultData: any = null;

    // 2. Try to invoke the postgres RPC function
    const { data: summaryList, error: rpcError } = await supabase.rpc(
      "tenant_financial_summary",
      { p_tenant_id: tenantId }
    );

    if (!rpcError && summaryList && summaryList.length > 0) {
      const summary = summaryList[0];
      resultData = {
        total_donations: Number(summary.total_donations || 0),
        total_expenses: Number(summary.total_expenses || 0),
        net_balance: Number(summary.net_balance || 0),
        pending_approvals: Number(summary.pending_approvals || 0),
        donation_count: Number(summary.donation_count || 0),
        expense_count: Number(summary.expense_count || 0),
      };
    } else {
      // 3. Direct JS aggregates fallback if RPC fails or is missing
      console.warn("RPC tenant_financial_summary failed/missing, running query fallback", rpcError);

      // Sum of confirmed donations
      const { data: donations } = await supabase
        .from("donations")
        .select("amount")
        .eq("tenant_id", tenantId)
        .eq("status", "confirmed");

      const total_donations = (donations || []).reduce((sum, d) => sum + Number(d.amount), 0);
      const donation_count = (donations || []).length;

      // Sum of approved/paid expenses
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, status")
        .eq("tenant_id", tenantId);

      const approvedExpenses = (expenses || []).filter((e) => ["approved", "paid"].includes(e.status));
      const total_expenses = approvedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const expense_count = approvedExpenses.length;

      const pending_approvals = (expenses || []).filter((e) => e.status === "pending_approval" || e.status === "submitted").length;

      resultData = {
        total_donations,
        total_expenses,
        net_balance: total_donations - total_expenses,
        pending_approvals,
        donation_count,
        expense_count,
      };
    }

    // Write back to Upstash Redis cache
    await setCachedSummary(tenantId, resultData);

    return NextResponse.json(resultData);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
