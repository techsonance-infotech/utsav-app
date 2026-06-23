"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useLogin, useResendVerification, supabase } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import {
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Flame
} from "lucide-react";

// Zod validation schema for login credentials
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const tenantIdParam = searchParams.get("tenantId");
  
  const { userId, tenantId, tenantSlug } = useAuthStore();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState<"IDLE" | "PENDING" | "SUCCESS" | "ERROR">("IDLE");
  const resendMutation = useResendVerification();

  // Redirect if logged in
  useEffect(() => {
    if (userId) {
      if (redirectTo) {
        router.push(redirectTo);
      } else if (tenantId) {
        if (tenantSlug) {
          router.push(`/${tenantSlug}/dashboard`);
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/onboarding");
      }
    }
  }, [userId, tenantId, tenantSlug, redirectTo, router]);

  // Real-time Zod schema validation
  useEffect(() => {
    const result = loginSchema.safeParse({ email, password });
    if (result.success) {
      setErrors({});
    } else {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
    }
  }, [email, password]);

  // Subtle parallax effect on mouse move for the auth card
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const card = document.querySelector(".glass-card") as HTMLElement;
      if (!card) return;
      const xAxis = (window.innerWidth / 2 - e.pageX) / 100;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 100;
      card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };

    const handleGlobalMouseLeave = () => {
      const card = document.querySelector(".glass-card") as HTMLElement;
      if (!card) return;
      card.style.transform = `rotateY(0deg) rotateX(0deg)`;
      card.style.transition = "transform 0.5s ease";
    };

    const handleGlobalMouseEnter = () => {
      const card = document.querySelector(".glass-card") as HTMLElement;
      if (!card) return;
      card.style.transition = "none";
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseleave", handleGlobalMouseLeave);
    document.addEventListener("mouseenter", handleGlobalMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseleave", handleGlobalMouseLeave);
      document.removeEventListener("mouseenter", handleGlobalMouseEnter);
    };
  }, []);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setShowResend(false);
    setResendStatus("IDLE");
    setTouched({ email: true, password: true });

    // Validate using Zod schema
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setAuthError("Please fix the validation errors before signing in.");
      return;
    }

    try {
      const data = await loginMutation.mutateAsync({ 
        email, 
        password, 
        tenantId: tenantIdParam || undefined 
      });
      
      // Store session data according to rememberMe checkbox choice
      if (typeof window !== "undefined") {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("utsav_user_id", data.user.id);
        storage.setItem("utsav_access_token", data.accessToken);
        if (data.tenant) {
          storage.setItem("utsav_tenant_id", data.tenant.id);
          storage.setItem("utsav_tenant_slug", data.tenant.slug);
          storage.setItem("utsav_tenant_name", data.tenant.name);
          storage.setItem("utsav_role", data.tenant.role);
        }
      }
    } catch (err: any) {
      const errMsg = err.message || "Invalid credentials. Please try again.";
      setAuthError(errMsg);
      if (errMsg.toLowerCase().includes("is not verified") || errMsg.toLowerCase().includes("confirm")) {
        setShowResend(true);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || "Failed to initialize Google login.");
    }
  };

  return (
    <div className="bg-puja-white font-body-md text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top Left Garlands */}
        <div className="absolute -top-10 -left-10 w-64 h-64 opacity-20 transform -rotate-12">
          <img
            className="w-full h-full object-contain"
            alt="Traditional Indian marigold flower garland strands"
            src="/assets/garland-login.png"
          />
        </div>
        {/* Bottom Right Diya Pattern */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 diya-watermark">
          <img
            className="w-full h-full object-contain"
            alt="Intricate traditional Indian diya lamp illustration"
            src="/assets/diya-login.png"
          />
        </div>
      </div>

      {/* Main Login Container */}
      <main className="relative z-10 w-full max-w-[440px] px-margin-mobile md:px-0">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-xl">
          <div className="w-44 h-20 mb-md transition-transform duration-300 hover:scale-105">
            <img
              className="w-full h-full object-contain"
              alt="Utsav logo"
              src="/logo.png"
            />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface-variant text-center">Welcome back to Utsav</h1>
          <p className="font-body-md text-body-md text-outline mt-xs">Empowering community celebrations</p>
        </div>

        {/* Auth Card */}
        <div
          className="glass-card border border-sandstone rounded-xl shadow-md p-xl flex flex-col gap-lg"
        >
          {/* Auth Error Alert */}
          {authError && (
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-rose-50 border border-rose-100 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium leading-relaxed">{authError}</p>
              </div>
              {showResend && (
                <div className="pl-8 flex flex-col gap-1.5">
                  {resendStatus === "SUCCESS" ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-emerald-600 font-semibold">Verification link & code sent! Check your inbox.</span>
                      <Link
                        href={`/verify-email?email=${encodeURIComponent(email)}`}
                        className="text-xs text-primary font-bold hover:underline underline-offset-2"
                      >
                        Go to Email Verification Page &rarr;
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={resendStatus === "PENDING"}
                        onClick={async () => {
                          try {
                            setResendStatus("PENDING");
                            await resendMutation.mutateAsync({ email });
                            setResendStatus("SUCCESS");
                          } catch (resendErr: any) {
                            setResendStatus("ERROR");
                            setAuthError(resendErr.message || "Failed to resend verification email.");
                          }
                        }}
                        className="text-xs text-primary font-bold hover:underline transition-all outline-none"
                      >
                        {resendStatus === "PENDING" ? "Sending..." : "Resend verification link"}
                      </button>
                      <span className="text-outline text-xs">|</span>
                      <Link
                        href={`/verify-email?email=${encodeURIComponent(email)}`}
                        className="text-xs text-on-surface-variant hover:text-primary transition-colors font-medium hover:underline"
                      >
                        Verify Code Manually
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Login Form */}
          <form className="flex flex-col gap-md" onSubmit={handleLogin}>
            
            {/* Email Field */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-5 w-5 pointer-events-none" />
                <input
                  className={`w-full pl-12 pr-4 py-3 bg-puja-white border rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md ${
                    touched.email && errors.email ? "border-rose-400" : "border-sandstone"
                  }`}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@organization.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={loginMutation.isPending}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-[11px] text-rose-600 ml-1 mt-0.5 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                <Link
                  className="font-label-md text-label-md text-primary hover:underline underline-offset-4 transition-all"
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-5 w-5 pointer-events-none" />
                <input
                  className={`w-full pl-12 pr-12 py-3 bg-puja-white border rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md ${
                    touched.password && errors.password ? "border-rose-400" : "border-sandstone"
                  }`}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  disabled={loginMutation.isPending}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-[11px] text-rose-600 ml-1 mt-0.5 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Options Row */}
            <div className="flex items-center gap-sm mt-xs">
              <input
                className="w-4 h-4 text-primary bg-puja-white border-sandstone rounded focus:ring-primary-container focus:ring-offset-0 cursor-pointer"
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Keep me signed in</label>
            </div>

            {/* Primary Action */}
            <button
              className="mt-md w-full h-[56px] bg-primary-container text-on-primary-fixed font-headline-sm text-headline-sm rounded-xl shadow-lg shadow-primary-container/20 hover:bg-primary-container/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-sm disabled:opacity-75"
              type="submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-md py-sm">
            <div className="h-px bg-sandstone flex-grow"></div>
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">or continue with</span>
            <div className="h-px bg-sandstone flex-grow"></div>
          </div>

          {/* Social Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-cream border border-sandstone rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant hover:border-outline-variant active:scale-[0.98] transition-all flex items-center justify-center gap-md"
            type="button"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer Links */}
        <footer className="mt-xl text-center flex flex-col gap-md">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Don't have an account?{" "}
            <Link className="text-primary font-label-md hover:underline underline-offset-4" href="/register">
              Create Organization
            </Link>
          </p>
          <div className="flex justify-center items-center gap-xl text-outline font-label-sm">
            <Link className="hover:text-on-surface transition-colors" href="/privacy-policy">Privacy Policy</Link>
            <Link className="hover:text-on-surface transition-colors" href="/terms-of-service">Terms of Service</Link>
            <Link className="hover:text-on-surface transition-colors" href="/help-center">Help Center</Link>
          </div>
          <p className="text-outline font-label-sm mt-md opacity-60">© {new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.</p>
        </footer>
      </main>

      {/* Interactive Diya Element (Visual Flare) */}
      <div className="fixed bottom-margin-desktop left-margin-desktop hidden lg:flex items-center gap-md bg-white/50 backdrop-blur-sm border border-sandstone p-md rounded-full animate-glow shadow-sm z-10">
        <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-on-primary-fixed">
          <Flame className="h-5 w-5 fill-current" />
        </div>
        <div className="pr-md">
          <p className="font-label-sm text-label-sm text-primary uppercase tracking-tighter">Festive Season Live</p>
          <p className="font-body-md text-body-md font-bold text-on-surface-variant">Ganesh Chaturthi 2026</p>
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
