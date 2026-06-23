import { NextResponse } from "next/server";
import { createServiceRoleClient, checkRole, logAuditEvent } from "../../../utils";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const albumId = params.id;
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();
    const { name, description, cover_image_url, is_public, watermark_enabled } = body;

    // Fetch existing album for audit log before updating
    const { data: oldAlbum } = await supabase
      .from("gallery_albums")
      .select("*")
      .eq("id", albumId)
      .eq("tenant_id", tenantId)
      .single();

    if (!oldAlbum) {
      return NextResponse.json({ message: "Album not found" }, { status: 404 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      updatePayload.title = name;
    }
    if (description !== undefined) {
      updatePayload.description = description || null;
    }
    if (cover_image_url !== undefined) {
      updatePayload.cover_image_url = cover_image_url || null;
    }
    if (is_public !== undefined) {
      updatePayload.is_public = is_public;
    }
    if (watermark_enabled !== undefined) {
      updatePayload.watermark_enabled = watermark_enabled;
    }

    const { data: updatedAlbum, error: updateError } = await supabase
      .from("gallery_albums")
      .update(updatePayload)
      .eq("id", albumId)
      .select()
      .single();

    if (updateError || !updatedAlbum) {
      return NextResponse.json({ message: updateError?.message || "Failed to update album" }, { status: 500 });
    }

    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: member?.role || "admin",
      action: "gallery_album_update",
      entityType: "gallery_album",
      entityId: albumId,
      beforeData: oldAlbum,
      afterData: updatedAlbum,
    });

    const mapped = {
      ...updatedAlbum,
      name: updatedAlbum.title,
    };

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
