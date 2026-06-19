import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      const msg = error?.message || "Invalid credentials";
      if (
        msg.toLowerCase().includes("email not confirmed") || 
        msg.toLowerCase().includes("email not verified")
      ) {
        return NextResponse.json({
          message: "Your email address is not verified. Please check your inbox for the verification link.",
          isUnverified: true,
          email: email
        }, { status: 403 });
      }
      return NextResponse.json({ message: msg }, { status: 401 });
    }

    // Also manually enforce verification if Supabase config allows login without confirmation
    const isGoogleUser = data.user.app_metadata.providers?.includes("google");
    const isVerified = data.user.user_metadata?.is_verified ?? true; // Default true for legacy or non-metadata users
    
    if (!isGoogleUser && (!data.user.email_confirmed_at || isVerified === false)) {
      return NextResponse.json({
        message: "Your email address is not verified. Please check your inbox for the verification link.",
        isUnverified: true,
        email: email
      }, { status: 403 });
    }

    // Fetch user's active tenant membership
    const serviceClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data: membership } = await serviceClient
      .from("tenant_members")
      .select("tenant_id, role, tenants(name, slug)")
      .eq("user_id", data.user.id)
      .eq("status", "active")
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const tenant = membership
      ? {
          id: membership.tenant_id,
          name: (membership as any).tenants?.name || "",
          slug: (membership as any).tenants?.slug || "",
          role: membership.role,
        }
      : null;

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
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
