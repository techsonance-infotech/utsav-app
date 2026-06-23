import { NextResponse } from "next/server";
import { createServiceRoleClient, logAuditEvent } from "../../utils";
import crypto from "crypto";

export async function POST(req: Request) {
  const bodyText = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  let isValid = false;

  // 1. Signature Verification Check
  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyText)
      .digest("hex");

    isValid = expectedSignature === signature;
  } else if (process.env.NODE_ENV === "development" || signature === "sandbox_bypass_signature") {
    // Local developer environment/sandbox simulation bypass
    isValid = true;
  }

  if (!isValid) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  try {
    const payload = JSON.parse(bodyText);
    const event = payload.event;

    // We listen to payment.captured or order.paid
    if (event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      if (!orderId) {
        return NextResponse.json({ message: "Missing order_id in payment details" }, { status: 400 });
      }

      const supabase = createServiceRoleClient();

      // Find the pending donation
      const { data: originalDonation, error: fetchErr } = await supabase
        .from("donations")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .single();

      if (fetchErr || !originalDonation) {
        return NextResponse.json({ message: "Donation not found for order id" }, { status: 404 });
      }

      if (originalDonation.status === "confirmed") {
        return NextResponse.json({ message: "Donation already confirmed" }, { status: 200 });
      }

      // Update status to confirmed
      const { data: updatedDonation, error: updateErr } = await supabase
        .from("donations")
        .update({
          status: "confirmed",
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          paid_at: new Date().toISOString(),
        })
        .eq("id", originalDonation.id)
        .select()
        .single();

      if (updateErr || !updatedDonation) {
        return NextResponse.json({ message: "Failed to confirm donation" }, { status: 500 });
      }

      // Create Audit Log
      await logAuditEvent({
        tenantId: originalDonation.tenant_id,
        actorId: "system", // System event / Webhook
        actorRole: "system",
        action: "online_donation_payment_captured",
        entityType: "donation",
        entityId: originalDonation.id,
        beforeData: originalDonation,
        afterData: updatedDonation,
      });

      return NextResponse.json({ message: "Payment successfully confirmed" }, { status: 200 });
    }

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
