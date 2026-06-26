import { NextResponse } from "next/server";
import { createServiceRoleClient, logSecurityEvent } from "../../utils";
import { z } from "zod";
import { sendEmail, getVerificationEmailTemplate } from "../email-helper";

const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name too long"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(100, "Email too long")
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
  token: z.string().uuid("Invalid invitation token"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json({ message: firstError.message }, { status: 400 });
    }

    const { fullName, phone, email, password, token } = parsed.data;

    const supabase = createServiceRoleClient();

    // 1. Fetch invitation and verify
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
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

    // 2. Generate unique 6-digit verification code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("DEBUG INVITE SIGNUP OTP FOR", email, ":", verificationToken);

    // Create the user via Supabase Auth Admin API (unconfirmed by default)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        phone,
        is_verified: false,
        verification_token: verificationToken,
      },
    });

    if (authError || !authData.user) {
      const msg = authError?.message || "Failed to create user";
      if (msg.includes("already been registered") || msg.includes("already exists")) {
        return NextResponse.json(
          { message: "An account with this email already exists. Please sign in instead." },
          { status: 409 }
        );
      }
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    // 3. Send verification email via Resend
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    try {
      await sendEmail({
        to: email,
        subject: "Verify your Utsav account invitation",
        html: getVerificationEmailTemplate(fullName, verificationToken, email, origin),
      });
    } catch (emailErr) {
      console.error("Failed to send invite verification email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please verify the OTP sent to your email.",
    });
  } catch (err: any) {
    console.error("Invite signup error:", err);
    return NextResponse.json({ message: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
