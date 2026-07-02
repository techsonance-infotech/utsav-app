import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";
import { sendEmail, getConfirmationEmailTemplate } from "../email-helper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, token: otp, invitationToken, tenantSlug, role } = body;

    if (!email || !otp || !invitationToken) {
      return NextResponse.json({ message: "Email, OTP, and invitation token are required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Find user matching email
    const { data: usersData, error: findError } = await supabase.auth.admin.listUsers();
    if (findError) {
      return NextResponse.json({ message: findError.message }, { status: 400 });
    }

    const targetUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!targetUser) {
      return NextResponse.json({ message: "No registered user found with this email address." }, { status: 404 });
    }

    const metadata = targetUser.user_metadata || {};
    const savedOtp = metadata.verification_token;

    if (!savedOtp || savedOtp !== otp) {
      return NextResponse.json({ message: "Invalid OTP code. Please try again." }, { status: 400 });
    }

    // 2. Resolve Tenant and Role
    const isPublicLink = invitationToken === "volunteer" || invitationToken === "member" || invitationToken === "00000000-0000-0000-0000-000000000000";
    let tenantId = null;
    let targetRole = null;
    let invitationId = null;

    if (isPublicLink) {
      if (!tenantSlug || !role) {
        return NextResponse.json({ message: "Tenant slug and role are required for public registration" }, { status: 400 });
      }

      // Constrain public role options server-side to prevent privilege escalation
      let resolvedRole = "member";
      if (role === "volunteer") {
        resolvedRole = "volunteer";
      } else if (role !== "member") {
        return NextResponse.json({ message: "Invalid role specified for public registration" }, { status: 400 });
      }

      const { data: tenant, error: tenantErr } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenantSlug)
        .maybeSingle();

      if (tenantErr || !tenant) {
        return NextResponse.json({ message: "Mandal/Tenant not found" }, { status: 404 });
      }
      tenantId = tenant.id;
      targetRole = resolvedRole;
    } else {
      // Fetch the invitation to verify and link
      const { data: invitation, error: inviteError } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", invitationToken)
        .maybeSingle();

      if (inviteError || !invitation) {
        return NextResponse.json({ message: "Invitation not found or invalid" }, { status: 404 });
      }

      if (invitation.used_at) {
        return NextResponse.json({ message: "This invitation link has already been used" }, { status: 410 });
      }

      if (new Date(invitation.expires_at) < new Date()) {
        return NextResponse.json({ message: "This invitation link has expired" }, { status: 410 });
      }

      tenantId = invitation.tenant_id;
      targetRole = invitation.role;
      invitationId = invitation.id;
    }

    // 3. Update user to verify email
    const { error: updateError } = await supabase.auth.admin.updateUserById(targetUser.id, {
      email_confirm: true,
      user_metadata: {
        ...metadata,
        is_verified: true,
        verification_token: null,
      },
    });

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    // 4. Link user with tenant under "active" status
    const { error: memberError } = await supabase.from("tenant_members").insert({
      tenant_id: tenantId,
      user_id: targetUser.id,
      role: targetRole,
      status: "active", // Active! Allow login immediately.
      full_name: metadata.full_name || targetUser.email!.split("@")[0],
      phone: metadata.phone || null,
    });

    if (memberError) {
      console.error("Failed to link user with tenant:", memberError);
      return NextResponse.json({ message: memberError.message || "Failed to create tenant membership" }, { status: 400 });
    }

    // 5. Mark invitation as used if not a public link
    if (invitationId) {
      const { error: markError } = await supabase
        .from("invitations")
        .update({
          used_at: new Date().toISOString(),
          used_by: targetUser.id,
        })
        .eq("id", invitationId);

      if (markError) {
        console.error("Failed to mark invitation as used:", markError);
      }
    }

    // Send confirmation email
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    try {
      await sendEmail({
        to: targetUser.email!,
        subject: "Welcome to Utsav — Account Verified",
        html: getConfirmationEmailTemplate(metadata.full_name || "User", `${origin}/login`),
      });
    } catch (emailErr) {
      console.error("Failed to send welcome confirmation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Your email has been verified successfully. You can now log in to your account.",
    });
  } catch (err: any) {
    console.error("Verification email invite error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
