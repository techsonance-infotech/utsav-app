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
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (event === "SIGNED_IN" && newSession) {
              await completeLogin(newSession);
              subscription.unsubscribe();
            }
          });

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

      // 1. Check for pending Google OAuth signup invitations
      let pendingToken = null;
      let pendingName = "";
      let pendingPhone = "";
      if (typeof window !== "undefined") {
        pendingToken = sessionStorage.getItem("utsav_pending_invite_token");
        pendingName = sessionStorage.getItem("utsav_pending_invite_name") || "";
        pendingPhone = sessionStorage.getItem("utsav_pending_invite_phone") || "";
      }

      if (pendingToken) {
        try {
          const linkRes = await fetch(
            `${window.location.origin}/api/v1/auth/accept-google-invite`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                token: pendingToken,
                fullName: pendingName,
                phone: pendingPhone,
              }),
            }
          );

          if (linkRes.ok) {
            sessionStorage.removeItem("utsav_pending_invite_token");
            sessionStorage.removeItem("utsav_pending_invite_name");
            sessionStorage.removeItem("utsav_pending_invite_phone");
          }
        } catch (linkErr) {
          console.error("Failed to link invitation token:", linkErr);
        }
      }

      // Check if user has active/pending tenant membership
      try {
        const res = await fetch(`${window.location.origin}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();

          // If membership is pending, block routing and show info message
          if (data.tenant?.status === "pending") {
            setAuth({
              userId: null,
              accessToken: null,
              tenantId: null,
              tenantName: null,
              tenantSlug: null,
              role: null,
            });

            if (typeof window !== "undefined") {
              localStorage.removeItem("utsav_user_id");
              localStorage.removeItem("utsav_access_token");
              localStorage.removeItem("utsav_tenant_id");
              localStorage.removeItem("utsav_tenant_slug");
              localStorage.removeItem("utsav_tenant_name");
              localStorage.removeItem("utsav_role");
            }

            setError(
              "Your registration was submitted successfully and is pending approval by the Mandal administrators. Once approved, you can log in."
            );
            return;
          }

          if (data.tenant?.id) {
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
              localStorage.setItem("utsav_user_id", user.id);
              localStorage.setItem("utsav_access_token", accessToken);
            }

            if (data.tenant.slug) {
              router.replace(`/${data.tenant.slug}/dashboard`);
            } else {
              router.replace("/dashboard");
            }
            return;
          }
        }
      } catch (err) {
        console.error("Failed to check profile details:", err);
      }

      // Default fallback
      setAuth({
        userId: user.id,
        accessToken,
        tenantId: null,
        tenantName: null,
        tenantSlug: null,
        role: null,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("utsav_user_id", user.id);
        localStorage.setItem("utsav_access_token", accessToken);
      }

      router.replace("/onboarding");
    };

    handleOAuthCallback();
  }, [router, setAuth]);

  if (error) {
    return (
      <div className="bg-puja-white min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4 p-8 bg-white border border-sandstone rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Registration Status
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => router.replace("/login")}
            className="w-full py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-puja-white min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-amber-600/30 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Signing you in...
        </h2>
        <p className="text-sm text-gray-500">
          Please wait while we complete your Google sign-in.
        </p>
      </div>
    </div>
  );
}
