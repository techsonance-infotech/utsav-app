import { NextResponse } from "next/server";
import { z } from "zod";
import {
  verifySession,
  createServiceRoleClient,
  checkRole,
  logAuditEvent,
  sanitizeInputText,
} from "../../utils";

const updateDutySchema = z.object({
  duty_type: z
    .enum([
      "entry_management",
      "crowd_control",
      "prasad_distribution",
      "decoration",
      "parking",
      "first_aid",
      "registration_desk",
      "photo_video",
      "other",
    ])
    .optional(),
  title: z.string().min(3).max(100).optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional().nullable(),
  max_volunteers: z.number().int().positive().optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  status: z.enum(["open", "assigned", "completed"]).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const dutyId = params.id;
  const supabase = createServiceRoleClient();

  try {
    const { data: duty, error: dbError } = await supabase
      .from("volunteer_duties")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", dutyId)
      .single();

    if (dbError || !duty) {
      return NextResponse.json(
        { message: dbError?.message || "Volunteer duty not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(duty);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId, error: sessionError } = await verifySession(req);
  if (sessionError) {
    return NextResponse.json({ message: sessionError }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const dutyId = params.id;
  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();
    const result = updateDutySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.errors },
        { status: 400 }
      );
    }

    // Retrieve existing duty
    const { data: existing, error: fetchError } = await supabase
      .from("volunteer_duties")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", dutyId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: fetchError?.message || "Volunteer duty not found" },
        { status: 404 }
      );
    }

    // Retrieve active user role
    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const actorRole = actorMember?.role || "member";
    const allowedAdminRoles = ["owner", "admin", "committee_member"];
    const isActorAdmin = allowedAdminRoles.includes(actorRole);

    // If non-admin is trying to modify administrative fields, block them.
    const keys = Object.keys(body);
    const hasAdminFields = keys.some(
      (k) =>
        k !== "assigned_to" &&
        k !== "status"
    );

    if (!isActorAdmin) {
      if (hasAdminFields) {
        return NextResponse.json(
          { message: "Access denied. Only committee members can modify duty details." },
          { status: 403 }
        );
      }

      // Non-admins can only sign up/cancel themselves
      const newAssignedTo = result.data.assigned_to;
      if (newAssignedTo !== undefined) {
        if (newAssignedTo !== null && newAssignedTo !== userId) {
          return NextResponse.json(
            { message: "You can only assign shifts to yourself." },
            { status: 403 }
          );
        }
        if (newAssignedTo === null && existing.assigned_to !== userId) {
          return NextResponse.json(
            { message: "You can only cancel your own assigned shift." },
            { status: 403 }
          );
        }
      }
    }

    // Sanitize text inputs if they are provided
    const updatePayload: Record<string, any> = {};
    if (result.data.duty_type !== undefined) updatePayload.duty_type = result.data.duty_type;
    if (result.data.title !== undefined) {
      const sanitized = sanitizeInputText(result.data.title);
      if (sanitized.length < 3 || sanitized.length > 100) {
        return NextResponse.json(
          { message: "Title must be between 3 and 100 characters" },
          { status: 400 }
        );
      }
      updatePayload.title = sanitized;
    }
    if (result.data.description !== undefined) {
      updatePayload.description = result.data.description ? sanitizeInputText(result.data.description) : null;
    }
    if (result.data.location !== undefined) {
      updatePayload.location = result.data.location ? sanitizeInputText(result.data.location) : null;
    }
    if (result.data.start_at !== undefined) updatePayload.start_at = result.data.start_at;
    if (result.data.end_at !== undefined) updatePayload.end_at = result.data.end_at;
    if (result.data.max_volunteers !== undefined) updatePayload.max_volunteers = result.data.max_volunteers;
    
    // Assigned to & status logic
    if (result.data.assigned_to !== undefined) {
      updatePayload.assigned_to = result.data.assigned_to;
      if (result.data.status === undefined) {
        updatePayload.status = result.data.assigned_to ? "assigned" : "open";
      }
    }
    if (result.data.status !== undefined) {
      updatePayload.status = result.data.status;
    }

    updatePayload.updated_at = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from("volunteer_duties")
      .update(updatePayload)
      .eq("id", dutyId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { message: updateError?.message || "Failed to update volunteer duty" },
        { status: 500 }
      );
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole,
      action: "volunteer_duty_update",
      entityType: "volunteer_duty",
      entityId: dutyId,
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
  const allowedRoles = ["owner", "admin", "committee_member"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const dutyId = params.id;
  const supabase = createServiceRoleClient();

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("volunteer_duties")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", dutyId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: fetchError?.message || "Volunteer duty not found" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("volunteer_duties")
      .delete()
      .eq("id", dutyId);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 500 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "committee_member",
      action: "volunteer_duty_delete",
      entityType: "volunteer_duty",
      entityId: dutyId,
      beforeData: existing,
      afterData: null,
    });

    return NextResponse.json({ message: "Volunteer duty deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
