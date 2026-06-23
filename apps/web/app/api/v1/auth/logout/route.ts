import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../utils";

export async function POST(req: Request) {
  try {
    const { userId } = await verifySession(req);
    if (userId) {
      // Invalidate the user's session server-side
      const supabase = createServiceRoleClient();
      await supabase.auth.admin.signOut(userId);
    }
  } catch (err: any) {
    console.error("Server-side logout error:", err);
  }

  return NextResponse.json({ message: "Logged out successfully" });
}
