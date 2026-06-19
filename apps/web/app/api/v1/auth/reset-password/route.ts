import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";
import { sendEmail, getResetSuccessEmailTemplate } from "../email-helper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
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
