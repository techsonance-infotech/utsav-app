import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent, checkRole } from "../utils";

export async function GET(req: Request) {
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
    // 1. Fetch events
    const { data: events, error: dbError } = await supabase
      .from("events")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("start_at", { ascending: true });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    // 2. Fetch user's RSVPs for these events
    const { data: userRSVPs } = await supabase
      .from("event_rsvps")
      .select("event_id, status")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId);

    const rsvpMap: Record<string, string> = {};
    (userRSVPs || []).forEach((r) => {
      rsvpMap[r.event_id] = r.status;
    });

    // 3. For each event, count RSVP summaries
    const { data: rsvpCounts } = await supabase
      .from("event_rsvps")
      .select("event_id, status");

    const countsMap: Record<string, { attending: number; maybe: number; not_attending: number }> = {};
    (rsvpCounts || []).forEach((r) => {
      if (!countsMap[r.event_id]) {
        countsMap[r.event_id] = { attending: 0, maybe: 0, not_attending: 0 };
      }
      if (r.status === "attending" || r.status === "maybe" || r.status === "not_attending") {
        countsMap[r.event_id][r.status as "attending" | "maybe" | "not_attending"]++;
      }
    });

    const enrichedEvents = (events || []).map((evt) => ({
      ...evt,
      user_rsvp: rsvpMap[evt.id] || null,
      rsvp_summary: countsMap[evt.id] || { attending: 0, maybe: 0, not_attending: 0 },
    }));

    return NextResponse.json(enrichedEvents);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Only owners, admins, and committee members can schedule events
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
      title,
      title_hi,
      title_gu,
      description,
      category = "general",
      start_at,
      end_at,
      location_name,
      location_maps_url,
      banner_image_url,
      max_capacity,
      rsvp_required = false,
      rsvp_deadline,
      tags = [],
    } = body;

    if (!title || !start_at) {
      return NextResponse.json({ message: "Title and Start date/time are required" }, { status: 400 });
    }

    // Rejection rule: past start_at rejected
    if (new Date(start_at) < new Date()) {
      return NextResponse.json({ message: "Cannot schedule events in the past" }, { status: 400 });
    }

    // Get actor member role for auditing
    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // Insert event
    const { data: event, error: insertError } = await supabase
      .from("events")
      .insert({
        tenant_id: tenantId,
        created_by: userId,
        title,
        title_hi: title_hi || null,
        title_gu: title_gu || null,
        description: description || null,
        category,
        start_at,
        end_at: end_at || null,
        location_name: location_name || null,
        location_maps_url: location_maps_url || null,
        banner_image_url: banner_image_url || null,
        max_capacity: max_capacity ? Number(max_capacity) : null,
        rsvp_required,
        rsvp_deadline: rsvp_deadline || null,
        tags,
        status: "published", // Event immediately visible to all
      })
      .select()
      .single();

    if (insertError || !event) {
      return NextResponse.json({ message: insertError?.message || "Failed to create event" }, { status: 500 });
    }

    // Log audit log
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "committee_member",
      action: "event_create",
      entityType: "event",
      entityId: event.id,
      afterData: event,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
