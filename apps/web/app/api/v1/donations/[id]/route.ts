import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../../utils";
import { z } from "zod";

const UpdateDonationSchema = z.object({
  status: z.enum(["pending", "confirmed", "failed", "refunded"]),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const donationId = params.id;
  if (!donationId) {
    return NextResponse.json({ message: "Missing donation ID" }, { status: 400 });
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
    const { data: donation, error: dbError } = await supabase
      .from("donations")
      .select(`
        *,
        campaign:donation_campaigns(id, name)
      `)
      .eq("id", donationId)
      .eq("tenant_id", tenantId)
      .single();

    if (dbError || !donation) {
      return NextResponse.json({ message: "Donation not found" }, { status: 404 });
    }

    // Role-based security validation
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
    const isStaff = member && allowedRoles.includes(member.role);
    const isDonor = donation.donor_id === userId;

    if (!isStaff && !isDonor) {
      return NextResponse.json({ message: "Access denied: Insufficient privileges to view transaction receipt details." }, { status: 403 });
    }

    return NextResponse.json(donation);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const donationId = params.id;
  if (!donationId) {
    return NextResponse.json({ message: "Missing donation ID" }, { status: 400 });
  }

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
    const parsed = UpdateDonationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Validation error", errors: parsed.error.format() }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Verify requesting user is allowed to update donations
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const allowedRoles = ["owner", "admin", "treasurer"];
    if (!member || !allowedRoles.includes(member.role)) {
      return NextResponse.json({ message: "Forbidden: Only owners, admins, or treasurers can update transaction statuses." }, { status: 403 });
    }

    const { data: donation, error: dbError } = await supabase
      .from("donations")
      .select("*")
      .eq("id", donationId)
      .eq("tenant_id", tenantId)
      .single();

    if (dbError || !donation) {
      return NextResponse.json({ message: "Donation not found" }, { status: 404 });
    }

    const updatePayload: Record<string, any> = {
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    };

    // If status is transitioning to confirmed, also set paid_at if not set
    if (parsed.data.status === "confirmed" && !donation.paid_at) {
      updatePayload.paid_at = new Date().toISOString();
      // Generate receipt number if not exists
      if (!donation.receipt_number) {
        updatePayload.receipt_number = `RCPT-${Math.floor(Math.random() * 90000) + 10000}`;
      }
    }

    const { data: updatedDonation, error: updateError } = await supabase
      .from("donations")
      .update(updatePayload)
      .eq("id", donationId)
      .select()
      .single();

    if (updateError || !updatedDonation) {
      return NextResponse.json({ message: updateError?.message || "Failed to update donation status" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: member.role,
      action: "manual_donation_status_update",
      entityType: "donation",
      entityId: donationId,
      beforeData: donation,
      afterData: updatedDonation,
    });

    return NextResponse.json(updatedDonation);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
