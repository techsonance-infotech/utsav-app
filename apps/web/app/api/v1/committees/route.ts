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
    // Fetch committees
    const { data: committees, error: dbError } = await supabase
      .from("committees")
      .select(`
        *,
        committee_positions (
          *,
          tenant_members (
            id,
            full_name,
            role,
            avatar_url
          )
        )
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(committees || []);
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
    const { name, year = new Date().getFullYear().toString(), is_active = true } = body;

    if (!name) {
      return NextResponse.json({ message: "Committee name is required" }, { status: 400 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // If setting active, deactivate others
    if (is_active) {
      await supabase
        .from("committees")
        .update({ is_active: false })
        .eq("tenant_id", tenantId);
    }

    const { data: committee, error: insertError } = await supabase
      .from("committees")
      .insert({
        tenant_id: tenantId,
        name,
        year,
        is_active,
      })
      .select()
      .single();

    if (insertError || !committee) {
      return NextResponse.json({ message: insertError?.message || "Failed to create committee" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "admin",
      action: "committee_create",
      entityType: "committee",
      entityId: committee.id,
      afterData: committee,
    });

    return NextResponse.json(committee, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
