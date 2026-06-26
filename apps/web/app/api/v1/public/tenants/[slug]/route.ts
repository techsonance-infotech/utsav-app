import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../../utils";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("id, name, slug, city, state")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !tenant) {
      return NextResponse.json({ message: "Mandal not found" }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
