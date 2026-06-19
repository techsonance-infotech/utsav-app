import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const { token } = params;

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Fetch invitation and join with tenant details
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("role, expires_at, used_at, tenants(name, slug, city, state)")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (!invitation) {
    return NextResponse.json({ message: "Invitation not found or invalid" }, { status: 404 });
  }

  if (invitation.used_at) {
    return NextResponse.json({ message: "Invitation has already been used" }, { status: 410 });
  }

  const expiresDate = new Date(invitation.expires_at);
  if (expiresDate < new Date()) {
    return NextResponse.json({ message: "Invitation has expired" }, { status: 410 });
  }

  const tenantData: any = invitation.tenants;

  return NextResponse.json({
    token,
    role: invitation.role,
    tenant: {
      name: tenantData?.name,
      slug: tenantData?.slug,
      city: tenantData?.city,
      state: tenantData?.state,
    },
  });
}
