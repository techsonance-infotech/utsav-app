import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent, checkRole, sanitizeInputText } from "../utils";
import { z } from "zod";

const eventCreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title too long").transform(val => sanitizeInputText(val)),
  title_hi: z.string().trim().max(100).transform(val => sanitizeInputText(val)).optional().nullable(),
  title_gu: z.string().trim().max(100).transform(val => sanitizeInputText(val)).optional().nullable(),
  description: z.string().trim().max(1000).transform(val => sanitizeInputText(val)).optional().nullable(),
  category: z.enum(["general", "festival", "meeting", "cultural", "pooja", "puja", "aarti", "sports", "prasad_vitran", "volunteer_duty", "visarjan", "other"]).default("general"),
  start_at: z.string().trim().min(1, "Start date is required"),
  end_at: z.string().trim().optional().nullable(),
  location_name: z.string().trim().max(200).transform(val => sanitizeInputText(val)).optional().nullable(),
  location_maps_url: z.string().trim().max(500).transform(val => sanitizeInputText(val)).optional().nullable(),
  banner_image_url: z.string().trim().max(500).transform(val => sanitizeInputText(val)).optional().nullable(),
  max_capacity: z.any().transform(val => {
    if (val === undefined || val === null || val === "") return null;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  }).optional().nullable(),
  rsvp_required: z.any().transform(val => {
    if (val === "true" || val === true) return true;
    return false;
  }).default(false),
  rsvp_deadline: z.string().trim().optional().nullable(),
  tags: z.array(z.string().trim().max(50).transform(val => sanitizeInputText(val))).max(10).optional().default([]),
});

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
      .select("event_id, status")
      .eq("tenant_id", tenantId);

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
    const parsed = eventCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.errors[0].message }, { status: 400 });
    }

    const {
      title,
      title_hi,
      title_gu,
      description,
      category,
      start_at,
      end_at,
      location_name,
      location_maps_url,
      banner_image_url,
      max_capacity,
      rsvp_required,
      rsvp_deadline,
      tags,
    } = parsed.data;

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
