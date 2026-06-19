import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../../utils";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const articleId = params.id;
  if (!articleId) {
    return NextResponse.json({ message: "Missing article ID" }, { status: 400 });
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
    // Increment read_count using SQL increment or by fetching and updating
    const { data: article, error: fetchError } = await supabase
      .from("news_articles")
      .select("read_count")
      .eq("id", articleId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (fetchError || !article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    const { data: updatedArticle, error: updateError } = await supabase
      .from("news_articles")
      .update({
        read_count: (article.read_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId)
      .select()
      .single();

    if (updateError || !updatedArticle) {
      return NextResponse.json({ message: updateError?.message || "Failed to increment read count" }, { status: 500 });
    }

    return NextResponse.json(updatedArticle);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
