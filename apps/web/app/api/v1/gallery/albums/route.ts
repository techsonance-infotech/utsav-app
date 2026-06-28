import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent, sanitizeInputText } from "../../utils";
import { z } from "zod";

const albumCreateSchema = z.object({
  name: z.string().trim().min(3, "Album name must be at least 3 characters").max(100, "Album name too long").transform(val => sanitizeInputText(val)),
  description: z.string().trim().max(1000).transform(val => sanitizeInputText(val)).optional().nullable(),
  is_public: z.boolean().default(true),
  cover_image_url: z.string().trim().optional().nullable().or(z.literal("")),
  category: z.string().default("others"),
  watermark_enabled: z.boolean().default(false),
});

export async function GET(req: Request) {
  const { hasAccess, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer", "committee_member"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;
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

    // Map title to name for frontend compatibility
    const mapped = (albums || []).map((album: any) => ({
      ...album,
      name: album.title,
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;

  try {
    const body = await req.json();
    const parsed = albumCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, description, is_public, cover_image_url, category, watermark_enabled } = parsed.data;

    const supabase = createServiceRoleClient();

    const { data: album, error: insertError } = await supabase
      .from("gallery_albums")
      .insert({
        tenant_id: tenantId,
        title: name,
        description: description || null,
        is_public,
        cover_image_url: cover_image_url || null,
        category: category.toLowerCase(),
        watermark_enabled,
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

    const mapped = {
      ...album,
      name: album.title,
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
