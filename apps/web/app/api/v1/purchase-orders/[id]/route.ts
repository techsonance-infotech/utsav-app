import { NextResponse } from "next/server";
import { z } from "zod";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent } from "../../utils";

const updatePOSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["draft", "sent", "accepted", "in_progress", "completed", "disputed", "cancelled"]).optional(),
  expected_delivery_date: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  total_amount: z.number().nonnegative().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    qty: z.number().positive(),
    unit_price: z.number().nonnegative(),
    total: z.number().nonnegative(),
  })).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;
  const { id } = params;

  try {
    const body = await req.json();
    const result = updatePOSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.errors },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Fetch existing PO
    const { data: existing, error: fetchError } = await supabase
      .from("purchase_orders")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: fetchError?.message || "Purchase order not found" }, { status: 404 });
    }

    const {
      title,
      description,
      status,
      expected_delivery_date,
      terms,
      total_amount,
      items,
    } = result.data;

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (status !== undefined) {
      updatePayload.status = status;
      if (status === "sent" && !existing.sent_at) {
        updatePayload.sent_at = new Date().toISOString();
      }
      if (status === "accepted" && !existing.accepted_at) {
        updatePayload.accepted_at = new Date().toISOString();
      }
    }
    if (expected_delivery_date !== undefined) updatePayload.delivery_date = expected_delivery_date;
    if (terms !== undefined) updatePayload.terms = terms;
    if (total_amount !== undefined) {
      updatePayload.total_amount = total_amount;
      updatePayload.subtotal = total_amount; // Subtotal aligned with total amount
    }
    if (items !== undefined) updatePayload.line_items = items;

    const { data: updated, error: updateError } = await supabase
      .from("purchase_orders")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ message: updateError?.message || "Failed to update PO" }, { status: 500 });
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
      action: "purchase_order_update",
      entityType: "purchase_order",
      entityId: updated.id,
      beforeData: existing,
      afterData: updated,
    });

    return NextResponse.json({
      ...updated,
      expected_delivery_date: updated.delivery_date,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
