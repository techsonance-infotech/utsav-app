import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent } from "../../utils";

export async function GET(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    const { data: albums, error: dbError } = await supabase
      .from("gallery_albums")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(albums || []);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer", "committee_member"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;

  try {
    const body = await req.json();
    const { name, description, is_public = true, cover_image_url } = body;

    if (!name) {
      return NextResponse.json({ message: "Album name is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: album, error: insertError } = await supabase
      .from("gallery_albums")
      .insert({
        tenant_id: tenantId,
        name,
        description: description || null,
        is_public,
        cover_image_url: cover_image_url || null,
        created_by: userId,
      })
      .select()
      .single();

    if (insertError || !album) {
      return NextResponse.json({ message: insertError?.message || "Failed to create album" }, { status: 500 });
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
      action: "gallery_album_create",
      entityType: "gallery_album",
      entityId: album.id,
      afterData: album,
    });

    return NextResponse.json(album, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
