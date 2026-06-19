import { NextResponse } from "next/server";
import { checkRole, createServiceRoleClient, logAuditEvent } from "../../utils";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  if (!eventId) {
    return NextResponse.json({ message: "Missing event ID" }, { status: 400 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    const { data: event, error: dbError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("tenant_id", tenantId)
      .single();

    if (dbError || !event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Fetch RSVP summary
    const { data: rsvps } = await supabase
      .from("event_rsvps")
      .select("status")
      .eq("event_id", eventId);

    const rsvp_summary = { attending: 0, maybe: 0, not_attending: 0 };
    (rsvps || []).forEach((r) => {
      if (r.status === "attending" || r.status === "maybe" || r.status === "not_attending") {
        rsvp_summary[r.status as "attending" | "maybe" | "not_attending"]++;
      }
    });

    return NextResponse.json({ ...event, rsvp_summary });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = await req.json();

    // Fetch existing event
    const { data: existing, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // Build update payload — only include provided fields
    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    const allowedFields = [
      "title", "title_hi", "title_gu", "description", "category",
      "start_at", "end_at", "location_name", "location_maps_url",
      "banner_image_url", "max_capacity", "rsvp_required", "rsvp_deadline",
      "tags", "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", eventId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ message: updateError?.message || "Failed to update event" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "committee_member",
      action: "event_update",
      entityType: "event",
      entityId: eventId,
      beforeData: existing,
      afterData: updated,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
