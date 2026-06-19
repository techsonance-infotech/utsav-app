import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent, checkRole } from "../utils";

export async function GET(req: Request) {
  const { error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    const { data: campaigns, error: dbError } = await supabase
      .from("donation_campaigns")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(campaigns || []);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const allowedRoles = ["owner", "admin"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();
    const {
      name,
      description,
      target_amount,
      start_date,
      end_date,
    } = body;

    if (!name) {
      return NextResponse.json({ message: "Campaign name is required" }, { status: 400 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const { data: campaign, error: insertError } = await supabase
      .from("donation_campaigns")
      .insert({
        tenant_id: tenantId,
        name,
        description: description || null,
        target_amount: target_amount ? Number(target_amount) : null,
        start_date: start_date || new Date().toISOString().split("T")[0],
        end_date: end_date || null,
        is_active: true,
        created_by: userId,
      })
      .select()
      .single();

    if (insertError || !campaign) {
      return NextResponse.json({ message: insertError?.message || "Failed to create campaign" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "admin",
      action: "donation_campaign_create",
      entityType: "donation_campaign",
      entityId: campaign.id,
      afterData: campaign,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
