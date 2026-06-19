import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../../../utils";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const channelId = params.id;
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // cursor is created_at ISO string for pagination
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

  const supabase = createServiceRoleClient();

  try {
    // 1. Validate that user is a member of the channel
    const { data: membership, error: memError } = await supabase
      .from("chat_channel_members")
      .select("id")
      .eq("channel_id", channelId)
      .eq("user_id", userId)
      .maybeSingle();

    if (memError || !membership) {
      return NextResponse.json({ message: "Access denied: Not a channel member" }, { status: 403 });
    }

    // 2. Fetch messages
    let query = supabase
      .from("chat_messages")
      .select("*")
      .eq("channel_id", channelId);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: messages, error: messagesError } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (messagesError) {
      return NextResponse.json({ message: messagesError.message }, { status: 500 });
    }

    // Return messages (reversed so they display chronologically on the client)
    const reversed = [...(messages || [])].reverse();

    // Determine next cursor
    const nextCursor = messages && messages.length === limit ? messages[messages.length - 1].created_at : null;

    return NextResponse.json({
      messages: reversed,
      nextCursor,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const channelId = params.id;
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
    const { text, media_url, media_type } = body;

    if (!text && !media_url) {
      return NextResponse.json({ message: "Message cannot be empty" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Validate membership
    const { data: membership, error: memError } = await supabase
      .from("chat_channel_members")
      .select("id")
      .eq("channel_id", channelId)
      .eq("user_id", userId)
      .maybeSingle();

    if (memError || !membership) {
      return NextResponse.json({ message: "Access denied: Not a channel member" }, { status: 403 });
    }

    // Get sender full name
    const { data: senderMember } = await supabase
      .from("tenant_members")
      .select("full_name, avatar_url")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // 2. Insert message
    const { data: message, error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        channel_id: channelId,
        sender_id: userId,
        sender_name: senderMember?.full_name || "Member",
        sender_avatar_url: senderMember?.avatar_url || null,
        message_text: text || null,
        media_url: media_url || null,
        media_type: media_url ? (media_type || "image") : null,
      })
      .select()
      .single();

    if (insertError || !message) {
      return NextResponse.json({ message: insertError?.message || "Failed to send message" }, { status: 500 });
    }

    // 3. Update last_message_at on the channel
    await supabase
      .from("chat_channels")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_text: text ? text.substring(0, 100) : "Media attachment",
      })
      .eq("id", channelId);

    return NextResponse.json(message, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
