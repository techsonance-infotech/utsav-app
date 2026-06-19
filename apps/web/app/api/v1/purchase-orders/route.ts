import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent } from "../utils";

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
    const { data: pos, error: dbError } = await supabase
      .from("purchase_orders")
      .select("*, vendors(name)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(pos || []);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;

  try {
    const body = await req.json();
    const {
      vendor_id,
      po_number,
      title,
      description,
      total_amount,
      expected_delivery_date,
      items = [],
    } = body;

    if (!vendor_id || !title || !po_number) {
      return NextResponse.json({ message: "Vendor, Title and PO Number are required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: po, error: insertError } = await supabase
      .from("purchase_orders")
      .insert({
        tenant_id: tenantId,
        vendor_id,
        po_number,
        title,
        description,
        total_amount,
        status: "draft",
        expected_delivery_date,
        items,
        created_by: userId,
      })
      .select()
      .single();

    if (insertError || !po) {
      return NextResponse.json({ message: insertError?.message || "Failed to create PO" }, { status: 500 });
    }

    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: member?.role || "admin",
      action: "purchase_order_create",
      entityType: "purchase_order",
      entityId: po.id,
      afterData: po,
    });

    return NextResponse.json(po, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
