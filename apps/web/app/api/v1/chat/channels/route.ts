import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../../utils";

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
    // Fetch user channels through chat_channel_members
    const { data: memberships, error: dbError } = await supabase
      .from("chat_channel_members")
      .select("channel_id")
      .eq("user_id", userId);

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    const channelIds = (memberships || []).map((m) => m.channel_id);
    if (channelIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch the actual channels
    const { data: channels, error: channelsError } = await supabase
      .from("chat_channels")
      .select("*")
      .eq("tenant_id", tenantId)
      .in("id", channelIds)
      .order("last_message_at", { ascending: false });

    if (channelsError) {
      return NextResponse.json({ message: channelsError.message }, { status: 500 });
    }

    return NextResponse.json(channels || []);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
    const { name, type = "group", member_ids = [] } = body;

    if (type === "group" && !name) {
      return NextResponse.json({ message: "Group name is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Create channel record
    const { data: channel, error: insertError } = await supabase
      .from("chat_channels")
      .insert({
        tenant_id: tenantId,
        name: type === "direct" ? null : name,
        type,
        created_by: userId,
      })
      .select()
      .single();

    if (insertError || !channel) {
      return NextResponse.json({ message: insertError?.message || "Failed to create channel" }, { status: 500 });
    }

    // 2. Add creator and other members
    const allMembers = Array.from(new Set([userId, ...member_ids]));
    const membershipRows = allMembers.map((mId) => ({
      channel_id: channel.id,
      user_id: mId,
    }));

    const { error: membersError } = await supabase
      .from("chat_channel_members")
      .insert(membershipRows);

    if (membersError) {
      // Clean up channel if member insert fails
      await supabase.from("chat_channels").delete().eq("id", channel.id);
      return NextResponse.json({ message: membersError.message }, { status: 500 });
    }

    // Get creator membership role
    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // Log action
    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "member",
      action: "chat_channel_create",
      entityType: "chat_channel",
      entityId: channel.id,
      afterData: channel,
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
