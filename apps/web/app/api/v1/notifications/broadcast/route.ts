import { NextResponse } from "next/server";
import { checkRole, createServiceRoleClient } from "../../utils";

export async function POST(req: Request) {
  const allowedRoles = ["owner", "admin", "committee_member"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();
    const {
      title,
      title_hi,
      title_gu,
      body: messageBody,
      body_hi,
      body_gu,
      target_role,
      payload = {},
    } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ message: "Title and Body are required" }, { status: 400 });
    }

    // 1. Fetch target members
    let memberQuery = supabase
      .from("tenant_members")
      .select("user_id, preferred_language")
      .eq("tenant_id", tenantId)
      .eq("status", "active");

    if (target_role) {
      memberQuery = memberQuery.eq("role", target_role);
    }

    const { data: members, error: membersError } = await memberQuery;
    if (membersError) {
      return NextResponse.json({ message: membersError.message }, { status: 500 });
    }

    if (!members || members.length === 0) {
      return NextResponse.json({ sent: 0, message: "No active target users found" });
    }

    const userIds = members.map((m) => m.user_id);

    // 2. Insert in-app notifications
    const insertPayloads = members.map((m) => ({
      tenant_id: tenantId,
      user_id: m.user_id,
      type: "general_broadcast",
      title,
      title_hi: title_hi || null,
      title_gu: title_gu || null,
      body: messageBody,
      body_hi: body_hi || null,
      body_gu: body_gu || null,
      payload: payload,
      is_read: false,
    }));

    const { error: insertError } = await supabase.from("notifications").insert(insertPayloads);
    if (insertError) {
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }

    // 3. Fetch active push tokens
    const { data: pushTokens, error: tokensError } = await supabase
      .from("push_tokens")
      .select("token, user_id")
      .in("user_id", userIds);

    if (tokensError) {
      console.error("Failed to query push tokens:", tokensError);
    }

    let pushSentCount = 0;
    if (pushTokens && pushTokens.length > 0) {
      // Create push messages
      const pushMessages = pushTokens.map((pt) => {
        // Find member language
        const member = members.find((m) => m.user_id === pt.user_id);
        const lang = member?.preferred_language || "en";

        // Localize message content
        let pushTitle = title;
        let pushBody = messageBody;

        if (lang === "hi" && title_hi && body_hi) {
          pushTitle = title_hi;
          pushBody = body_hi;
        } else if (lang === "gu" && title_gu && body_gu) {
          pushTitle = title_gu;
          pushBody = body_gu;
        }

        return {
          to: pt.token,
          sound: "default",
          title: pushTitle,
          body: pushBody,
          data: payload,
        };
      });

      // Chunk push notifications to Expo API in sizes of 100
      const chunkSize = 100;
      for (let i = 0; i < pushMessages.length; i += chunkSize) {
        const chunk = pushMessages.slice(i, i + chunkSize);
        try {
          const res = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(chunk),
          });
          if (res.ok) {
            pushSentCount += chunk.length;
          } else {
            console.error("Expo Push Notification request failed:", await res.text());
          }
        } catch (pushErr) {
          console.error("Expo Push send error:", pushErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      in_app_count: userIds.length,
      push_count: pushSentCount,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
