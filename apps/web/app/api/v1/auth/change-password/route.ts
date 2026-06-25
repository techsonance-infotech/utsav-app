import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../utils";
import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain a special character");

export async function POST(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: "Current and new password are required." }, { status: 400 });
    }

    // Validate new password rules
    const validation = passwordRule.safeParse(newPassword);
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Get user email
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    if (getUserError || !userData || !userData.user || !userData.user.email) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const email = userData.user.email;

    // 2. Validate old password by attempting signIn
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });

    if (signInError) {
      return NextResponse.json({ message: "Incorrect current password." }, { status: 400 });
    }

    // 3. Update password (Supabase Auth hashes it securely!)
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully!" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
