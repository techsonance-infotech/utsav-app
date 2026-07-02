import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";
import { sendEmail, getOtpEmailTemplate } from "../email-helper";
import crypto from "crypto";

function obfuscateEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone } = body;
    
    if (!email && !phone) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 });
    }

    let targetEmail = (email || "").trim();
    const serviceClient = createServiceRoleClient();

    // Resolve phone number if provided or if email field looks like a 10-digit number
    const cleanPhone = (phone || email || "").replace(/\D/g, "");
    const isPhoneNumber = cleanPhone.length === 10 && !targetEmail.includes("@");

    if (isPhoneNumber) {
      const { data: member } = await serviceClient
        .from("tenant_members")
        .select("user_id")
        .eq("phone", cleanPhone)
        .limit(1)
        .maybeSingle();

      if (member && member.user_id) {
        const { data: userData } = await serviceClient.auth.admin.getUserById(member.user_id);
        if (userData && userData.user && userData.user.email) {
          targetEmail = userData.user.email;
        } else {
          return NextResponse.json({ message: "No registered user found with this phone number." }, { status: 404 });
        }
      } else {
        return NextResponse.json({ message: "No account found with this phone number." }, { status: 404 });
      }
    }

    if (!targetEmail || !targetEmail.includes("@")) {
      return NextResponse.json({ message: "Invalid email or phone number format" }, { status: 400 });
    }

    // List users to check if user exists in Auth
    const { data: usersData, error: findError } = await serviceClient.auth.admin.listUsers();
    if (findError) {
      return NextResponse.json({ message: findError.message }, { status: 400 });
    }

    const targetUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === targetEmail.toLowerCase()
    );

    if (targetUser) {
      // Generate 6-digit OTP code
      const otp = crypto.randomInt(100000, 1000000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

      // Save OTP code in user metadata
      const { error: updateError } = await serviceClient.auth.admin.updateUserById(targetUser.id, {
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
          to: targetEmail,
          subject: "Your Password Reset OTP",
          html: getOtpEmailTemplate(otp),
        });
      } catch (emailErr) {
        console.error("Failed to send password reset OTP email:", emailErr);
      }
    }

    // Always return success for security (prevents user enumeration) but return target email details if resolved
    const obfuscated = obfuscateEmail(targetEmail);
    return NextResponse.json({
      success: true,
      email: targetEmail,
      message: `If an account exists, a 6-digit OTP has been sent to your registered email: ${obfuscated}`,
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
