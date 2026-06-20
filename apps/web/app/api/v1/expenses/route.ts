import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../utils";

export async function GET(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const supabase = createServiceRoleClient();

  try {
    let query = supabase
      .from("expenses")
      .select(`
        *,
        category:expense_categories(id, name, color, icon),
        vendor:vendors(id, business_name, phone)
      `)
      .eq("tenant_id", tenantId)
      .order("expense_date", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: expenses, error: dbError } = await query;

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(expenses || []);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const {
      title,
      amount,
      category_id,
      vendor_id,
      description,
      receipt_url,
      expense_date = new Date().toISOString().split("T")[0],
      payment_mode = "cash",
      gst_amount = 0,
      status = "pending_approval",
    } = body;

    if (!title || !amount || Number(amount) <= 0) {
      return NextResponse.json({ message: "Title and a positive Amount are required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Fetch user membership for role reference
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const actorRole = member?.role || "member";

    // 2. Insert expense
    const { data: expense, error: insertError } = await supabase
      .from("expenses")
      .insert({
        tenant_id: tenantId,
        submitted_by: userId,
        title,
        amount: Number(amount),
        category_id: category_id || null,
        vendor_id: vendor_id || null,
        description: description || null,
        receipt_url: receipt_url || null,
        expense_date,
        payment_mode,
        gst_amount: Number(gst_amount),
        status,
      })
      .select()
      .single();

    if (insertError || !expense) {
      return NextResponse.json({ message: insertError?.message || "Failed to submit expense" }, { status: 500 });
    }

    // 3. Log audit log
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole,
      action: "expense_create",
      entityType: "expense",
      entityId: expense.id,
      afterData: expense,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
