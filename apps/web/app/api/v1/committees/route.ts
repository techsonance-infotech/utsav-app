import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent, checkRole, sanitizeInputText } from "../utils";

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
    // 1. Fetch committees
    const { data: committees, error: dbError } = await supabase
      .from("committees")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    if (!committees || committees.length === 0) {
      return NextResponse.json([]);
    }

    const committeeIds = committees.map((c) => c.id);

    // 2. Fetch positions for these committees
    const { data: positions, error: positionsError } = await supabase
      .from("committee_positions")
      .select("*")
      .in("committee_id", committeeIds);

    if (positionsError) {
      return NextResponse.json({ message: positionsError.message }, { status: 500 });
    }

    // 3. Fetch active/suspended tenant members to join in-memory
    const { data: members, error: membersError } = await supabase
      .from("tenant_members")
      .select("id, user_id, full_name, role, avatar_url")
      .eq("tenant_id", tenantId);

    if (membersError) {
      return NextResponse.json({ message: membersError.message }, { status: 500 });
    }

    // 4. Map and join in-memory
    const membersMap = new Map();
    (members || []).forEach((m) => {
      membersMap.set(m.user_id, m);
    });

    const positionsByCommittee = new Map();
    (positions || []).forEach((pos) => {
      const memberInfo = membersMap.get(pos.member_id);
      const mappedPosition = {
        id: pos.id,
        tenant_id: pos.tenant_id,
        committee_id: pos.committee_id,
        member_id: pos.member_id,
        position: pos.position_title, // map position_title to position for frontend
        tenant_members: memberInfo
          ? {
              id: memberInfo.id,
              full_name: memberInfo.full_name,
              role: memberInfo.role,
              avatar_url: memberInfo.avatar_url,
            }
          : null,
      };

      if (!positionsByCommittee.has(pos.committee_id)) {
        positionsByCommittee.set(pos.committee_id, []);
      }
      positionsByCommittee.get(pos.committee_id).push(mappedPosition);
    });

    const result = committees.map((c) => ({
      ...c,
      committee_positions: positionsByCommittee.get(c.id) || [],
    }));

    return NextResponse.json(result);
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

    const sanitizedName = sanitizeInputText(name);
    if (sanitizedName.length < 3 || sanitizedName.length > 100) {
      return NextResponse.json({ message: "Committee name must be between 3 and 100 characters" }, { status: 400 });
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

    const parsedYear = parseInt(year.toString(), 10) || new Date().getFullYear();

    const { data: committee, error: insertError } = await supabase
      .from("committees")
      .insert({
        tenant_id: tenantId,
        name: sanitizedName,
        year: parsedYear,
        is_active,
        created_by: userId,
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
