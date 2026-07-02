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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [joinedTenantName, setJoinedTenantName] = useState("");
  const [joinedTenantSlug, setJoinedTenantSlug] = useState("");
  const [joinedRole, setJoinedRole] = useState("");
  const [userFullName, setUserFullName] = useState("");

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

      setUserFullName(fullName);

      // 1. Check for pending Google OAuth signup invitations (check query params first, then fallback to sessionStorage)
      let pendingToken = null;
      let pendingName = "";
      let pendingPhone = "";
      let pendingTenantSlug = "";
      let pendingRole = "";

      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        pendingToken = searchParams.get("invite_token") || sessionStorage.getItem("utsav_pending_invite_token");
        pendingName = searchParams.get("invite_name") || sessionStorage.getItem("utsav_pending_invite_name") || "";
        pendingPhone = searchParams.get("invite_phone") || sessionStorage.getItem("utsav_pending_invite_phone") || "";
        pendingTenantSlug = searchParams.get("tenant_slug") || sessionStorage.getItem("utsav_pending_invite_tenant_slug") || "";
        pendingRole = searchParams.get("role") || sessionStorage.getItem("utsav_pending_invite_role") || "";
      }

      let inviteAccepted = false;

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
                fullName: pendingName || fullName,
                phone: pendingPhone,
                tenantSlug: pendingTenantSlug || undefined,
                role: pendingRole || undefined,
              }),
            }
          );

          if (linkRes.ok) {
            inviteAccepted = true;
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("utsav_pending_invite_token");
              sessionStorage.removeItem("utsav_pending_invite_name");
              sessionStorage.removeItem("utsav_pending_invite_phone");
              sessionStorage.removeItem("utsav_pending_invite_tenant_slug");
              sessionStorage.removeItem("utsav_pending_invite_role");
            }
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

            // If we just successfully joined via the portal invitation, show the premium confirmation screen!
            if (inviteAccepted || pendingToken) {
              setJoinedTenantName(data.tenant.name);
              setJoinedTenantSlug(data.tenant.slug);
              setJoinedRole(data.tenant.role);
              setShowConfirmation(true);
              return;
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
  }, [router, setAuth, joinedTenantSlug]);

  const handleGoToDashboard = () => {
    const host = window.location.host;
    const protocol = window.location.protocol;
    
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      router.replace(`/${joinedTenantSlug}/dashboard`);
    } else {
      let baseDomain = "utsav.techsonance.co.in";
      if (host.includes("techsonance.co.in")) {
        baseDomain = "utsav.techsonance.co.in";
      } else {
        const parts = host.split(".");
        if (parts.length > 2) {
          baseDomain = parts.slice(1).join(".");
        } else {
          baseDomain = host;
        }
      }
      window.location.href = `${protocol}//${joinedTenantSlug}.${baseDomain}/dashboard`;
    }
  };

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

  const roleLabelMap: Record<string, string> = {
    admin: "Committee Member",
    treasurer: "Treasurer",
    volunteer: "Volunteer",
    member: "Devotee / Member",
  };
  const roleDisplay = roleLabelMap[joinedRole] || joinedRole.toUpperCase();

  if (showConfirmation) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-100 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white border border-amber-200 rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden animate-fade-in">
          {/* Decorative traditional border/graphics */}
          <div className="absolute -top-12 -left-12 w-32 h-32 opacity-10 bg-amber-500 rounded-full"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 opacity-10 bg-orange-500 rounded-full"></div>
          
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold text-3xl">
            ॐ
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Welcome to Utsav!
          </h2>
          <p className="text-sm text-amber-700 font-medium mb-6">
            Dear {userFullName}, your account has been successfully created.
          </p>

          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex justify-between border-b border-amber-100/60 pb-2">
              <span className="text-xs text-amber-800/70 font-semibold uppercase">Mandal / Organization</span>
              <span className="text-sm text-gray-900 font-bold">{joinedTenantName}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-xs text-amber-800/70 font-semibold uppercase">Your Associated Role</span>
              <span className="text-sm text-gray-900 font-bold">{roleDisplay}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            You can now proceed to manage your Mandal, coordinate events, and track donations. We highly recommend using the Utsav mobile app for real-time alerts and convenient collections.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGoToDashboard}
              className="flex-1 py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/20 transition-all duration-200"
            >
              Go to Web Dashboard
            </button>
            <a
              href="https://utsav.app" // Placeholder/Real App site link
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-6 bg-white border border-amber-200 text-amber-800 hover:bg-amber-50/50 font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Download Mobile App
            </a>
          </div>
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
