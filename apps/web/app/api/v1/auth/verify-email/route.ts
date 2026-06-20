import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";
import { sendEmail, getConfirmationEmailTemplate } from "../email-helper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, email } = body;

    if (!token) {
      return NextResponse.json({ message: "Verification token/code is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // List users to find the matching verification token
    const { data: usersData, error: findError } = await supabase.auth.admin.listUsers();
    if (findError) {
      return NextResponse.json({ message: findError.message }, { status: 400 });
    }

    let targetUser;
    if (email) {
      targetUser = usersData.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase() && u.user_metadata?.verification_token === token
      );
    } else {
      targetUser = usersData.users.find(
        (u) => u.user_metadata?.verification_token === token
      );
    }

    if (!targetUser) {
      return NextResponse.json(
        { message: "Invalid or expired verification code. Please check your email or request a new one." },
        { status: 400 }
      );
    }

    // Update user to verify email
    const { error: updateError } = await supabase.auth.admin.updateUserById(targetUser.id, {
      email_confirm: true, // Confirm email in Supabase Auth
      user_metadata: {
        ...targetUser.user_metadata,
        is_verified: true,
        verification_token: null, // Clear the verification token
      },
    });

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    // Send confirmation email
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const name = targetUser.user_metadata?.full_name || targetUser.user_metadata?.first_name || "User";
    try {
      await sendEmail({
        to: targetUser.email!,
        subject: "Welcome to Utsav — Account Verified",
        html: getConfirmationEmailTemplate(name, `${origin}/login`),
      });
    } catch (emailErr) {
      console.error("Failed to send welcome confirmation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Your email has been verified successfully.",
    });
  } catch (err: any) {
    console.error("Verification error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
