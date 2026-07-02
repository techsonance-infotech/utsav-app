"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle, Mail, Phone, User, Lock, ArrowRight, ShieldCheck, Flame } from "lucide-react";

// Initialize client-side Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CustomJoinPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = params.token;

  // Invitation info
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [roleSelection, setRoleSelection] = useState("");

  // Form inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "otp" | "success">("form");

  // OTP inputs
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  // 1. Fetch invitation details on mount
  useEffect(() => {
    const fetchInviteDetails = async () => {
      // Pre-fill query parameters if present
      const queryName = searchParams.get("name") || "";
      const queryPhone = searchParams.get("phone") || "";
      const queryRole = searchParams.get("role") || "";

      if (queryName) setFullName(queryName);
      if (queryPhone) setPhone(queryPhone);

      // If token is "volunteer" or "member", resolve public tenant details from subdomain
      if (token === "volunteer" || token === "member") {
        setRoleSelection(token);
        const subdomain = window.location.hostname.split(".")[0];
        try {
          const res = await fetch(`/api/v1/public/tenants/${subdomain}`);
          if (res.ok) {
            const data = await res.json();
            setTenantName(data.name);
            setTenantSlug(data.slug);
            setLoadingInvite(false);
          } else {
            setInviteError("Invalid Mandal subdomain or this registration link is invalid.");
            setLoadingInvite(false);
          }
        } catch {
          setInviteError("Failed to load Mandal details.");
          setLoadingInvite(false);
        }
        return;
      }

      try {
        const res = await fetch(`/api/v1/invitations/${token}`);
        if (!res.ok) {
          const data = await res.json();
          setInviteError(data.message || "Invitation link is invalid, expired, or already used.");
          setLoadingInvite(false);
          return;
        }

        const data = await res.json();
        setTenantName(data.tenant.name);
        setTenantSlug(data.tenant.slug);
        setRoleSelection(data.role);
        setLoadingInvite(false);
      } catch (err) {
        setInviteError("An error occurred verifying your invitation link.");
        setLoadingInvite(false);
      }
    };

    fetchInviteDetails();
  }, [token, searchParams]);

  // State for OTP resending and info banners
  const [otpInfoMessage, setOtpInfoMessage] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<"IDLE" | "PENDING" | "SUCCESS" | "ERROR">("IDLE");

  // 2. Handle Submit Signup Form
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setOtpInfoMessage(null);

    // Basic Validation
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError("All fields are required.");
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setFormError("Mobile number must be a valid 10-digit number.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call invite signup API
      const targetToken = token === "volunteer" || token === "member" ? "00000000-0000-0000-0000-000000000000" : token;
      const res = await fetch("/api/v1/auth/invite-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password,
          token: targetToken,
          tenantSlug: tenantSlug || undefined,
          role: roleSelection || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setFormError(errData.message || "Failed to submit registration.");
        setIsSubmitting(false);
        return;
      }

      const resData = await res.json();
      if (resData.redirectVerify) {
        setEmail(resData.email);
        setOtpInfoMessage(resData.message);
      } else {
        setOtpInfoMessage("A verification code has been sent to your email address.");
      }

      // Transition to OTP verification step
      setStep("otp");
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setOtpLoading(true);
    try {
      const targetToken = token === "volunteer" || token === "member" ? "00000000-0000-0000-0000-000000000000" : token;
      const res = await fetch("/api/v1/auth/verify-email-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          token: otpCode.trim(),
          invitationToken: targetToken,
          tenantSlug: tenantSlug || undefined,
          role: roleSelection || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setOtpError(errData.message || "Failed to verify OTP.");
        setOtpLoading(false);
        return;
      }

      setStep("success");
    } catch (err: any) {
      setOtpError(err.message || "An error occurred verifying OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // 3b. Handle Resend OTP
  const handleResendOtp = async () => {
    setOtpError(null);
    setOtpInfoMessage(null);
    setResendStatus("PENDING");
    try {
      const res = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || "Failed to resend verification OTP.");
        setResendStatus("ERROR");
      } else {
        setResendStatus("SUCCESS");
        setOtpInfoMessage("A new verification code has been sent to your email address.");
      }
    } catch (err: any) {
      setOtpError(err.message || "An error occurred resending verification OTP.");
      setResendStatus("ERROR");
    }
  };

  // 4. Handle Google OAuth Signup
  const handleGoogleSignup = async () => {
    setFormError(null);
    const host = window.location.host;
    const protocol = window.location.protocol;
    let redirectOrigin = `${protocol}//${host}`;
    
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      redirectOrigin = `${protocol}//localhost:3000`;
    } else if (host.includes("techsonance.co.in")) {
      redirectOrigin = `${protocol}//utsav.techsonance.co.in`;
    } else {
      const parts = host.split(".");
      if (parts.length > 2) {
        redirectOrigin = `${protocol}//${parts.slice(1).join(".")}`;
      }
    }
    
    const targetToken = token === "volunteer" || token === "member" ? "00000000-0000-0000-0000-000000000000" : token;
    
    // Set cross-subdomain cookies for PII data (name & phone) to prevent URL leaks
    if (typeof window !== "undefined") {
      const getBaseDomainCookieOptions = () => {
        const hostname = window.location.hostname;
        if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
          return "";
        }
        if (hostname.includes("techsonance.co.in")) {
          return "; domain=.techsonance.co.in";
        }
        const parts = hostname.split(".");
        if (parts.length > 2) {
          return `; domain=.${parts.slice(1).join(".")}`;
        }
        return "";
      };

      const cookieDomain = getBaseDomainCookieOptions();
      const piiName = fullName.trim() || searchParams.get("name") || "";
      const piiPhone = phone.trim() || searchParams.get("phone") || "";

      // Cookies expire in 10 minutes (600 seconds), secure & cross-subdomain shared
      document.cookie = `utsav_pending_invite_name=${encodeURIComponent(piiName)}; path=/${cookieDomain}; max-age=600; SameSite=Lax; Secure`;
      document.cookie = `utsav_pending_invite_phone=${encodeURIComponent(piiPhone)}; path=/${cookieDomain}; max-age=600; SameSite=Lax; Secure`;
      
      // SessionStorage as fallback local storage
      sessionStorage.setItem("utsav_pending_invite_token", targetToken);
      sessionStorage.setItem("utsav_pending_invite_name", piiName);
      sessionStorage.setItem("utsav_pending_invite_phone", piiPhone);
      sessionStorage.setItem("utsav_pending_invite_tenant_slug", tenantSlug || "");
      sessionStorage.setItem("utsav_pending_invite_role", roleSelection || "");
    }

    const queryParams = new URLSearchParams({
      invite_token: targetToken,
      tenant_slug: tenantSlug || "",
      role: roleSelection || "",
    });

    const redirectTo = `${redirectOrigin}/auth/callback?${queryParams.toString()}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setFormError(error.message || "Failed to start Google login.");
    }
  };

  if (loadingInvite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <Flame className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-600 w-6 h-6 animate-pulse" />
        </div>
        <p className="text-amber-800 font-medium animate-pulse">Loading invitation details...</p>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Invitation Error</h2>
          <p className="text-gray-600 mb-6">{inviteError}</p>
          <button
            onClick={() => router.replace("/login")}
            className="w-full py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition duration-200"
          >
            Go to Login
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
  const roleDisplay = roleLabelMap[roleSelection] || roleSelection.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full bg-white border border-amber-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-amber-600 p-6 text-white text-center relative">
          <div className="absolute top-4 left-4">
            <Flame className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wider mb-1">UTSAV JOIN PORTAL</h1>
          <p className="text-amber-100 text-sm">
            Join <span className="font-bold underline">{tenantName}</span> as a <span className="font-bold">{roleDisplay}</span>
          </p>
        </div>

        {/* Step 1: Signup Form */}
        {step === "form" && (
          <div className="p-8">
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              {formError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Phone className="w-5 h-5" />
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 pr-4 py-3 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition"
                  />
                </div>
              </div>

              {/* Primary CTA Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Submit & Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-semibold tracking-wider">Or</span>
              </div>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full py-3 bg-white border border-amber-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-amber-50/30 transition duration-200 shadow-sm"
            >
              <img
                src="https://developers.google.com/static/identity/images/g-logo.png"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Step 2: OTP Verification Screen */}
        {step === "otp" && (
          <div className="p-8 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verify your Email</h2>
            <p className="text-gray-600 text-sm mb-6">
              We have sent a 6-digit verification code to <span className="font-semibold text-amber-700">{email}</span>. Please enter it below.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {otpInfoMessage && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm justify-center">
                  <span>{otpInfoMessage}</span>
                </div>
              )}

              {otpError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm justify-center">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-digit OTP code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full py-4 text-center text-2xl tracking-widest bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 placeholder-gray-400 font-bold"
              />

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {otpLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Verify & Onboard</span>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-sm text-gray-500">Didn't receive the code?</span>
                <button
                  type="button"
                  disabled={resendStatus === "PENDING"}
                  onClick={handleResendOtp}
                  className="text-sm text-amber-600 hover:text-amber-700 font-bold hover:underline transition disabled:opacity-50"
                >
                  {resendStatus === "PENDING" ? "Resending..." : "Resend OTP"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Onboarding Success Screen */}
        {step === "success" && (
          <div className="p-8 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              Your email is verified. Your account is now active and associated with <span className="font-bold">{tenantName}</span>.
              You can now log in to start coordinating celebrations, make collections, or manage your Mandal dashboard.
            </p>

            <button
              onClick={() => router.replace("/login")}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition duration-200"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
