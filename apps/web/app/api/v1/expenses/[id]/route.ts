import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../../utils";
import { z } from "zod";

const UpdateExpenseSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  amount: z.number().positive("Amount must be a positive number").optional(),
  category_id: z.string().uuid("Invalid category ID").optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  vendor_id: z.string().uuid("Invalid vendor ID").optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  description: z.string().optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  receipt_url: z.string().optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  expense_date: z.string().optional(),
  payment_mode: z.enum(["cash", "bank_transfer", "upi", "cheque"]).optional(),
  gst_amount: z.number().nonnegative("GST amount must be a positive number").optional(),
});

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
        vendor:vendors(id, business_name, phone)
      `)
      .eq("id", expenseId)
      .eq("tenant_id", tenantId)
      .single();

    if (dbError || !expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    // Fetch requester's member role
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
    const isStaff = member && allowedRoles.includes(member.role);
    const isSubmitter = expense.submitted_by === userId;

    if (!isStaff && !isSubmitter) {
      return NextResponse.json({ message: "Access denied: Insufficient privileges to view this expense record." }, { status: 403 });
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
    const parsed = UpdateExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Validation error", errors: parsed.error.format() }, { status: 400 });
    }

    const validatedData = parsed.data;

    // Process receipt upload if it's base64 data
    let uploadedReceiptUrl = validatedData.receipt_url;

    if (uploadedReceiptUrl && uploadedReceiptUrl.startsWith("data:image/")) {
      const matches = uploadedReceiptUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const type = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        let ext = "jpg";
        if (type === "image/png") ext = "png";
        else if (type === "image/webp") ext = "webp";

        const filePath = `${tenantId}/${userId}/receipt_${Date.now()}.${ext}`;

        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some((b) => b.name === "receipts");
          if (!bucketExists) {
            await supabase.storage.createBucket("receipts", { public: true });
          }

          const { error: uploadError } = await supabase.storage
            .from("receipts")
            .upload(filePath, buffer, {
              contentType: type,
              upsert: true,
            });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from("receipts")
              .getPublicUrl(filePath);
            uploadedReceiptUrl = urlData.publicUrl;
          } else {
            console.error("Receipt upload failed:", uploadError);
            return NextResponse.json({ message: `Receipt upload failed: ${uploadError.message || uploadError}` }, { status: 400 });
          }
        } catch (storageErr: any) {
          console.error("Receipt storage operation failed:", storageErr);
          return NextResponse.json({ message: `Receipt storage operation failed: ${storageErr.message || storageErr}` }, { status: 500 });
        }
      } else {
        return NextResponse.json({ message: "Invalid base64 receipt data format" }, { status: 400 });
      }
    }

    // Enforce receipt rule post-merge
    const finalAmount = validatedData.amount !== undefined ? validatedData.amount : Number(existing.amount);
    const finalReceipt = uploadedReceiptUrl !== undefined ? uploadedReceiptUrl : existing.receipt_url;

    if (finalAmount > 500 && (!finalReceipt || finalReceipt.trim() === "")) {
      return NextResponse.json({ message: "A digital receipt upload is mandatory for expenses exceeding ₹500." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    const allowedFields = [
      "title", "amount", "category_id", "vendor_id", "description",
      "expense_date", "payment_mode", "gst_amount",
    ];

    for (const field of allowedFields) {
      if (validatedData[field as keyof typeof validatedData] !== undefined) {
        updatePayload[field] = validatedData[field as keyof typeof validatedData];
      }
    }

    if (uploadedReceiptUrl !== undefined) {
      updatePayload.receipt_url = uploadedReceiptUrl;
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

    // Log audit log
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: member?.role || "committee_member",
      action: "expense_update",
      entityType: "expense",
      entityId: expenseId,
      beforeData: existing,
      afterData: updated,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
