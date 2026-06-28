import { NextResponse } from "next/server";
import { z } from "zod";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent, encryptText, decryptText } from "../../utils";

const updateVendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
  contact_person: z.string().min(1, "Contact person is required").optional(),
  phone: z.string().min(1, "Phone number is required").optional(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  gst_number: z.string().optional().or(z.literal("")).nullable(),
  payment_terms: z.string().optional().or(z.literal("")).nullable(),
  bank_account_number: z.string().optional().or(z.literal("")).nullable(),
  bank_ifsc_code: z.string().optional().or(z.literal("")).nullable(),
  notes: z.string().optional().or(z.literal("")).nullable(),
  status: z.enum(["prospect", "approved", "active", "blacklisted"]).optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const { id } = params;
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

    const { data: vendor, error: dbError } = await supabase
      .from("vendors")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();

    if (dbError || !vendor) {
      return NextResponse.json({ message: dbError?.message || "Vendor not found" }, { status: 404 });
    }

    // Parse notes and payment terms
    let parsedNotes = vendor.notes || "";
    let payment_terms = "";
    try {
      if (vendor.notes && (vendor.notes.startsWith("{") || vendor.notes.startsWith("["))) {
        const parsed = JSON.parse(vendor.notes);
        parsedNotes = parsed.notes || "";
        payment_terms = parsed.payment_terms || "";
      }
    } catch (e) {
      // Ignored
    }

    // Decrypt bank details for admin+ roles if present
    let bank_account_number = "";
    let bank_ifsc_code = "";
    if (vendor.bank_account_encrypted && ["owner", "admin", "treasurer"].includes(member.role)) {
      try {
        const encryptedStr = Buffer.from(vendor.bank_account_encrypted).toString("utf8");
        const decrypted = decryptText(encryptedStr);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          bank_account_number = parsed.bank_account_number || "";
          bank_ifsc_code = parsed.bank_ifsc_code || "";
        }
      } catch (e) {
        console.error("Failed to decrypt bank details:", e);
      }
    }

    const { bank_account_encrypted: _, ...rest } = vendor;

    return NextResponse.json({
      ...rest,
      name: vendor.business_name,
      notes: parsedNotes,
      payment_terms,
      bank_account_number,
      bank_ifsc_code,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;
  const { id } = params;

  try {
    const body = await req.json();
    const result = updateVendorSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.errors },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data: existing, error: fetchError } = await supabase
      .from("vendors")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: fetchError?.message || "Vendor not found" }, { status: 404 });
    }

    // Merge notes and payment terms
    let currentNotes = "";
    let currentTerms = "";
    try {
      if (existing.notes && (existing.notes.startsWith("{") || existing.notes.startsWith("["))) {
        const parsed = JSON.parse(existing.notes);
        currentNotes = parsed.notes || "";
        currentTerms = parsed.payment_terms || "";
      } else {
        currentNotes = existing.notes || "";
      }
    } catch (e) {
      currentNotes = existing.notes || "";
    }

    const newNotes = result.data.notes !== undefined ? result.data.notes : currentNotes;
    const newTerms = result.data.payment_terms !== undefined ? result.data.payment_terms : currentTerms;
    const notesJson = JSON.stringify({
      payment_terms: newTerms || "",
      notes: newNotes || "",
    });

    // Merge bank details
    let bank_account_encrypted = existing.bank_account_encrypted;
    if (result.data.bank_account_number !== undefined || result.data.bank_ifsc_code !== undefined) {
      let currentAcct = "";
      let currentIFSC = "";
      if (existing.bank_account_encrypted) {
        try {
          const encryptedStr = Buffer.from(existing.bank_account_encrypted).toString("utf8");
          const decrypted = decryptText(encryptedStr);
          if (decrypted) {
            const parsed = JSON.parse(decrypted);
            currentAcct = parsed.bank_account_number || "";
            currentIFSC = parsed.bank_ifsc_code || "";
          }
        } catch (e) {
          // Ignored
        }
      }

      const finalAcct = result.data.bank_account_number !== undefined ? result.data.bank_account_number : currentAcct;
      const finalIFSC = result.data.bank_ifsc_code !== undefined ? result.data.bank_ifsc_code : currentIFSC;

      if (finalAcct || finalIFSC) {
        const encrypted = encryptText(JSON.stringify({ bank_account_number: finalAcct || "", bank_ifsc_code: finalIFSC || "" }));
        bank_account_encrypted = encrypted ? Buffer.from(encrypted, "utf8") : null;
      } else {
        bank_account_encrypted = null;
      }
    }

    const {
      name,
      contact_person,
      email,
      phone,
      category,
      gst_number,
      status,
    } = result.data;

    const { data: updated, error: updateError } = await supabase
      .from("vendors")
      .update({
        business_name: name !== undefined ? name : existing.business_name,
        contact_person: contact_person !== undefined ? contact_person : existing.contact_person,
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        category: category !== undefined ? category : existing.category,
        gst_number: gst_number !== undefined ? gst_number : existing.gst_number,
        status: status !== undefined ? status : existing.status,
        notes: notesJson,
        bank_account_encrypted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ message: updateError?.message || "Failed to update vendor" }, { status: 500 });
    }

    // Retrieve active role
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // Log action
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: member?.role || "admin",
      action: "vendor_update",
      entityType: "vendor",
      entityId: updated.id,
      beforeData: existing,
      afterData: updated,
    });

    const { bank_account_encrypted: _, ...sanitized } = updated;

    return NextResponse.json({
      ...sanitized,
      name: updated.business_name,
      notes: newNotes || "",
      payment_terms: newTerms || "",
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;
  const { id } = params;

  const supabase = createServiceRoleClient();

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("vendors")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: fetchError?.message || "Vendor not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("vendors")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 500 });
    }

    // Retrieve active role
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // Log action
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: member?.role || "admin",
      action: "vendor_delete",
      entityType: "vendor",
      entityId: id,
      beforeData: existing,
      afterData: null,
    });

    return NextResponse.json({ message: "Vendor deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
