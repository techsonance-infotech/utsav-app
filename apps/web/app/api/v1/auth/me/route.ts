import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../utils";

export async function GET(req: Request) {
  try {
    const { userId, error } = await verifySession(req);
    if (error) {
      return NextResponse.json({ message: error }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Fetch user details from auth
    const { data: userData, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (authError || !userData?.user) {
      return NextResponse.json({ message: authError?.message || "User not found" }, { status: 404 });
    }

    // Fetch tenant membership details
    const { data: membership, error: dbError } = await supabase
      .from("tenant_members")
      .select("tenant_id, role, status, tenants(name, slug)")
      .eq("user_id", userId)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const tenant = membership
      ? {
          id: membership.tenant_id,
          name: (membership as any).tenants?.name || "",
          slug: (membership as any).tenants?.slug || "",
          role: membership.role,
          status: membership.status,
        }
      : null;

    return NextResponse.json({
      user: {
        id: userData.user.id,
        email: userData.user.email,
        full_name: userData.user.user_metadata?.full_name || "",
        phone: userData.user.user_metadata?.phone || "",
      },
      tenant,
    });
  } catch (err: any) {
    console.error("GET auth/me error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
