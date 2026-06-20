import { NextResponse } from "next/server";
import { createServiceRoleClient } from "../../utils";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail, getVerificationEmailTemplate } from "../email-helper";

// Zod schema for server-side validation
const signupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name too long")
    .regex(/^[a-zA-Z]+$/, "First name must contain only alphabets"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name too long")
    .regex(/^[a-zA-Z]+$/, "Last name must contain only alphabets"),
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
    .max(128, "Password too long")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain a special character"),
  tenantId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Server-side Zod validation
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { message: firstError.message },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, email, password, tenantId } = parsed.data;

    const supabase = createServiceRoleClient();

    // Generate unique 6-digit verification code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("DEBUG SIGNUP OTP FOR", email, ":", verificationToken);

    // Set 14-day trial period
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);

    // Create the user via Supabase Auth Admin API (unconfirmed by default)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Set to false to require email verification
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        phone,
        is_verified: false,
        verification_token: verificationToken,
        trial_expires_at: trialExpiresAt.toISOString(),
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

    // Link user with tenant if tenantId is provided
    if (tenantId) {
      const { error: memberError } = await supabase.from("tenant_members").insert({
        tenant_id: tenantId,
        user_id: authData.user.id,
        role: "member",
        status: "active",
        full_name: `${firstName} ${lastName}`,
        phone: phone,
      });
      if (memberError) {
        console.error("DEBUG SIGNUP: Failed to insert tenant member mapping", memberError);
      }
    }

    // Send verification email via Resend
    const origin = req.headers.get("origin") || "http://localhost:3000";
    try {
      await sendEmail({
        to: email,
        subject: "Verify your Utsav account",
        html: getVerificationEmailTemplate(`${firstName} ${lastName}`, verificationToken, email, origin),
      });
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
      // Do not block registration if email sending fails in developer dev sandbox,
      // but let's still return success with a warning or logs.
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: `${firstName} ${lastName}`,
          phone,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
