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
    const { data: invoices, error: dbError } = await supabase
      .from("vendor_invoices")
      .select("*, vendors(name), purchase_orders(po_number)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(invoices || []);
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
      purchase_order_id,
      invoice_number,
      amount,
      due_date,
      notes,
    } = body;

    if (!vendor_id || !invoice_number || !amount) {
      return NextResponse.json({ message: "Vendor, Invoice Number and Amount are required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: invoice, error: insertError } = await supabase
      .from("vendor_invoices")
      .insert({
        tenant_id: tenantId,
        vendor_id,
        purchase_order_id: purchase_order_id || null,
        invoice_number,
        amount,
        due_date,
        status: "pending",
        notes,
        created_by: userId,
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

    return NextResponse.json(invoice, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
