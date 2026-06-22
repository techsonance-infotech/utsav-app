import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent, checkRole } from "../../../utils";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  if (!eventId) {
    return NextResponse.json({ message: "Missing event ID" }, { status: 400 });
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
    const { status } = body;

    if (!status || !["attending", "maybe", "not_attending"].includes(status)) {
      return NextResponse.json({ message: "Invalid RSVP status" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Fetch user membership for role reference
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // 2. Fetch event to confirm it exists and hasn't passed RSVP deadline
    const { data: event } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("tenant_id", tenantId)
      .single();

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    if (event.rsvp_deadline && new Date(event.rsvp_deadline) < new Date()) {
      return NextResponse.json({ message: "RSVP deadline has passed" }, { status: 400 });
    }

    // 3. Upsert RSVP record
    const { data: rsvp, error: dbError } = await supabase
      .from("event_rsvps")
      .upsert({
        tenant_id: tenantId,
        event_id: eventId,
        user_id: userId,
        status,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "tenant_id,event_id,user_id"
      })
      .select()
      .single();

    if (dbError || !rsvp) {
      return NextResponse.json({ message: dbError?.message || "Failed to submit RSVP" }, { status: 500 });
    }

    // 4. Log audit log
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: member?.role || "member",
      action: "event_rsvp",
      entityType: "event_rsvp",
      entityId: rsvp.id,
      afterData: rsvp,
    });

    return NextResponse.json(rsvp);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  if (!eventId) {
    return NextResponse.json({ message: "Missing event ID" }, { status: 400 });
  }

  const allowedRoles = ["owner", "admin", "committee_member"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    // 1. Fetch RSVPs for this event
    const { data: rsvps, error: rsvpsError } = await supabase
      .from("event_rsvps")
      .select("*")
      .eq("event_id", eventId)
      .eq("tenant_id", tenantId);

    if (rsvpsError) {
      return NextResponse.json({ message: rsvpsError.message }, { status: 500 });
    }

    if (!rsvps || rsvps.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch member profile info for these users
    const userIds = rsvps.map((r) => r.user_id).filter(Boolean);
    const { data: members, error: membersError } = await supabase
      .from("tenant_members")
      .select("user_id, full_name, avatar_url, role")
      .eq("tenant_id", tenantId)
      .in("user_id", userIds);

    if (membersError) {
      return NextResponse.json({ message: membersError.message }, { status: 500 });
    }

    const membersMap = new Map();
    (members || []).forEach((m) => {
      membersMap.set(m.user_id, m);
    });

    const enrichedRsvps = rsvps.map((r) => {
      const member = membersMap.get(r.user_id);
      return {
        ...r,
        full_name: member?.full_name || "Unknown Member",
        avatar_url: member?.avatar_url || null,
        member_role: member?.role || "member",
      };
    });

    return NextResponse.json(enrichedRsvps);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

