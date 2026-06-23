"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";

import { AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Supabase client with `detectSessionInUrl: true` will automatically
        // pick up the access_token from the URL hash fragment and set the session.
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("OAuth callback session error:", sessionError);
          setError(sessionError.message);
          return;
        }

        if (!session) {
          // If getSession doesn't find it yet, try listening for auth state change
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (event === "SIGNED_IN" && newSession) {
              await completeLogin(newSession);
              subscription.unsubscribe();
            }
          });

          // Timeout fallback — if no auth event fires within 8 seconds, redirect to login
          setTimeout(() => {
            subscription.unsubscribe();
            setError("Authentication timed out. Please try again.");
          }, 8000);

          return;
        }

        await completeLogin(session);
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        setError(err.message || "An unexpected error occurred during login.");
      }
    };

    const completeLogin = async (session: any) => {
      const user = session.user;
      const accessToken = session.access_token;
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        "";

      // Persist session in localStorage (Google SSO = persistent session)
      if (typeof window !== "undefined") {
        localStorage.setItem("utsav_user_id", user.id);
        localStorage.setItem("utsav_access_token", accessToken);
      }

      // Update Zustand auth store
      setAuth({
        userId: user.id,
        accessToken,
        tenantId: null,
        tenantName: null,
        tenantSlug: null,
        role: null,
      });

      // Check if the user already has a tenant membership via API
      try {
        const res = await fetch(
          `${window.location.origin}/api/v1/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.tenant?.id) {
            // User has an existing tenant — go to dashboard
            setAuth({
              userId: user.id,
              accessToken,
              tenantId: data.tenant.id,
              tenantName: data.tenant.name,
              tenantSlug: data.tenant.slug,
              role: data.tenant.role,
            });

            if (typeof window !== "undefined") {
              localStorage.setItem("utsav_tenant_id", data.tenant.id);
              localStorage.setItem("utsav_tenant_slug", data.tenant.slug);
              localStorage.setItem("utsav_tenant_name", data.tenant.name);
              localStorage.setItem("utsav_role", data.tenant.role);
            }

            if (data.tenant.slug) {
              router.replace(`/${data.tenant.slug}/dashboard`);
            } else {
              router.replace("/dashboard");
            }
            return;
          }
        }
      } catch {
        // API might not have /auth/me yet — that's okay, just proceed to onboarding
      }

      // No tenant found — redirect to onboarding
      router.replace("/onboarding");
    };

    handleOAuthCallback();
  }, [router, setAuth]);

  if (error) {
    return (
      <div className="bg-puja-white min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4 p-xl bg-white border border-sandstone rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 mx-auto mb-lg bg-error-container rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-on-error-container" />
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">
            Authentication Failed
          </h2>
          <p className="font-body-md text-on-surface-variant mb-xl">{error}</p>
          <button
            onClick={() => router.replace("/login")}
            className="w-full py-3 bg-primary text-on-primary font-label-md rounded-xl hover:bg-surface-tint transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-puja-white min-h-screen flex flex-col items-center justify-center gap-lg">
      {/* Loading Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-sandstone border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-primary-container/30 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs">
          Signing you in...
        </h2>
        <p className="font-body-md text-on-surface-variant">
          Please wait while we complete your Google sign-in.
        </p>
      </div>
    </div>
  );
}
