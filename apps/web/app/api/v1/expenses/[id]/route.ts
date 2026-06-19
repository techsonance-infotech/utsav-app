import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../utils";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const expenseId = params.id;
  if (!expenseId) {
    return NextResponse.json({ message: "Missing expense ID" }, { status: 400 });
  }

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
    const { data: expense, error: dbError } = await supabase
      .from("expenses")
      .select(`
        *,
        category:expense_categories(id, name, color, icon),
        vendor:vendors(id, name, phone)
      `)
      .eq("id", expenseId)
      .eq("tenant_id", tenantId)
      .single();

    if (dbError || !expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const expenseId = params.id;
  if (!expenseId) {
    return NextResponse.json({ message: "Missing expense ID" }, { status: 400 });
  }

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
    // Fetch existing expense
    const { data: existing } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", expenseId)
      .eq("tenant_id", tenantId)
      .single();

    if (!existing) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    // Only the submitter can edit draft expenses
    if (existing.status !== "draft" && existing.status !== "pending_approval") {
      return NextResponse.json({ message: "Only draft or pending expenses can be edited" }, { status: 400 });
    }

    if (existing.submitted_by !== userId) {
      return NextResponse.json({ message: "Only the submitter can edit this expense" }, { status: 403 });
    }

    const body = await req.json();
    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    const allowedFields = [
      "title", "amount", "category_id", "vendor_id", "description",
      "receipt_url", "expense_date", "payment_mode", "gst_amount",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("expenses")
      .update(updatePayload)
      .eq("id", expenseId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ message: updateError?.message || "Failed to update expense" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
