import { NextResponse } from "next/server";
import { z } from "zod";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent } from "../../utils";

const updateInvoiceSchema = z.object({
  status: z.enum(["submitted", "under_review", "approved", "rejected", "paid"]).optional(),
  review_note: z.string().optional().nullable(),
  invoice_number: z.string().min(1).optional(),
  due_date: z.string().optional().nullable(),
  amount: z.number().positive().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;
  const { id } = params;

  try {
    const body = await req.json();
    const result = updateInvoiceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.errors },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Fetch existing invoice
    const { data: existing, error: fetchError } = await supabase
      .from("vendor_invoices")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: fetchError?.message || "Invoice not found" }, { status: 404 });
    }

    const {
      status,
      review_note,
      invoice_number,
      due_date,
      amount,
    } = result.data;

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (invoice_number !== undefined) updatePayload.invoice_number = invoice_number;
    if (due_date !== undefined) updatePayload.due_date = due_date;
    if (review_note !== undefined) updatePayload.review_note = review_note;
    if (amount !== undefined) {
      updatePayload.total_amount = amount;
      updatePayload.subtotal = amount;
    }

    if (status !== undefined) {
      updatePayload.status = status;
      if (status === "paid" && !existing.paid_at) {
        updatePayload.paid_at = new Date().toISOString();
      }
      if (status === "approved" && !existing.reviewed_by) {
        updatePayload.reviewed_by = userId;
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("vendor_invoices")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ message: updateError?.message || "Failed to update invoice" }, { status: 500 });
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
      action: "vendor_invoice_update",
      entityType: "vendor_invoice",
      entityId: updated.id,
      beforeData: existing,
      afterData: updated,
    });

    return NextResponse.json({
      ...updated,
      amount: updated.total_amount,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
