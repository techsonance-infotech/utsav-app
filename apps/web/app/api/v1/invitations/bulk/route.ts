import { NextResponse } from "next/server";
import { checkRole, createServiceRoleClient, logAuditEvent } from "../../utils";
import crypto from "crypto";

export async function POST(req: Request) {
  const allowedRoles = ["owner", "admin"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();
    const { invitees } = body; // Array: [{ full_name, email, phone, role }]

    if (!invitees || !Array.isArray(invitees) || invitees.length === 0) {
      return NextResponse.json({ message: "Invitees list is required and must be a non-empty array" }, { status: 400 });
    }

    // Retrieve tenant details for origin slug URL mapping
    const { data: tenant } = await supabase
      .from("tenants")
      .select("slug")
      .eq("id", tenantId)
      .single();

    if (!tenant) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Build invitations records list
    const invitationRecords = invitees.map((inv: any) => ({
      tenant_id: tenantId,
      created_by: userId,
      role: inv.role || "member",
      email: inv.email || null,
      phone: inv.phone || null,
      invitee_name: inv.full_name || inv.invitee_name || null,
      expires_at: expiresAt.toISOString(),
      token: crypto.randomUUID(),
      is_bulk: true,
    }));

    const { data: invitations, error: dbError } = await supabase
      .from("invitations")
      .insert(invitationRecords)
      .select();

    if (dbError || !invitations) {
      return NextResponse.json({ message: dbError?.message || "Failed to create bulk invitations" }, { status: 500 });
    }

    // Append origin link mapping to response payload
    const host = req.headers.get("host") || "";
    let baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "utsav.techsonance.co.in";
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      baseDomain = host;
    }
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || baseDomain.includes("localhost");
    const domainPart = isLocal ? `${tenant.slug}.localhost:3000` : `${tenant.slug}.${baseDomain}`;
    const protocol = isLocal ? "http" : "https";

    const mappedInvitations = invitations.map((inv: any) => ({
      ...inv,
      link: `${protocol}://${domainPart}/join/${inv.token}?name=${encodeURIComponent(inv.invitee_name || "")}&phone=${encodeURIComponent(inv.phone || "")}&role=${inv.role}`,
    }));

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "admin",
      action: "invite_bulk_create",
      entityType: "invitation",
      entityId: "bulk",
      afterData: mappedInvitations,
    });

    return NextResponse.json(mappedInvitations, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
