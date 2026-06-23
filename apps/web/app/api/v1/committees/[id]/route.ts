import { NextResponse } from "next/server";
import { createServiceRoleClient, logAuditEvent, checkRole } from "../../utils";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const allowedRoles = ["owner", "admin"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();
  const committeeId = params.id;

  try {
    const body = await req.json();
    const { name, year, is_active, positions } = body;

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // Check if committee exists and belongs to tenant
    const { data: currentCommittee, error: fetchErr } = await supabase
      .from("committees")
      .select("*")
      .eq("id", committeeId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchErr || !currentCommittee) {
      return NextResponse.json({ message: "Committee not found" }, { status: 404 });
    }

    // 1. If setting active, deactivate others
    if (is_active === true) {
      await supabase
        .from("committees")
        .update({ is_active: false })
        .eq("tenant_id", tenantId);
    }

    // 2. Update committee details
    const { data: updatedCommittee, error: updateErr } = await supabase
      .from("committees")
      .update({
        ...(name !== undefined && { name }),
        ...(year !== undefined && { year: parseInt(year.toString(), 10) }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", committeeId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (updateErr || !updatedCommittee) {
      return NextResponse.json({ message: updateErr?.message || "Failed to update committee" }, { status: 500 });
    }

    // 3. Update positions if provided
    if (positions && Array.isArray(positions)) {
      // Simple strategy: Clear existing positions for this committee and insert new ones
      const { error: deletePosError } = await supabase
        .from("committee_positions")
        .delete()
        .eq("committee_id", committeeId);

      if (deletePosError) {
        return NextResponse.json({ message: deletePosError.message }, { status: 500 });
      }

      // Only insert positions that have a member assigned
      const positionsToInsert = positions
        .filter((pos: any) => pos.member_id)
        .map((pos: any) => ({
          tenant_id: tenantId,
          committee_id: committeeId,
          member_id: pos.member_id,
          position_title: pos.position || pos.name || "Member",
        }));

      if (positionsToInsert.length > 0) {
        const { error: insertPosError } = await supabase
          .from("committee_positions")
          .insert(positionsToInsert);

        if (insertPosError) {
          return NextResponse.json({ message: insertPosError.message }, { status: 500 });
        }
      }
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "admin",
      action: "committee_update",
      entityType: "committee",
      entityId: committeeId,
      beforeData: currentCommittee,
      afterData: updatedCommittee,
    });

    return NextResponse.json(updatedCommittee);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const allowedRoles = ["owner", "admin"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();
  const committeeId = params.id;

  try {
    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const { data: committee, error: fetchErr } = await supabase
      .from("committees")
      .select("*")
      .eq("id", committeeId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchErr || !committee) {
      return NextResponse.json({ message: "Committee not found" }, { status: 404 });
    }

    const { error: deleteErr } = await supabase
      .from("committees")
      .delete()
      .eq("id", committeeId)
      .eq("tenant_id", tenantId);

    if (deleteErr) {
      return NextResponse.json({ message: deleteErr.message }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "admin",
      action: "committee_delete",
      entityType: "committee",
      entityId: committeeId,
      beforeData: committee,
    });

    return NextResponse.json({ message: "Committee deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
