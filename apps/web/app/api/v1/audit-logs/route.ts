import { NextResponse } from "next/server";
import { checkRole, createServiceRoleClient } from "../utils";

export async function GET(req: Request) {
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // UUID or timestamp
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const supabase = createServiceRoleClient();

  try {
    let query = supabase
      .from("audit_logs")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: logs, error: dbError } = await query;

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    let nextCursor: string | null = null;
    let hasMore = false;
    const results = logs || [];

    if (results.length > limit) {
      hasMore = true;
      const lastItem = results[limit - 1];
      nextCursor = lastItem.created_at;
    }

    const data = results.slice(0, limit);

    return NextResponse.json({
      data,
      nextCursor,
      hasMore,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
