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
      .from("news_articles")
      .select("*")
      .eq("tenant_id", tenantId);

    if (!includeDrafts) {
      query = query.eq("status", "published");
    }

    const { data: articles, error: dbError } = await query.order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(articles);
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
      title_hi,
      title_gu,
      body: articleBody,
      body_hi,
      body_gu,
      excerpt,
      category = "general",
      language = "en",
      banner_image_url,
      tags = [],
      status = "draft",
      allow_comments = false,
    } = body;

    if (!title || !articleBody) {
      return NextResponse.json({ message: "Title and Body are required" }, { status: 400 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const publishDate = status === "published" ? new Date().toISOString() : null;

    const { data: article, error: insertError } = await supabase
      .from("news_articles")
      .insert({
        tenant_id: tenantId,
        author_id: userId,
        title,
        title_hi: title_hi || null,
        title_gu: title_gu || null,
        body: articleBody,
        body_hi: body_hi || null,
        body_gu: body_gu || null,
        excerpt: excerpt || null,
        category,
        language,
        banner_image_url: banner_image_url || null,
        tags,
        status,
        published_at: publishDate,
        allow_comments,
        read_count: 0,
      })
      .select()
      .single();

    if (insertError || !article) {
      return NextResponse.json({ message: insertError?.message || "Failed to create news article" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "committee_member",
      action: "news_article_create",
      entityType: "news_article",
      entityId: article.id,
      afterData: article,
    });

    return NextResponse.json(article, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
