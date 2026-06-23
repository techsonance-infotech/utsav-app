import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../utils";

export async function POST(req: Request) {
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
    const body = await req.json();
    const { token, platform } = body;

    if (!token || !platform) {
      return NextResponse.json({ message: "Token and Platform are required" }, { status: 400 });
    }

    // Validate if the token is a valid Expo Push Token format
    const isExpoToken = token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken[");
    if (!isExpoToken) {
      return NextResponse.json({ message: "Invalid Expo push token format" }, { status: 400 });
    }

    // Upsert the token to avoid duplicate records
    const { data, error: dbError } = await supabase
      .from("push_tokens")
      .upsert(
        {
          user_id: userId,
          tenant_id: tenantId,
          token,
          platform,
          created_at: new Date().toISOString(),
        },
        { onConflict: "token" }
      )
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
