import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent, checkRole } from "../../utils";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const postId = params.id;
  if (!postId) {
    return NextResponse.json({ message: "Missing blog post ID" }, { status: 400 });
  }

  const { error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    const { data: post, error: dbError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .single();

    if (dbError || !post) {
      return NextResponse.json({ message: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const postId = params.id;
  if (!postId) {
    return NextResponse.json({ message: "Missing blog post ID" }, { status: 400 });
  }

  const allowedRoles = ["owner", "admin", "committee_member"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();

    const { data: existing, error: fetchError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Blog post not found" }, { status: 404 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    const allowedFields = [
      "title", "subtitle", "slug", "body", "excerpt", "cover_image_url",
      "category", "tags", "language", "status", "estimated_read_mins",
      "allow_comments", "meta_title", "meta_description",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    if (body.status === "published" && existing.status !== "published") {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabase
      .from("blog_posts")
      .update(updatePayload)
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ message: updateError?.message || "Failed to update blog post" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "committee_member",
      action: "blog_post_update",
      entityType: "blog_post",
      entityId: postId,
      beforeData: existing,
      afterData: updated,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const postId = params.id;
  if (!postId) {
    return NextResponse.json({ message: "Missing blog post ID" }, { status: 400 });
  }

  const allowedRoles = ["owner", "admin", "committee_member"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Blog post not found" }, { status: 404 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", postId)
      .eq("tenant_id", tenantId);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "committee_member",
      action: "blog_post_delete",
      entityType: "blog_post",
      entityId: postId,
      beforeData: existing,
    });

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

