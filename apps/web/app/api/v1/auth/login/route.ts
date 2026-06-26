import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient, logSecurityEvent } from "../../utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, tenantId } = body;

    if (!email || !password) {
      await logSecurityEvent(req, {
        action: "auth_login_failed",
        status: "failure",
        details: { reason: "Missing email or password" },
      });
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    let loginEmail = (email || "").trim();

    // Check if the input is a phone number (10 digits, not containing '@')
    const cleanInput = loginEmail.replace(/\D/g, "");
    if (cleanInput.length === 10 && !loginEmail.includes("@")) {
      const serviceClient = createServiceRoleClient();
      const { data: member, error: dbError } = await serviceClient
        .from("tenant_members")
        .select("user_id")
        .eq("phone", cleanInput)
        .limit(1)
        .maybeSingle();

      if (member && member.user_id) {
        const { data: userData, error: userError } = await serviceClient.auth.admin.getUserById(member.user_id);
        if (userData && userData.user && userData.user.email) {
          loginEmail = userData.user.email;
        } else {
          await logSecurityEvent(req, {
            action: "auth_login_failed",
            status: "failure",
            details: { phone: cleanInput, reason: "User record not found in Auth" },
          });
          return NextResponse.json({ message: "No user found associated with this phone number." }, { status: 401 });
        }
      } else {
        await logSecurityEvent(req, {
          action: "auth_login_failed",
          status: "failure",
          details: { phone: cleanInput, reason: "No account found with this phone number" },
        });
        return NextResponse.json({ message: "No account found with this phone number." }, { status: 401 });
      }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });

    if (error || !data.session) {
      const msg = error?.message || "Invalid credentials";
      if (
        msg.toLowerCase().includes("email not confirmed") || 
        msg.toLowerCase().includes("email not verified")
      ) {
        await logSecurityEvent(req, {
          action: "auth_login_unverified",
          status: "warning",
          details: { email: loginEmail },
        });
        return NextResponse.json({
          message: "Your email address is not verified. Please check your inbox for the verification link.",
          isUnverified: true,
          email: loginEmail
        }, { status: 403 });
      }
      await logSecurityEvent(req, {
        action: "auth_login_failed",
        status: "failure",
        details: { email: loginEmail, reason: msg },
      });
      return NextResponse.json({ message: msg }, { status: 401 });
    }

    // Also manually enforce verification if Supabase config allows login without confirmation
    const isGoogleUser = data.user.app_metadata.providers?.includes("google");
    const isVerified = data.user.user_metadata?.is_verified ?? true; // Default true for legacy or non-metadata users
    
    if (!isGoogleUser && (!data.user.email_confirmed_at || isVerified === false)) {
      await logSecurityEvent(req, {
        action: "auth_login_unverified",
        status: "warning",
        details: { email: loginEmail, userId: data.user.id },
      });
      return NextResponse.json({
        message: "Your email address is not verified. Please check your inbox for the verification link.",
        isUnverified: true,
        email: loginEmail
      }, { status: 403 });
    }

    // Fetch user's active tenant membership
    const serviceClient = createServiceRoleClient();

    // Check if user has any pending memberships
    const { data: pendingMemberships } = await serviceClient
      .from("tenant_members")
      .select("status")
      .eq("user_id", data.user.id)
      .eq("status", "pending");

    if (pendingMemberships && pendingMemberships.length > 0) {
      const { data: activeMemberships } = await serviceClient
        .from("tenant_members")
        .select("status")
        .eq("user_id", data.user.id)
        .eq("status", "active");

      if (!activeMemberships || activeMemberships.length === 0) {
        await logSecurityEvent(req, {
          action: "auth_login_pending",
          status: "failure",
          details: { email: loginEmail, userId: data.user.id, reason: "Account is pending approval" },
        });
        return NextResponse.json({
          message: "Your account is not approved yet. Please contact your organization owner or admin."
        }, { status: 403 });
      }
    }

    // Auto-associate user with tenant if not already a member
    if (tenantId) {
      const { data: existingMember } = await serviceClient
         .from("tenant_members")
         .select("id")
         .eq("tenant_id", tenantId)
         .eq("user_id", data.user.id)
         .maybeSingle();

      if (!existingMember) {
        const { error: linkError } = await serviceClient.from("tenant_members").insert({
          tenant_id: tenantId,
          user_id: data.user.id,
          role: "member",
          status: "active",
          full_name: data.user.user_metadata?.full_name || loginEmail.split("@")[0],
          phone: data.user.user_metadata?.phone || null,
        });
        if (linkError) {
          console.error("DEBUG LOGIN: Failed to auto-link user on login:", linkError);
        }
      }
    }

    const membershipQuery = serviceClient
      .from("tenant_members")
      .select("tenant_id, role, tenants(name, slug)")
      .eq("user_id", data.user.id)
      .eq("status", "active");

    if (tenantId) {
      membershipQuery.eq("tenant_id", tenantId);
    } else {
      membershipQuery.order("joined_at", { ascending: true }).limit(1);
    }

    const { data: membership, error: dbError } = await membershipQuery.maybeSingle();

    console.log("DEBUG LOGIN: User ID =", data.user.id);
    console.log("DEBUG LOGIN: Query Result =", membership);
    if (dbError) {
      console.error("DEBUG LOGIN: Database Error =", dbError);
    }

    const tenant = membership
      ? {
          id: membership.tenant_id,
          name: (membership as any).tenants?.name || "",
          slug: (membership as any).tenants?.slug || "",
          role: membership.role,
        }
      : null;

    console.log("DEBUG LOGIN: Resolved Tenant =", tenant);

    await logSecurityEvent(req, {
      action: "auth_login_success",
      userId: data.user.id,
      tenantId: tenant?.id || null,
      status: "success",
      details: { email: loginEmail },
    });

    return NextResponse.json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || "",
      },
      tenant,
    });
  } catch (err: any) {
    await logSecurityEvent(req, {
      action: "auth_login_exception",
      status: "failure",
      details: { error: err.message },
    });
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
