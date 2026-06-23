import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../../../utils";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const dutyId = params.id;
  if (!dutyId) {
    return NextResponse.json({ message: "Missing duty ID" }, { status: 400 });
  }

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
    // Fetch duty
    const { data: duty, error: fetchError } = await supabase
      .from("volunteer_duties")
      .select("*")
      .eq("id", dutyId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !duty) {
      return NextResponse.json({ message: "Volunteer duty not found" }, { status: 404 });
    }

    // Insert checkin record
    const { data: checkin, error: insertError } = await supabase
      .from("volunteer_checkins")
      .insert({
        tenant_id: tenantId,
        duty_id: dutyId,
        user_id: userId,
        checked_in_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }

    // Update duty status to completed if applicable
    await supabase
      .from("volunteer_duties")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", dutyId);

    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: member?.role || "member",
      action: "volunteer_checkin",
      entityType: "volunteer_checkin",
      entityId: checkin?.id || dutyId,
      afterData: checkin,
    });

    return NextResponse.json(checkin, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
