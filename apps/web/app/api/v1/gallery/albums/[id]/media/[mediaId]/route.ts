import { NextResponse } from "next/server";
import { createServiceRoleClient, checkRole, logAuditEvent } from "../../../../../utils";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; mediaId: string } }
) {
  const albumId = params.id;
  const mediaId = params.mediaId;

  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    // Validate that the album belongs to the caller's tenant and get media count
    const { data: album, error: albumError } = await supabase
      .from("gallery_albums")
      .select("id, media_count")
      .eq("id", albumId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (albumError || !album) {
      return NextResponse.json({ message: "Album not found or access denied" }, { status: 404 });
    }

    // 1. Fetch the media item to verify it exists and log it
    const { data: media } = await supabase
      .from("gallery_media")
      .select("*")
      .eq("id", mediaId)
      .eq("album_id", albumId)
      .single();

    if (!media) {
      return NextResponse.json({ message: "Media file not found" }, { status: 404 });
    }

    // 2. Delete media row
    const { error: deleteError } = await supabase
      .from("gallery_media")
      .delete()
      .eq("id", mediaId);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 500 });
    }

    // 3. Decrement media count on album
    const newCount = Math.max((album.media_count || 0) - 1, 0);
    await supabase
      .from("gallery_albums")
      .update({ media_count: newCount })
      .eq("id", albumId);

    // Retrieve user role
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // Log audit event
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: member?.role || "admin",
      action: "gallery_media_delete",
      entityType: "gallery_media",
      entityId: mediaId,
      beforeData: media,
    });

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
