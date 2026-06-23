import { NextResponse } from "next/server";
import { z } from "zod";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent, encryptText } from "../utils";

const createVendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  category: z.string().min(1, "Category is required"),
  contact_person: z.string().min(1, "Contact person is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  gst_number: z.string().optional().or(z.literal("")),
  payment_terms: z.string().optional().or(z.literal("")),
  bank_account_number: z.string().optional().or(z.literal("")),
  bank_ifsc_code: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
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
    // Check user role
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

    const { data: vendors, error: dbError } = await supabase
      .from("vendors")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("business_name", { ascending: true });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    // Map and sanitize response
    const sanitized = (vendors || []).map((v) => {
      const { bank_account_encrypted, ...rest } = v;
      
      let parsedNotes = v.notes || "";
      let payment_terms = "";
      try {
        if (v.notes && (v.notes.startsWith("{") || v.notes.startsWith("["))) {
          const parsed = JSON.parse(v.notes);
          parsedNotes = parsed.notes || "";
          payment_terms = parsed.payment_terms || "";
        }
      } catch (e) {
        // Not JSON notes
      }

      return {
        ...rest,
        name: v.business_name,
        notes: parsedNotes,
        payment_terms,
      };
    });

    return NextResponse.json(sanitized);
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
    const result = createVendorSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.errors },
        { status: 400 }
      );
    }

    const {
      name,
      contact_person,
      email,
      phone,
      category,
      payment_terms,
      gst_number,
      bank_account_number,
      bank_ifsc_code,
      notes,
    } = result.data;

    // Encrypt bank details into the single bytea field
    let bank_account_encrypted: Buffer | null = null;
    if (bank_account_number || bank_ifsc_code) {
      const bankData = JSON.stringify({
        bank_account_number: bank_account_number || "",
        bank_ifsc_code: bank_ifsc_code || "",
      });
      const encrypted = encryptText(bankData);
      if (encrypted) {
        bank_account_encrypted = Buffer.from(encrypted, "utf8");
      }
    }

    // Embed payment terms inside notes JSON string to persist in DB without schema change
    const notesJson = JSON.stringify({
      payment_terms: payment_terms || "",
      notes: notes || "",
    });

    const supabase = createServiceRoleClient();

    const { data: vendor, error: insertError } = await supabase
      .from("vendors")
      .insert({
        tenant_id: tenantId,
        business_name: name,
        contact_person,
        email: email || null,
        phone: phone || null,
        category: category || "other",
        bank_account_encrypted,
        gst_number: gst_number || null,
        status: "active",
        notes: notesJson,
        created_by: userId,
      })
      .select()
      .single();

    if (insertError || !vendor) {
      return NextResponse.json({ message: insertError?.message || "Failed to create vendor" }, { status: 500 });
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
      action: "vendor_create",
      entityType: "vendor",
      entityId: vendor.id,
      afterData: vendor,
    });

    const { bank_account_encrypted: _, ...sanitized } = vendor;

    return NextResponse.json(
      {
        ...sanitized,
        name: vendor.business_name,
        notes: notes || "",
        payment_terms: payment_terms || "",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
