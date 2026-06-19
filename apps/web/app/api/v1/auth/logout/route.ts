import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../utils";

export async function POST(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  try {
    // Invalidate the user's session server-side
    const supabase = createServiceRoleClient();
    await supabase.auth.admin.signOut(userId);

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (err: any) {
    // Even if server-side logout fails, the client will clear its token
    return NextResponse.json({ message: "Logged out" });
  }
}
