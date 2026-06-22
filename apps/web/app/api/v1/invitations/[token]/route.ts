import { NextResponse } from "next/server";
import { createServiceRoleClient, checkRole, logAuditEvent } from "../../utils";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const { token } = params;

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Fetch invitation and join with tenant details
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("role, expires_at, used_at, tenants(name, slug, city, state)")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (!invitation) {
    return NextResponse.json({ message: "Invitation not found or invalid" }, { status: 404 });
  }

  if (invitation.used_at) {
    return NextResponse.json({ message: "Invitation has already been used" }, { status: 410 });
  }

  const expiresDate = new Date(invitation.expires_at);
  if (expiresDate < new Date()) {
    return NextResponse.json({ message: "Invitation has expired" }, { status: 410 });
  }

  const tenantData: any = invitation.tenants;

  return NextResponse.json({
    token,
    role: invitation.role,
    tenant: {
      name: tenantData?.name,
      slug: tenantData?.slug,
      city: tenantData?.city,
      state: tenantData?.state,
    },
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  const allowedRoles = ["owner", "admin"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Invitation not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("invitations")
      .delete()
      .eq("token", token)
      .eq("tenant_id", tenantId);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 500 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "admin",
      action: "invite_revoke",
      entityType: "invitation",
      entityId: existing.id,
      beforeData: existing,
    });

    return NextResponse.json({ success: true, message: "Invitation revoked successfully" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

