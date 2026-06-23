import { NextResponse } from "next/server";
import { checkSuperAdmin, createServiceRoleClient, logAuditEvent } from "../../../../utils";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { hasAccess, userId, errorResponse } = await checkSuperAdmin(req);
  if (!hasAccess) return errorResponse!;

  const tenantId = params.id;

  try {
    const body = await req.json();
    const { is_active } = body;

    if (typeof is_active !== "boolean") {
      return NextResponse.json({ message: "is_active must be a boolean" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Check if the tenant exists
    const { data: tenantBefore, error: fetchError } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .single();

    if (fetchError || !tenantBefore) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    // Update tenant status
    const { data: tenantAfter, error: updateError } = await supabase
      .from("tenants")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", tenantId)
      .select()
      .single();

    if (updateError || !tenantAfter) {
      return NextResponse.json({ message: updateError?.message || "Failed to update tenant" }, { status: 500 });
    }

    // Log the Super-Admin action to audit_logs
    await logAuditEvent({
      tenantId: null, // Super-Admin action is system-wide, so tenantId is null or the target tenantId
      actorId: userId,
      actorRole: "super_admin",
      action: is_active ? "tenant_activate" : "tenant_suspend",
      entityType: "tenant",
      entityId: tenantId,
      beforeData: tenantBefore,
      afterData: tenantAfter,
    });

    return NextResponse.json(tenantAfter);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
