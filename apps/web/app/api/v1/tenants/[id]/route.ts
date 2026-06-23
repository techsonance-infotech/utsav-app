import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent } from "../../utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  // Validate that the user is a member of this tenant
  const { data: membership, error: memberError } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", id)
    .eq("user_id", userId)
    .single();

  if (memberError || !membership) {
    return NextResponse.json({ message: "Forbidden. Not a member of this tenant." }, { status: 403 });
  }

  // Fetch tenant details
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single();

  if (tenantError || !tenant) {
    return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
  }

  return NextResponse.json(tenant);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Set the tenant scope in headers to verify admin/owner role
  req.headers.set("x-tenant-id", id);
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin"]);
  if (!hasAccess) return errorResponse!;

  try {
    const body = await req.json();
    const supabase = createServiceRoleClient();

    // Fetch before state for audit logging
    const { data: originalTenant } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", id)
      .single();

    if (!originalTenant) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    const {
      name,
      vertical,
      logo_url,
      banner_url,
      primary_color,
      city,
      state,
      description,
      timezone,
      default_language,
      is_public_donations,
      is_public_expenses,
      razorpay_key_id,
      whatsapp_group_url,
      founded_year,
      address,
      website_url,
    } = body;

    const { data: updatedTenant, error: updateError } = await supabase
      .from("tenants")
      .update({
        name,
        vertical,
        logo_url,
        banner_url,
        primary_color,
        city,
        state,
        description,
        timezone,
        default_language,
        is_public_donations,
        is_public_expenses,
        razorpay_key_id,
        whatsapp_group_url,
        founded_year,
        address,
        website_url,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedTenant) {
      return NextResponse.json({ message: updateError?.message || "Failed to update tenant" }, { status: 500 });
    }

    // Retrieve active role
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", id)
      .eq("user_id", userId)
      .single();

    // Log update
    await logAuditEvent({
      tenantId: id,
      actorId: userId,
      actorRole: member?.role || "admin",
      action: "tenant_update",
      entityType: "tenant",
      entityId: id,
      beforeData: originalTenant,
      afterData: updatedTenant,
    });

    return NextResponse.json(updatedTenant);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
