import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent } from "../../../../utils";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const albumId = params.id;
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  try {
    const { data: media, error: dbError } = await supabase
      .from("gallery_media")
      .select("*")
      .eq("album_id", albumId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(media || []);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const albumId = params.id;
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer", "committee_member"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;

  try {
    const body = await req.json();
    const { media_url, media_type = "image", caption, width, height, size_bytes } = body;

    if (!media_url) {
      return NextResponse.json({ message: "Media URL is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Insert media row
    const { data: media, error: insertError } = await supabase
      .from("gallery_media")
      .insert({
        tenant_id: tenantId,
        album_id: albumId,
        media_url,
        media_type,
        caption: caption || null,
        width: width || null,
        height: height || null,
        size_bytes: size_bytes || null,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (insertError || !media) {
      return NextResponse.json({ message: insertError?.message || "Failed to add media to album" }, { status: 500 });
    }

    // 2. Increment media count on album
    const { data: album } = await supabase
      .from("gallery_albums")
      .select("media_count")
      .eq("id", albumId)
      .single();

    await supabase
      .from("gallery_albums")
      .update({ media_count: (album?.media_count || 0) + 1 })
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

    return NextResponse.json(media, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
