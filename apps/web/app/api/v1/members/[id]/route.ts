import { NextResponse } from "next/server";
import { checkRole, createServiceRoleClient, logAuditEvent } from "../../utils";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Member's unique id (tenant_members.id)

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  // 1. Verify that requester is owner or admin
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin"]);
  if (!hasAccess) return errorResponse!;

  try {
    const body = await req.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ message: "Role is required" }, { status: 400 });
    }

    if (role === "owner") {
      return NextResponse.json({ message: "Owner role cannot be assigned manually." }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 2. Fetch the target member record
    const { data: targetMember } = await supabase
      .from("tenant_members")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (!targetMember) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    // Business Rules checks
    if (targetMember.role === "owner") {
      return NextResponse.json({ message: "The founder/owner role cannot be changed" }, { status: 403 });
    }

    if (targetMember.user_id === userId) {
      return NextResponse.json({ message: "You cannot change your own role" }, { status: 403 });
    }

    // 3. Update role
    const { data: updatedMember, error: updateError } = await supabase
      .from("tenant_members")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedMember) {
      return NextResponse.json(
        { message: updateError?.message || "Failed to update member role" },
        { status: 500 }
      );
    }

    // Get active role of editor
    const { data: editorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // 4. Log role update to audit logs
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: editorMember?.role || "admin",
      action: "member_role_update",
      entityType: "tenant_member",
      entityId: id,
      beforeData: targetMember,
      afterData: updatedMember,
    });

    // 5. Send push notification to target user
    await supabase.from("notifications").insert({
      tenant_id: tenantId,
      user_id: targetMember.user_id,
      type: "role_assigned",
      title: "Role Updated! 🪔",
      body: `Your role has been changed to ${role.toUpperCase()}.`,
      payload: {
        new_role: role,
        assigned_by: userId,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  // 1. Verify requester is owner or admin
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin"]);
  if (!hasAccess) return errorResponse!;

  try {
    const supabase = createServiceRoleClient();

    // 2. Fetch target member
    const { data: targetMember } = await supabase
      .from("tenant_members")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (!targetMember) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    // Business Rules
    if (targetMember.role === "owner") {
      return NextResponse.json({ message: "The founder/owner cannot be removed" }, { status: 403 });
    }

    if (targetMember.user_id === userId) {
      return NextResponse.json({ message: "You cannot remove yourself" }, { status: 403 });
    }

    // 3. Delete from tenant_members
    const { error: deleteError } = await supabase
      .from("tenant_members")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 500 });
    }

    // Get active role of editor
    const { data: editorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // 4. Log removal
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: editorMember?.role || "admin",
      action: "member_remove",
      entityType: "tenant_member",
      entityId: id,
      beforeData: targetMember,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
