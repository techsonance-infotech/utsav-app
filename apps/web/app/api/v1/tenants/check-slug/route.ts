import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Invalid name query parameter" }, { status: 400 });
  }

  // Generate slug
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!baseSlug) {
    return NextResponse.json({ available: false, slug: "", suggestions: [] });
  }

  const supabase = createServiceRoleClient();

  // Check if it exists
  const { data, error } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      available: true,
      slug: baseSlug,
      suggestions: [],
    });
  }

  // Generate suggestions
  const suggestions = [
    `${baseSlug}-${new Date().getFullYear()}`,
    `${baseSlug}-utsav`,
    `${baseSlug}-mandal`,
  ];

  return NextResponse.json({
    available: false,
    slug: baseSlug,
    suggestions,
  });
}
