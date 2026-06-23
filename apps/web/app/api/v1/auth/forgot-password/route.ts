import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";
import { sendEmail, getOtpEmailTemplate } from "../email-helper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // List users to check if user exists
    const { data: usersData, error: findError } = await supabase.auth.admin.listUsers();
    if (findError) {
      return NextResponse.json({ message: findError.message }, { status: 400 });
    }

    const targetUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (targetUser) {
      // Generate 6-digit OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

      // Save OTP code in user metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(targetUser.id, {
        user_metadata: {
          ...targetUser.user_metadata,
          otp_code: otp,
          otp_expires: expires,
        },
      });

      if (updateError) {
        return NextResponse.json({ message: updateError.message }, { status: 400 });
      }

      // Send the OTP email
      try {
        await sendEmail({
          to: email,
          subject: "Your Password Reset OTP",
          html: getOtpEmailTemplate(otp),
        });
      } catch (emailErr) {
        console.error("Failed to send password reset OTP email:", emailErr);
      }
    }

    // Always return success for security (prevents user enumeration)
    return NextResponse.json({
      success: true,
      message: "If an account exists, a 6-digit OTP has been sent to your email.",
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
