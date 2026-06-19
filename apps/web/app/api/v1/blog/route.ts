import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent, checkRole } from "../utils";

export async function GET(req: Request) {
  const { error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const includeDrafts = searchParams.get("includeDrafts") === "true";

  const supabase = createServiceRoleClient();

  try {
    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("tenant_id", tenantId);

    if (!includeDrafts) {
      query = query.eq("status", "published");
    }

    const { data: posts, error: dbError } = await query.order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(posts);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const allowedRoles = ["owner", "admin", "committee_member"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();
    const {
      title,
      subtitle,
      slug,
      body: postBody,
      excerpt,
      cover_image_url,
      category = "other",
      tags = [],
      language = "en",
      status = "draft",
      estimated_read_mins,
      allow_comments = false,
      meta_title,
      meta_description,
    } = body;

    if (!title || !postBody || !slug) {
      return NextResponse.json({ message: "Title, Body, and Slug are required" }, { status: 400 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const publishDate = status === "published" ? new Date().toISOString() : null;

    const { data: post, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        tenant_id: tenantId,
        author_id: userId,
        title,
        subtitle: subtitle || null,
        slug,
        body: postBody,
        excerpt: excerpt || null,
        cover_image_url: cover_image_url || null,
        category,
        tags,
        language,
        status,
        published_at: publishDate,
        estimated_read_mins: estimated_read_mins ? Number(estimated_read_mins) : null,
        allow_comments,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
      })
      .select()
      .single();

    if (insertError || !post) {
      return NextResponse.json({ message: insertError?.message || "Failed to create blog post" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "committee_member",
      action: "blog_post_create",
      entityType: "blog_post",
      entityId: post.id,
      afterData: post,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
