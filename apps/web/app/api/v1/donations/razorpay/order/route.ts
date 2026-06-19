import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../../utils";

export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  // Optional session: if authorization header is provided, associate the user
  let userId: string | null = null;
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const { userId: authedId } = await verifySession(req);
    userId = authedId;
  }

  try {
    const body = await req.json();
    const {
      amount,
      donor_name,
      donor_phone,
      donor_email,
      campaign_id,
      is_anonymous = false,
      note,
    } = body;

    if (!donor_name) {
      return NextResponse.json({ message: "Donor name is required" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Amount must be a positive number" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Fetch tenant details to check for Razorpay integration keys
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("razorpay_key_id, name")
      .eq("id", tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    const amountInPaise = Math.round(amount * 100);
    const keyId = tenant.razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId = "";
    let isMock = true;

    // Trigger real API call if keys are present
    if (keyId && keySecret && !keyId.startsWith("mock_")) {
      try {
        const authHeaderValue = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const response = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeaderValue,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${Math.random().toString(36).substring(2, 12)}`,
          }),
        });

        if (response.ok) {
          const rpOrder = await response.json();
          orderId = rpOrder.id;
          isMock = false;
        } else {
          console.error("Razorpay API rejected request: ", await response.text());
        }
      } catch (rpErr) {
        console.error("Failed to connect to Razorpay, falling back to mock sandbox: ", rpErr);
      }
    }

    if (isMock) {
      // Generate a mock order ID
      orderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Insert pending donation record
    const { data: donation, error: dbError } = await supabase
      .from("donations")
      .insert({
        tenant_id: tenantId,
        campaign_id: campaign_id || null,
        donor_id: userId || null,
        donor_name,
        donor_phone: donor_phone || null,
        donor_email: donor_email || null,
        amount,
        currency: "INR",
        mode: "online",
        status: "pending",
        is_anonymous,
        note: note || null,
        razorpay_order_id: orderId,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      id: orderId,
      amount: amountInPaise,
      currency: "INR",
      key_id: keyId || "mock_key_utsav_sandbox",
      donation_id: donation.id,
      is_mock: isMock,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
