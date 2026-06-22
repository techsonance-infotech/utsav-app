import { NextResponse } from "next/server";
import { checkRole, createServiceRoleClient, logAuditEvent, sanitizeInputText } from "../../utils";
import { z } from "zod";

const eventUpdateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title too long").transform(val => sanitizeInputText(val)).optional(),
  title_hi: z.string().trim().max(100).transform(val => sanitizeInputText(val)).optional().nullable(),
  title_gu: z.string().trim().max(100).transform(val => sanitizeInputText(val)).optional().nullable(),
  description: z.string().trim().max(1000).transform(val => sanitizeInputText(val)).optional().nullable(),
  category: z.enum(["general", "festival", "meeting", "cultural", "pooja", "other"]).optional(),
  start_at: z.string().trim().optional(),
  end_at: z.string().trim().optional().nullable(),
  location_name: z.string().trim().max(200).transform(val => sanitizeInputText(val)).optional().nullable(),
  location_maps_url: z.string().trim().max(500).transform(val => sanitizeInputText(val)).optional().nullable(),
  banner_image_url: z.string().trim().max(500).transform(val => sanitizeInputText(val)).optional().nullable(),
  max_capacity: z.any().transform(val => {
    if (val === undefined) return undefined;
    if (val === null || val === "") return null;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  }).optional().nullable(),
  rsvp_required: z.any().transform(val => {
    if (val === undefined) return undefined;
    if (val === "true" || val === true) return true;
    return false;
  }).optional(),
  rsvp_deadline: z.string().trim().optional().nullable(),
  tags: z.array(z.string().trim().max(50).transform(val => sanitizeInputText(val))).max(10).optional(),
  status: z.enum(["draft", "published", "cancelled"]).optional(),
});

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
    const parsed = eventUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

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
    for (const key in data) {
      if ((data as any)[key] !== undefined) {
        updatePayload[key] = (data as any)[key];
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

export async function DELETE(
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
    // 1. Fetch existing event for audit logging
    const { data: existing, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Get actor member role for audit log
    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // 2. Delete event
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("tenant_id", tenantId);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 500 });
    }

    // 3. Log audit log
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "committee_member",
      action: "event_delete",
      entityType: "event",
      entityId: eventId,
      beforeData: existing,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

