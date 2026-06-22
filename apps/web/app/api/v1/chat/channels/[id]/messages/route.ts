import { NextResponse } from "next/server";
import { createServiceRoleClient, checkRole, sanitizeInputText } from "../../../../utils";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const channelId = params.id;
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer", "committee_member"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // cursor is sent_at ISO string for pagination
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
      query = query.lt("sent_at", cursor);
    }

    const { data: messages, error: messagesError } = await query
      .order("sent_at", { ascending: false })
      .limit(limit);

    if (messagesError) {
      return NextResponse.json({ message: messagesError.message }, { status: 500 });
    }

    // 3. Fetch sender profiles for these messages
    const senderIds = Array.from(new Set((messages || []).map((m: any) => m.sender_id)));
    let memberMap = new Map<string, { full_name: string; avatar_url: string | null }>();

    if (senderIds.length > 0) {
      const { data: members } = await supabase
        .from("tenant_members")
        .select("user_id, full_name, avatar_url")
        .eq("tenant_id", tenantId)
        .in("user_id", senderIds);

      members?.forEach((m: any) => {
        memberMap.set(m.user_id, {
          full_name: m.full_name,
          avatar_url: m.avatar_url,
        });
      });
    }

    // 4. Map DB fields to frontend format
    const mappedMessages = (messages || []).map((m: any) => {
      const profile = memberMap.get(m.sender_id);
      return {
        id: m.id,
        channel_id: m.channel_id,
        sender_id: m.sender_id,
        sender_name: profile?.full_name || "Member",
        sender_avatar_url: profile?.avatar_url || null,
        message_text: m.content,
        media_url: m.image_url,
        media_type: m.image_url ? "image" : null,
        is_deleted: m.is_deleted,
        created_at: m.sent_at,
        updated_at: m.sent_at,
      };
    });

    // Return messages reversed (so they display chronologically on the client)
    const reversed = [...mappedMessages].reverse();

    // Determine next cursor
    const nextCursor = messages && messages.length === limit ? messages[messages.length - 1].sent_at : null;

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
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer", "committee_member"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;

  try {
    const body = await req.json();
    const { text, media_url, media_type } = body;

    if (!text && !media_url) {
      return NextResponse.json({ message: "Message cannot be empty" }, { status: 400 });
    }

    const sanitizedText = text ? sanitizeInputText(text) : null;
    if (sanitizedText && sanitizedText.length > 5000) {
      return NextResponse.json({ message: "Message too long (max 5000 characters)" }, { status: 400 });
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

    // Get sender full name & avatar
    const { data: senderMember } = await supabase
      .from("tenant_members")
      .select("full_name, avatar_url")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    // 2. Insert message into DB (using correct columns + tenant_id)
    const { data: message, error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        channel_id: channelId,
        tenant_id: tenantId,
        sender_id: userId,
        content: sanitizedText || null,
        image_url: media_url || null,
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
        last_message_text: sanitizedText ? sanitizedText.substring(0, 100) : "Media attachment",
      })
      .eq("id", channelId);

    // 4. Map the newly inserted record back to the frontend format
    const mapped = {
      id: message.id,
      channel_id: message.channel_id,
      sender_id: message.sender_id,
      sender_name: senderMember?.full_name || "Member",
      sender_avatar_url: senderMember?.avatar_url || null,
      message_text: message.content,
      media_url: message.image_url,
      media_type: message.image_url ? "image" : null,
      is_deleted: message.is_deleted,
      created_at: message.sent_at,
      updated_at: message.sent_at,
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
