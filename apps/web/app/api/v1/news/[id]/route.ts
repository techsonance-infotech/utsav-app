import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent, checkRole } from "../../utils";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const articleId = params.id;
  if (!articleId) {
    return NextResponse.json({ message: "Missing article ID" }, { status: 400 });
  }

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
    const { data: article, error: dbError } = await supabase
      .from("news_articles")
      .select("*")
      .eq("id", articleId)
      .eq("tenant_id", tenantId)
      .single();

    if (dbError || !article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    // Increment read count
    await supabase
      .from("news_articles")
      .update({ read_count: (article.read_count || 0) + 1 })
      .eq("id", articleId);

    return NextResponse.json({ ...article, read_count: (article.read_count || 0) + 1 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const articleId = params.id;
  if (!articleId) {
    return NextResponse.json({ message: "Missing article ID" }, { status: 400 });
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
      .from("news_articles")
      .select("*")
      .eq("id", articleId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    const allowedFields = [
      "title", "title_hi", "title_gu", "body", "body_hi", "body_gu",
      "excerpt", "category", "language", "banner_image_url", "tags",
      "status", "allow_comments",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    // Set published_at if transitioning to published
    if (body.status === "published" && existing.status !== "published") {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabase
      .from("news_articles")
      .update(updatePayload)
      .eq("id", articleId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ message: updateError?.message || "Failed to update article" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "committee_member",
      action: "news_article_update",
      entityType: "news_article",
      entityId: articleId,
      beforeData: existing,
      afterData: updated,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
