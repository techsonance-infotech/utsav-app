import { NextResponse } from "next/server";
import { z } from "zod";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent } from "../utils";

const createInvoiceSchema = z.object({
  vendor_id: z.string().uuid("Invalid Vendor ID"),
  purchase_order_id: z.string().uuid().optional().nullable(),
  invoice_number: z.string().min(1, "Invoice number is required"),
  amount: z.number().positive("Amount must be positive"),
  due_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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

    const { data: invoices, error: dbError } = await supabase
      .from("vendor_invoices")
      .select("*, vendors(business_name), purchase_orders(po_number)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    // Map business_name -> name and total_amount -> amount for frontend consumption
    const mapped = (invoices || []).map((inv: any) => ({
      ...inv,
      amount: inv.total_amount,
      vendors: inv.vendors
        ? {
            ...inv.vendors,
            name: inv.vendors.business_name,
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
    const result = createInvoiceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.errors },
        { status: 400 }
      );
    }

    const {
      vendor_id,
      purchase_order_id,
      invoice_number,
      amount,
      due_date,
      notes,
    } = result.data;

    const supabase = createServiceRoleClient();

    // Check if vendor exists
    const { data: vendor, error: vendorErr } = await supabase
      .from("vendors")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("id", vendor_id)
      .single();

    if (vendorErr || !vendor) {
      return NextResponse.json({ message: "Vendor not found or access denied" }, { status: 400 });
    }

    // If PO is specified, verify it
    if (purchase_order_id) {
      const { data: po, error: poErr } = await supabase
        .from("purchase_orders")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("id", purchase_order_id)
        .single();

      if (poErr || !po) {
        return NextResponse.json({ message: "Purchase order not found or access denied" }, { status: 400 });
      }
    }

    const todayDateStr = new Date().toISOString().split("T")[0];

    const { data: invoice, error: insertError } = await supabase
      .from("vendor_invoices")
      .insert({
        tenant_id: tenantId,
        vendor_id,
        po_id: purchase_order_id || null,
        invoice_number,
        invoice_date: todayDateStr, // NOT NULL constraint
        due_date: due_date || null,
        subtotal: amount, // total amount mapped to subtotal
        gst_amount: 0,
        total_amount: amount,
        status: "submitted",
        review_note: notes || null,
      })
      .select()
      .single();

    if (insertError || !invoice) {
      return NextResponse.json({ message: insertError?.message || "Failed to create invoice" }, { status: 500 });
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
      action: "vendor_invoice_create",
      entityType: "vendor_invoice",
      entityId: invoice.id,
      afterData: invoice,
    });

    return NextResponse.json(
      {
        ...invoice,
        amount: invoice.total_amount,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
