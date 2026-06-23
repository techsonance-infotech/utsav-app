import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;
    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // List users to find the one matching email
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
    const savedOtp = metadata.otp_code;
    const expiresAtStr = metadata.otp_expires;

    if (!savedOtp || savedOtp !== otp) {
      return NextResponse.json({ message: "Invalid OTP code. Please try again." }, { status: 400 });
    }

    if (expiresAtStr && new Date(expiresAtStr) < new Date()) {
      return NextResponse.json({ message: "The OTP code has expired. Please request a new one." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
