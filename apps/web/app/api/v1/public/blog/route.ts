import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ message: "Missing tenant slug parameter" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    // 1. Fetch tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    // 2. Fetch published blog posts for this tenant
    const { data: posts, error: dbError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(posts || []);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
