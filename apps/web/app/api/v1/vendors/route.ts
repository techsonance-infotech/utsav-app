import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, checkRole, logAuditEvent, encryptText } from "../utils";

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

    if (!member) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { data: vendors, error: dbError } = await supabase
      .from("vendors")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name", { ascending: true });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    // Strip out encrypted bank details from the response for security
    const sanitized = (vendors || []).map((v) => {
      const { bank_account_number, bank_ifsc_code, ...rest } = v;
      return rest;
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
    const {
      name,
      contact_person,
      email,
      phone,
      category,
      address,
      bank_account_number,
      bank_ifsc_code,
      payment_terms,
      gst_number,
    } = body;

    if (!name) {
      return NextResponse.json({ message: "Vendor name is required" }, { status: 400 });
    }

    // Encrypt bank account number and IFSC code
    const encryptedAccount = bank_account_number ? encryptText(bank_account_number) : null;
    const encryptedIFSC = bank_ifsc_code ? encryptText(bank_ifsc_code) : null;

    const supabase = createServiceRoleClient();

    const { data: vendor, error: insertError } = await supabase
      .from("vendors")
      .insert({
        tenant_id: tenantId,
        name,
        contact_person,
        email,
        phone,
        category,
        address,
        bank_account_number: encryptedAccount,
        bank_ifsc_code: encryptedIFSC,
        payment_terms,
        gst_number,
        status: "active",
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

    const { bank_account_number: _, bank_ifsc_code: __, ...sanitized } = vendor;

    return NextResponse.json(sanitized, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
