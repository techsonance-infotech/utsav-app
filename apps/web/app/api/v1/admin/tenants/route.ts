import { NextResponse } from "next/server";
import { checkSuperAdmin, createServiceRoleClient } from "../../utils";

export async function GET(req: Request) {
  const { hasAccess, errorResponse } = await checkSuperAdmin(req);
  if (!hasAccess) return errorResponse!;

  const supabase = createServiceRoleClient();

  try {
    // Fetch all tenants
    const { data: tenants, error: dbError } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(tenants);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
