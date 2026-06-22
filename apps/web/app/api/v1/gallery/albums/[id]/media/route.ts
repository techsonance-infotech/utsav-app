import { NextResponse } from "next/server";
import { createServiceRoleClient, checkRole, logAuditEvent } from "../../../../utils";

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

    // Map DB columns back to frontend expected properties
    const mapped = (media || []).map((m: any) => ({
      ...m,
      media_url: m.url,
      media_type: m.type,
      size_bytes: m.file_size_bytes,
    }));

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
    const { media_url, media_type = "image", caption, width, height, size_bytes } = body;

    if (!media_url) {
      return NextResponse.json({ message: "Media URL is required" }, { status: 400 });
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

    // 1. Insert media row using actual DB columns
    const { data: media, error: insertError } = await supabase
      .from("gallery_media")
      .insert({
        tenant_id: tenantId,
        album_id: albumId,
        url: media_url,
        type: media_type,
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

    // Retrieve user role
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
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
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
