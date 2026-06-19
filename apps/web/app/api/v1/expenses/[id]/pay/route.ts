import { NextResponse } from "next/server";
import { checkRole, createServiceRoleClient, logAuditEvent } from "../../../utils";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const expenseId = params.id;
  if (!expenseId) {
    return NextResponse.json({ message: "Missing expense ID" }, { status: 400 });
  }

  // 1. Role gate: only owner, admin, and treasurer can record payment of expenses
  const allowedRoles = ["owner", "admin", "treasurer"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    // 2. Fetch the target expense
    const { data: expense, error: fetchError } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", expenseId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (fetchError || !expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    if (expense.status !== "approved") {
      return NextResponse.json(
        { message: `Only approved expenses can be recorded as paid. Current status: ${expense.status}` },
        { status: 400 }
      );
    }

    // Get actor member role for auditing
    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // 3. Update expense to paid
    const { data: updatedExpense, error: updateError } = await supabase
      .from("expenses")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", expenseId)
      .select()
      .single();

    if (updateError || !updatedExpense) {
      return NextResponse.json({ message: updateError?.message || "Failed to mark expense as paid" }, { status: 500 });
    }

    // 4. Log audit log
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "treasurer",
      action: "expense_pay",
      entityType: "expense",
      entityId: expenseId,
      beforeData: expense,
      afterData: updatedExpense,
    });

    return NextResponse.json(updatedExpense);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
