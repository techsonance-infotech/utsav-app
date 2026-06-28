import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../utils";
import { z } from "zod";

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
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  let query = supabase
    .from("donations")
    .select("*", { count: "exact" })
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

  if (pageParam) {
    const page = parseInt(pageParam, 10) || 1;
    const limit = parseInt(limitParam || "10", 10) || 10;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: donations, count, error: dbError } = await query;
    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }
    return NextResponse.json({
      data: donations,
      totalCount: count || 0,
      page,
      limit,
    });
  } else {
    const { data: donations, error: dbError } = await query;
    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }
    return NextResponse.json(donations);
  }
}

const CreateDonationSchema = z.object({
  donor_name: z.string().min(1, "Donor name is required"),
  donor_phone: z.string().optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  donor_email: z.string().optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  donor_address: z.string().optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  amount: z.number().positive("Amount must be a positive number"),
  mode: z.string().default("online"),
  campaign_id: z.string().optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  is_anonymous: z.boolean().default(false),
  note: z.string().optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
  status: z.string().optional().nullable().transform((val: string | null | undefined) => val && val.trim() !== "" ? val.trim() : null),
});

export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  try {
    const body = await req.json();

    const parsed = CreateDonationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Validation error", errors: parsed.error.format() }, { status: 400 });
    }

    const validatedData = parsed.data;

    // Validate phone number format if provided
    if (validatedData.donor_phone) {
      const cleaned = validatedData.donor_phone.replace(/\D/g, "");
      const tenDigits = cleaned.length > 10 ? cleaned.slice(-10) : cleaned;
      if (!/^\d{10}$/.test(tenDigits)) {
        return NextResponse.json({ message: "Phone number must be exactly 10 digits" }, { status: 400 });
      }
      validatedData.donor_phone = tenDigits;
    }

    // Validate email format if provided
    if (validatedData.donor_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validatedData.donor_email)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
    }

    const isOffline = ["cash", "cheque", "bank_transfer", "in_kind"].includes(validatedData.mode);

    let userId: string | null = null;
    let memberRole: string | null = null;

    if (isOffline) {
      const { userId: authedId, error } = await verifySession(req);
      if (error) {
        return NextResponse.json({ message: error }, { status: 401 });
      }
      userId = authedId;
    } else {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const { userId: authedId } = await verifySession(req);
        if (authedId) {
          userId = authedId;
        }
      }
    }

    const supabase = createServiceRoleClient();

    if (userId) {
      const { data: member } = await supabase
        .from("tenant_members")
        .select("role")
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .single();
      if (member) {
        memberRole = member.role;
      }
    }

    if (isOffline) {
      const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
      if (!memberRole || !allowedRoles.includes(memberRole)) {
        return NextResponse.json({ message: "Forbidden: Only committee members can record offline donations" }, { status: 403 });
      }

      const finalStatus = validatedData.status || "confirmed";
      const { data: donation, error: dbError } = await supabase
        .from("donations")
        .insert({
          tenant_id: tenantId,
          campaign_id: validatedData.campaign_id,
          recorded_by: userId,
          donor_id: null,
          donor_name: validatedData.donor_name,
          donor_phone: validatedData.donor_phone,
          donor_email: validatedData.donor_email,
          donor_address: validatedData.donor_address,
          amount: validatedData.amount,
          currency: "INR",
          mode: validatedData.mode,
          status: finalStatus,
          is_anonymous: validatedData.is_anonymous,
          is_in_kind: validatedData.mode === "in_kind",
          note: validatedData.note,
          paid_at: finalStatus === "confirmed" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (dbError) {
        return NextResponse.json({ message: dbError.message }, { status: 500 });
      }

      await logAuditEvent({
        tenantId,
        actorId: userId as string,
        actorRole: memberRole as string,
        action: "record_cash_donation",
        entityType: "donation",
        entityId: donation.id,
        afterData: donation,
      });

      return NextResponse.json(donation, { status: 201 });
    } else {
      const { data: donation, error: dbError } = await supabase
        .from("donations")
        .insert({
          tenant_id: tenantId,
          campaign_id: validatedData.campaign_id,
          donor_id: userId || null,
          donor_name: validatedData.donor_name,
          donor_phone: validatedData.donor_phone,
          donor_email: validatedData.donor_email,
          donor_address: validatedData.donor_address,
          amount: validatedData.amount,
          currency: "INR",
          mode: "online",
          status: validatedData.status || "pending",
          is_anonymous: validatedData.is_anonymous,
          note: validatedData.note,
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
