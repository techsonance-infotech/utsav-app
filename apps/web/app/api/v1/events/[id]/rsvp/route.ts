import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../../../utils";

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
