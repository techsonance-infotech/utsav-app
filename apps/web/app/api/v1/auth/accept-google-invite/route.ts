import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, token: inviteToken, fullName, phone } = body;

    if (!userId || !inviteToken) {
      return NextResponse.json({ message: "User ID and invitation token are required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Fetch user details
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData?.user) {
      return NextResponse.json({ message: userError?.message || "User not found" }, { status: 404 });
    }

    // 2. Fetch invitation and verify
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", inviteToken)
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

    // Check if they are already a member of this tenant
    const { data: existingMember } = await supabase
      .from("tenant_members")
      .select("id, status")
      .eq("tenant_id", invitation.tenant_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMember) {
      // If already active or pending, just mark invitation used and return success
      await supabase
        .from("invitations")
        .update({
          used_at: new Date().toISOString(),
          used_by: userId,
        })
        .eq("id", invitation.id);

      return NextResponse.json({
        success: true,
        message: "You are already a member of this Mandal.",
      });
    }

    // 3. Link user with tenant under "pending" status
    const metadata = userData.user.user_metadata || {};
    const finalFullName = fullName || metadata.full_name || metadata.name || userData.user.email!.split("@")[0];
    const finalPhone = phone || metadata.phone || null;

    const { error: memberError } = await supabase.from("tenant_members").insert({
      tenant_id: invitation.tenant_id,
      user_id: userId,
      role: invitation.role,
      status: "pending", // Pending admin/owner approval!
      full_name: finalFullName,
      phone: finalPhone,
    });

    if (memberError) {
      console.error("Failed to link user with tenant:", memberError);
      return NextResponse.json({ message: memberError.message || "Failed to create tenant membership" }, { status: 400 });
    }

    // 4. Mark invitation as used
    const { error: markError } = await supabase
      .from("invitations")
      .update({
        used_at: new Date().toISOString(),
        used_by: userId,
      })
      .eq("id", invitation.id);

    if (markError) {
      console.error("Failed to mark invitation as used:", markError);
    }

    // Update user metadata in Supabase to confirm name & phone if not already present
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...metadata,
        full_name: finalFullName,
        phone: finalPhone,
        is_verified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your registration is submitted and pending approval. Once approved by the administrator, you can log in.",
    });
  } catch (err: any) {
    console.error("Google invite accept error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
