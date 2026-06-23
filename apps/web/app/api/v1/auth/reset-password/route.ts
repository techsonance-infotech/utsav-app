import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";
import { sendEmail, getResetSuccessEmailTemplate } from "../email-helper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, otp } = body;
    
    if (!email || !password || !otp) {
      return NextResponse.json({ message: "Email, password, and OTP are required" }, { status: 400 });
    }

    // Password strength check
    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 });
    }
    if (password.length > 128) {
      return NextResponse.json({ message: "Password too long" }, { status: 400 });
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ message: "Password must contain at least one uppercase letter" }, { status: 400 });
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ message: "Password must contain at least one lowercase letter" }, { status: 400 });
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ message: "Password must contain at least one number" }, { status: 400 });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return NextResponse.json({ message: "Password must contain at least one special character" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    
    // Find the user by email in Auth
    const { data: usersData, error: findError } = await supabase.auth.admin.listUsers();
    if (findError) {
      return NextResponse.json({ message: findError.message }, { status: 400 });
    }
    
    const targetUser = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!targetUser) {
      return NextResponse.json({ message: "No registered user found with this email address" }, { status: 404 });
    }

    const metadata = targetUser.user_metadata || {};
    const savedOtp = metadata.otp_code;
    const expiresAtStr = metadata.otp_expires;

    if (!savedOtp || savedOtp !== otp) {
      return NextResponse.json({ message: "Invalid OTP code. Please try again." }, { status: 400 });
    }

    if (expiresAtStr && new Date(expiresAtStr) < new Date()) {
      return NextResponse.json({ message: "The OTP code has expired. Please request a new one." }, { status: 400 });
    }

    // Update target user password and clear OTP fields in metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(targetUser.id, {
      password: password,
      user_metadata: {
        ...targetUser.user_metadata,
        otp_code: null,
        otp_expires: null,
      }
    });

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    // Send password reset success email via Resend
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const name = targetUser.user_metadata?.full_name || targetUser.user_metadata?.first_name || "User";
    try {
      await sendEmail({
        to: email,
        subject: "Your Password Has Been Updated",
        html: getResetSuccessEmailTemplate(name, `${origin}/login`),
      });
    } catch (emailErr) {
      console.error("Failed to send password reset success email:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
