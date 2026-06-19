import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../utils";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const donationId = params.id;
  if (!donationId) {
    return NextResponse.json({ message: "Missing donation ID" }, { status: 400 });
  }

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
    const { data: donation, error: dbError } = await supabase
      .from("donations")
      .select(`
        *,
        campaign:donation_campaigns(id, name)
      `)
      .eq("id", donationId)
      .eq("tenant_id", tenantId)
      .single();

    if (dbError || !donation) {
      return NextResponse.json({ message: "Donation not found" }, { status: 404 });
    }

    return NextResponse.json(donation);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
