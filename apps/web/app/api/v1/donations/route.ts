import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../utils";

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
  const campaignsOnly = searchParams.get("campaigns") === "true";

  const supabase = createServiceRoleClient();

  // Validate requester is a member of the tenant
  const { data: requester, error: requesterError } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .single();

  if (requesterError || !requester) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  // 1. Fetch campaigns if requested (accessible to all members)
  if (campaignsOnly) {
    const { data: campaigns, error: dbError } = await supabase
      .from("donation_campaigns")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }
    return NextResponse.json(campaigns);
  }

  // 2. Fetch donations (restricted to owner, admin, treasurer, committee_member)
  const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
  if (!allowedRoles.includes(requester.role)) {
    return NextResponse.json({ message: "Forbidden: Insufficient privileges to view summaries." }, { status: 403 });
  }

  const campaignId = searchParams.get("campaign_id");
  const status = searchParams.get("status");
  const mode = searchParams.get("mode");
  const search = searchParams.get("search");

  let query = supabase
    .from("donations")
    .select("*")
    .eq("tenant_id", tenantId);

  if (campaignId) {
    query = query.eq("campaign_id", campaignId);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (mode) {
    query = query.eq("mode", mode);
  }
  if (search) {
    query = query.ilike("donor_name", `%${search}%`);
  }

  // Sort by date descending
  query = query.order("created_at", { ascending: false });

  const { data: donations, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ message: dbError.message }, { status: 500 });
  }

  return NextResponse.json(donations);
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
    const {
      donor_name,
      donor_phone,
      donor_email,
      amount,
      mode = "online",
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

    // Check user role
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const isOffline = ["cash", "cheque", "bank_transfer", "in_kind"].includes(mode);

    if (isOffline) {
      // Offline donations can only be recorded by owner, admin, treasurer, or committee_member
      const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
      if (!member || !allowedRoles.includes(member.role)) {
        return NextResponse.json({ message: "Forbidden: Only committee members can record offline donations" }, { status: 403 });
      }

      const { data: donation, error: dbError } = await supabase
        .from("donations")
        .insert({
          tenant_id: tenantId,
          campaign_id: campaign_id || null,
          recorded_by: userId,
          donor_name,
          donor_phone: donor_phone || null,
          donor_email: donor_email || null,
          amount,
          currency: "INR",
          mode,
          status: "confirmed",
          is_anonymous,
          is_in_kind: mode === "in_kind",
          note: note || null,
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        return NextResponse.json({ message: dbError.message }, { status: 500 });
      }

      // Log audit trail
      await logAuditEvent({
        tenantId,
        actorId: userId,
        actorRole: member.role,
        action: "record_cash_donation",
        entityType: "donation",
        entityId: donation.id,
        afterData: donation,
      });

      return NextResponse.json(donation, { status: 201 });
    } else {
      // Online donation (created by any user or visitor, marked pending)
      const { data: donation, error: dbError } = await supabase
        .from("donations")
        .insert({
          tenant_id: tenantId,
          campaign_id: campaign_id || null,
          donor_name,
          donor_phone: donor_phone || null,
          donor_email: donor_email || null,
          amount,
          currency: "INR",
          mode: "online",
          status: "pending",
          is_anonymous,
          note: note || null,
        })
        .select()
        .single();

      if (dbError) {
        return NextResponse.json({ message: dbError.message }, { status: 500 });
      }

      return NextResponse.json(donation, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
