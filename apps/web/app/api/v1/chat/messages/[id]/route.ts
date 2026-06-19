import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../../utils";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const messageId = params.id;
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();
    const { text, is_deleted } = body;

    // Fetch existing message to check ownership
    const { data: message } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (!message) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    if (message.sender_id !== userId) {
      return NextResponse.json({ message: "Forbidden: You do not own this message" }, { status: 403 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (is_deleted !== undefined) {
      updatePayload.is_deleted = is_deleted;
    }
    if (text !== undefined) {
      updatePayload.message_text = text;
    }

    const { data: updated, error: updateError } = await supabase
      .from("chat_messages")
      .update(updatePayload)
      .eq("id", messageId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ message: updateError?.message || "Failed to update message" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
