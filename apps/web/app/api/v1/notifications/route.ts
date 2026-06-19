import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../utils";

export async function GET(req: Request) {
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
    const { data: notifications, error: dbError } = await supabase
      .from("notifications")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(notifications);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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
    const body = await req.json().catch(() => ({}));
    const { id, ids, all } = body;

    let query = supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("tenant_id", tenantId)
      .eq("user_id", userId);

    if (all) {
      // Mark all read
      query = query.eq("is_read", false);
    } else if (ids && Array.isArray(ids)) {
      // Mark multiple read
      query = query.in("id", ids);
    } else if (id) {
      // Mark single read
      query = query.eq("id", id);
    } else {
      return NextResponse.json({ message: "Must provide id, ids, or all parameter" }, { status: 400 });
    }

    const { data, error: updateError } = await query.select();

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
