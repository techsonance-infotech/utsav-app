import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent } from "../utils";
import { z } from "zod";

const createTenantSchema = z.object({
  name: z.string().trim().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().trim().min(2, "Subdomain slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  vertical: z.string().trim().min(1, "Vertical is required"),
  city: z.string().trim().min(2, "City / Village is required"),
  state: z.string().trim().min(2, "State is required"),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),
  primary_color: z.string().trim().optional(),
  default_language: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export async function POST(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = createTenantSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors[0]?.message || "Invalid payload parameters" },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      vertical,
      city,
      state,
      address,
      primary_color = "#FF9500",
      default_language = "en",
      description,
    } = result.data;

    const supabase = createServiceRoleClient();

    // 1. Retrieve user metadata or email for full_name & trial details
    const { data: authData } = await supabase.auth.admin.getUserById(userId);
    const email = authData?.user?.email || "owner@utsav.app";
    const userMetadata = authData?.user?.user_metadata || {};
    const fullName = userMetadata.full_name || email.split("@")[0];
    const phone = userMetadata.phone || null;
    const trialExpiresAt = userMetadata.trial_expires_at || null;

    // 2. Verify slug uniqueness
    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingTenant) {
      return NextResponse.json({ message: "Slug is already taken" }, { status: 409 });
    }

    // 3. Insert tenant
    const { data: tenant, error: insertError } = await supabase
      .from("tenants")
      .insert({
        name,
        slug,
        vertical,
        primary_color,
        city,
        state,
        address,
        default_language,
        description,
        is_active: true,
        plan: "trial",
        plan_expires_at: trialExpiresAt,
      })
      .select()
      .single();

    if (insertError || !tenant) {
      return NextResponse.json({ message: insertError?.message || "Failed to create tenant" }, { status: 500 });
    }

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
