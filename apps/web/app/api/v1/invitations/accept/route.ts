import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../../utils";

export async function POST(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Fetch and validate invitation
    const { data: invitation, error: fetchError } = await supabase
      .from("invitations")
      .select("*, tenants(name)")
      .eq("token", token)
      .maybeSingle();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { message: fetchError?.message || "Invitation not found or invalid" },
        { status: 404 }
      );
    }

    if (invitation.used_at) {
      return NextResponse.json({ message: "Invitation has already been used" }, { status: 410 });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ message: "Invitation has expired" }, { status: 410 });
    }

    const tenantId = invitation.tenant_id;
    const role = invitation.role;
    const tenantName = (invitation.tenants as any)?.name || "Mandal";

    // 2. Fetch user metadata/email for member record
    const { data: authData } = await supabase.auth.admin.getUserById(userId);
    const email = authData?.user?.email || "member@utsav.app";
    const fullName = authData?.user?.user_metadata?.full_name || email.split("@")[0];

    // 3. Check if user is already a member
    const { data: existingMember } = await supabase
      .from("tenant_members")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { message: "You are already a member of this organization" },
        { status: 409 }
      );
    }

    // 4. Insert into tenant_members
    const { data: newMember, error: memberError } = await supabase
      .from("tenant_members")
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        role,
        status: "active",
        full_name: fullName,
        preferred_language: "en",
      })
      .select()
      .single();

    if (memberError || !newMember) {
      return NextResponse.json(
        { message: memberError?.message || "Failed to create membership" },
        { status: 500 }
      );
    }

    // 5. Update invitation to mark as used
    await supabase
      .from("invitations")
      .update({
        used_at: new Date().toISOString(),
        used_by: userId,
      })
      .eq("id", invitation.id);

    // 6. Send welcome notification
    await supabase.from("notifications").insert({
      tenant_id: tenantId,
      user_id: userId,
      type: "role_assigned",
      title: "Welcome to Utsav! 🪔",
      body: `Welcome to ${tenantName}! Your role has been configured as ${role.toUpperCase()}.`,
      payload: {
        new_role: role,
        assigned_by: invitation.created_by,
      },
    });

    // 7. Log audit trail
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: role,
      action: "invite_accept",
      entityType: "tenant_member",
      entityId: newMember.id,
      afterData: newMember,
    });

    return NextResponse.json({
      success: true,
      tenantId,
      role,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
