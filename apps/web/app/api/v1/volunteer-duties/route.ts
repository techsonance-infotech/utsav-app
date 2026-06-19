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

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event_id");

  const supabase = createServiceRoleClient();

  try {
    let query = supabase
      .from("volunteer_duties")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("start_at", { ascending: true });

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    const { data: duties, error: dbError } = await query;

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(duties || []);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const allowedRoles = ["owner", "admin", "committee_member"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();
    const {
      event_id,
      duty_type = "other",
      title,
      description,
      location,
      start_at,
      end_at,
      max_volunteers = 1,
      assigned_to,
    } = body;

    if (!title || !start_at) {
      return NextResponse.json({ message: "Title and Start time are required" }, { status: 400 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const { data: duty, error: insertError } = await supabase
      .from("volunteer_duties")
      .insert({
        tenant_id: tenantId,
        event_id: event_id || null,
        created_by: userId,
        assigned_to: assigned_to || null,
        duty_type,
        title,
        description: description || null,
        location: location || null,
        start_at,
        end_at: end_at || null,
        max_volunteers,
        status: assigned_to ? "assigned" : "open",
      })
      .select()
      .single();

    if (insertError || !duty) {
      return NextResponse.json({ message: insertError?.message || "Failed to create duty" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "committee_member",
      action: "volunteer_duty_create",
      entityType: "volunteer_duty",
      entityId: duty.id,
      afterData: duty,
    });

    return NextResponse.json(duty, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
