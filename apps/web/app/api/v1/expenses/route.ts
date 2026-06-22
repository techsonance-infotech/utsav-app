import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../utils";
import { z } from "zod";

const CreateExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be a positive number"),
  category_id: z.string().uuid("Invalid category ID").optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  vendor_id: z.string().uuid("Invalid vendor ID").optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  description: z.string().optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  receipt_url: z.string().url("Invalid receipt URL").optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  expense_date: z.string().default(() => new Date().toISOString().split("T")[0]),
  payment_mode: z.enum(["cash", "bank_transfer", "upi", "cheque"]).default("cash"),
  gst_amount: z.number().nonnegative("GST amount must be a positive number").default(0),
}).refine((data) => {
  if (data.amount > 500 && (!data.receipt_url || data.receipt_url.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "A digital receipt upload is mandatory for expenses exceeding ₹500.",
  path: ["receipt_url"],
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

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const supabase = createServiceRoleClient();

  try {
    // Validate requester is a staff member of the tenant
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
    if (!member || !allowedRoles.includes(member.role)) {
      return NextResponse.json({ message: "Access denied: Insufficient privileges to view expense records." }, { status: 403 });
    }

    let query = supabase
      .from("expenses")
      .select(`
        *,
        category:expense_categories(id, name, color, icon),
        vendor:vendors(id, business_name, phone)
      `)
      .eq("tenant_id", tenantId)
      .order("expense_date", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: expenses, error: dbError } = await query;

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(expenses || []);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = CreateExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Validation error", errors: parsed.error.format() }, { status: 400 });
    }

    const validatedData = parsed.data;
    const supabase = createServiceRoleClient();

    // 1. Fetch user membership for role reference and permission check
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
    if (!member || !allowedRoles.includes(member.role)) {
      return NextResponse.json({ message: "Access denied: Insufficient privileges to submit expenses." }, { status: 403 });
    }

    const actorRole = member.role;

    // 2. Insert expense
    const { data: expense, error: insertError } = await supabase
      .from("expenses")
      .insert({
        tenant_id: tenantId,
        submitted_by: userId,
        title: validatedData.title,
        amount: validatedData.amount,
        category_id: validatedData.category_id,
        vendor_id: validatedData.vendor_id,
        description: validatedData.description,
        receipt_url: validatedData.receipt_url,
        expense_date: validatedData.expense_date,
        payment_mode: validatedData.payment_mode,
        gst_amount: validatedData.gst_amount,
        status: "pending_approval", // Defaults to pending_approval on creation
      })
      .select()
      .single();

    if (insertError || !expense) {
      return NextResponse.json({ message: insertError?.message || "Failed to submit expense" }, { status: 500 });
    }

    // 3. Log audit log
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole,
      action: "expense_create",
      entityType: "expense",
      entityId: expense.id,
      afterData: expense,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
