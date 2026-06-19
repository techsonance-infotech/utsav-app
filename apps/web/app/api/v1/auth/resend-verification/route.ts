import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";
import crypto from "crypto";
import { sendEmail, getVerificationEmailTemplate } from "../email-helper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // List users to find the one matching email
    const { data: usersData, error: findError } = await supabase.auth.admin.listUsers();
    if (findError) {
      return NextResponse.json({ message: findError.message }, { status: 400 });
    }

    const targetUser = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!targetUser) {
      return NextResponse.json({ message: "No registered user found with this email address" }, { status: 404 });
    }

    // If already verified, return error
    const isGoogleUser = targetUser.app_metadata.providers?.includes("google");
    const isVerified = targetUser.user_metadata?.is_verified ?? false;

    if (targetUser.email_confirmed_at || isVerified || isGoogleUser) {
      return NextResponse.json({ message: "This email address is already verified." }, { status: 400 });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Update user metadata with new token
    const { error: updateError } = await supabase.auth.admin.updateUserById(targetUser.id, {
      user_metadata: {
        ...targetUser.user_metadata,
        verification_token: verificationToken,
      },
    });

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    // Send the email
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const firstName = targetUser.user_metadata?.first_name || "";
    const lastName = targetUser.user_metadata?.last_name || "";
    
    await sendEmail({
      to: email,
      subject: "Verify your Utsav account (Resend)",
      html: getVerificationEmailTemplate(`${firstName} ${lastName}`.trim() || "User", verificationToken, origin),
    });

    return NextResponse.json({
      success: true,
      message: "A new verification link has been sent to your email address.",
    });
  } catch (err: any) {
    console.error("Resend verification error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
