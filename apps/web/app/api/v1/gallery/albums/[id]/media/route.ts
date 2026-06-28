import { NextResponse } from "next/server";
import { createServiceRoleClient, checkRole, logAuditEvent, uploadBase64ToStorage } from "../../../../utils";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const albumId = params.id;
  const { hasAccess, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer", "committee_member"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    // Validate that the album belongs to the caller's tenant
    const { data: album, error: albumError } = await supabase
      .from("gallery_albums")
      .select("id")
      .eq("id", albumId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (albumError || !album) {
      return NextResponse.json({ message: "Album not found or access denied" }, { status: 404 });
    }

    const { data: media, error: dbError } = await supabase
      .from("gallery_media")
      .select("*")
      .eq("album_id", albumId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    // Fetch user profiles for uploaders
    const uploaderIds = Array.from(new Set((media || []).map((m: any) => m.uploaded_by).filter(Boolean)));
    const uploaderMap = new Map<string, { full_name: string; avatar_url: string | null }>();

    if (uploaderIds.length > 0) {
      const { data: uploaders } = await supabase
        .from("tenant_members")
        .select("user_id, full_name, avatar_url")
        .eq("tenant_id", tenantId)
        .in("user_id", uploaderIds);

      uploaders?.forEach((u: any) => {
        uploaderMap.set(u.user_id, {
          full_name: u.full_name,
          avatar_url: u.avatar_url,
        });
      });
    }

    // Map DB columns back to frontend expected properties
    const mapped = (media || []).map((m: any) => {
      const profile = m.uploaded_by ? uploaderMap.get(m.uploaded_by) : null;
      return {
        ...m,
        media_url: m.url,
        media_type: m.type,
        size_bytes: m.file_size_bytes,
        uploaded_by_name: profile?.full_name || "Mandal Member",
        uploaded_by_avatar: profile?.avatar_url || null,
      };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const albumId = params.id;
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;

  try {
    const body = await req.json();
    const { media_url, media_type = "photo", caption, width, height, size_bytes, youtube_url } = body;

    if (!media_url && !youtube_url) {
      return NextResponse.json({ message: "Media URL or YouTube URL is required" }, { status: 400 });
    }

    let finalMediaUrl = media_url || "";
    if (finalMediaUrl.startsWith("data:")) {
      const { publicUrl, error: uploadError } = await uploadBase64ToStorage(
        tenantId,
        userId,
        finalMediaUrl,
        "gallery"
      );
      if (uploadError || !publicUrl) {
        return NextResponse.json({ message: uploadError || "Failed to upload image" }, { status: 500 });
      }
      finalMediaUrl = publicUrl;
    }

    const supabase = createServiceRoleClient();

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

    // Update album properties if specified
    const albumUpdatePayload: Record<string, any> = {};
    if (body.is_public !== undefined) {
      albumUpdatePayload.is_public = body.is_public;
    }
    if (body.watermark_enabled !== undefined) {
      albumUpdatePayload.watermark_enabled = body.watermark_enabled;
    }
    if (Object.keys(albumUpdatePayload).length > 0) {
      await supabase
        .from("gallery_albums")
        .update(albumUpdatePayload)
        .eq("id", albumId);
    }

    // 1. Insert media row using actual DB columns
    const { data: media, error: insertError } = await supabase
      .from("gallery_media")
      .insert({
        tenant_id: tenantId,
        album_id: albumId,
        url: finalMediaUrl,
        type: youtube_url ? "video" : media_type,
        youtube_url: youtube_url || null,
        caption: caption || null,
        width: width || null,
        height: height || null,
        file_size_bytes: size_bytes || null,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (insertError || !media) {
      return NextResponse.json({ message: insertError?.message || "Failed to add media to album" }, { status: 500 });
    }

    // 2. Increment media count on album
    await supabase
      .from("gallery_albums")
      .update({ media_count: (album.media_count || 0) + 1 })
      .eq("id", albumId);

    // Retrieve user details
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role, full_name, avatar_url")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // Log action
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: member?.role || "admin",
      action: "gallery_media_add",
      entityType: "gallery_media",
      entityId: media.id,
      afterData: media,
    });

    const mapped = {
      ...media,
      media_url: media.url,
      media_type: media.type,
      size_bytes: media.file_size_bytes,
      uploaded_by_name: member?.full_name || "Mandal Member",
      uploaded_by_avatar: member?.avatar_url || null,
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
