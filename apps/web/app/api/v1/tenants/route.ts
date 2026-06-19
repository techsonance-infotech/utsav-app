import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../utils";

export async function POST(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      slug,
      vertical = "ganpati",
      city,
      state,
      primary_color = "#FF9500",
      default_language = "en",
      description,
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ message: "Name and Slug are required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Verify slug uniqueness
    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingTenant) {
      return NextResponse.json({ message: "Slug is already taken" }, { status: 409 });
    }

    // 2. Insert tenant
    const { data: tenant, error: insertError } = await supabase
      .from("tenants")
      .insert({
        name,
        slug,
        vertical,
        primary_color,
        city,
        state,
        default_language,
        description,
        is_active: true,
      })
      .select()
      .single();

    if (insertError || !tenant) {
      return NextResponse.json({ message: insertError?.message || "Failed to create tenant" }, { status: 500 });
    }

    // 3. Retrieve user metadata or email for full_name
    const { data: authData } = await supabase.auth.admin.getUserById(userId);
    const email = authData?.user?.email || "owner@utsav.app";
    const userMetadata = authData?.user?.user_metadata || {};
    const fullName = userMetadata.full_name || email.split("@")[0];
    const phone = userMetadata.phone || null;

    // 4. Create owner record in tenant_members
    const { error: memberError } = await supabase.from("tenant_members").insert({
      tenant_id: tenant.id,
      user_id: userId,
      role: "owner",
      status: "active",
      full_name: fullName,
      phone: phone,
      preferred_language: default_language,
    });

    if (memberError) {
      // Clean up tenant if owner registration fails
      await supabase.from("tenants").delete().eq("id", tenant.id);
      return NextResponse.json({ message: memberError.message }, { status: 500 });
    }

    // 5. Log audit trail
    await logAuditEvent({
      tenantId: tenant.id,
      actorId: userId,
      actorRole: "owner",
      action: "tenant_create",
      entityType: "tenant",
      entityId: tenant.id,
      afterData: tenant,
    });

    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      role: "owner",
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
