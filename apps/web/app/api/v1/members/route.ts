import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../utils";

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
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const supabase = createServiceRoleClient();

  // Validate requester is a member of the tenant
  const { data: requester, error: requesterError } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .single();

  if (requesterError || !requester) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const statusFilter = status || "active";
  if (statusFilter === "pending" && !["owner", "admin"].includes(requester.role)) {
    return NextResponse.json({ message: "Access denied: pending approval list is only accessible to admins or owners" }, { status: 403 });
  }

  let query = supabase
    .from("tenant_members")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", statusFilter);

  if (role) {
    query = query.eq("role", role);
  }
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  // Sort by name
  query = query.order("full_name", { ascending: true });

  const { data: members, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ message: dbError.message }, { status: 500 });
  }

  // Fetch emails from auth.users list using service role client admin API
  try {
    const { data: authData } = await supabase.auth.admin.listUsers();
    const emailMap = new Map((authData?.users || []).map((u) => [u.id, u.email]));

    const membersWithEmail = (members || []).map((m: any) => ({
      ...m,
      email: emailMap.get(m.user_id) || `${m.full_name.toLowerCase().replace(/\s+/g, ".")}@utsavmail.com`,
    }));

    return NextResponse.json(membersWithEmail);
  } catch (err) {
    // Fallback if auth list fails
    const membersWithEmail = (members || []).map((m: any) => ({
      ...m,
      email: `${m.full_name.toLowerCase().replace(/\s+/g, ".")}@utsavmail.com`,
    }));
    return NextResponse.json(membersWithEmail);
  }
}

