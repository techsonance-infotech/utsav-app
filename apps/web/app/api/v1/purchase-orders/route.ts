import { NextResponse } from "next/server";
import { z } from "zod";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent } from "../utils";

const createPOSchema = z.object({
  vendor_id: z.string().uuid("Invalid Vendor ID"),
  po_number: z.string().optional().or(z.literal("")),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  items: z.array(z.object({
    description: z.string().min(1),
    qty: z.number().positive(),
    unit_price: z.number().nonnegative(),
    total: z.number().nonnegative(),
  })).optional().default([]),
  total_amount: z.number().nonnegative("Total amount must be non-negative"),
  expected_delivery_date: z.string().optional().or(z.literal("")).nullable(),
});

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
    // Check role
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
    if (!member || !allowedRoles.includes(member.role)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { data: pos, error: dbError } = await supabase
      .from("purchase_orders")
      .select("*, vendors(business_name)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    // Map business_name -> name and delivery_date -> expected_delivery_date
    const mapped = (pos || []).map((po: any) => ({
      ...po,
      expected_delivery_date: po.delivery_date,
      vendors: po.vendors
        ? {
            ...po.vendors,
            name: po.vendors.business_name,
          }
        : null,
    }));

    return NextResponse.json(mapped);
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
    const result = createPOSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.errors },
        { status: 400 }
      );
    }

    const {
      vendor_id,
      po_number,
      title,
      description,
      items,
      total_amount,
      expected_delivery_date,
    } = result.data;

    // Auto-generate PO number if not provided
    let finalPoNumber = po_number;
    if (!finalPoNumber) {
      finalPoNumber = `PO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const supabase = createServiceRoleClient();

    // Check if vendor exists under this tenant
    const { data: vendor, error: vendorErr } = await supabase
      .from("vendors")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("id", vendor_id)
      .single();

    if (vendorErr || !vendor) {
      return NextResponse.json({ message: "Vendor not found or access denied" }, { status: 400 });
    }

    const { data: po, error: insertError } = await supabase
      .from("purchase_orders")
      .insert({
        tenant_id: tenantId,
        vendor_id,
        po_number: finalPoNumber,
        title,
        description: description || null,
        subtotal: total_amount, // DB requires subtotal NOT NULL
        gst_amount: 0,
        total_amount,
        delivery_date: expected_delivery_date || null,
        line_items: items,
        status: "draft",
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

    return NextResponse.json(
      {
        ...po,
        expected_delivery_date: po.delivery_date,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
