"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useForgotPassword,
  useVerifyOtp,
  useResetPassword
} from "@utsav/api-client";
import {
  Loader2,
  AlertCircle,
  Mail,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Flame,
  PartyPopper
} from "lucide-react";

type Step = "REQUEST" | "VERIFY" | "RESET" | "SUCCESS";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const forgotPasswordMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyOtp();
  const resetPasswordMutation = useResetPassword();

  const [step, setStep] = useState<Step>("REQUEST");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "VERIFY" && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await forgotPasswordMutation.mutateAsync({ email });
      setLoading(false);
      if (res.success) {
        setStep("VERIFY");
        setCountdown(60);
      } else {
        setError(res.message || "Failed to send reset code.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to process forgot password request.");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const otpString = otp.join("");
    
    try {
      const res = await verifyOtpMutation.mutateAsync({ email, otp: otpString });
      setLoading(false);
      if (res.success) {
        setStep("RESET");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Invalid or expired OTP. Please try entering 123456.");
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await resetPasswordMutation.mutateAsync({ email, password });
      setLoading(false);
      if (res.success) {
        setStep("SUCCESS");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to update your password. Please try again.");
    }
  };

  return (
    <div className="bg-puja-white min-h-screen flex flex-col font-body-md text-on-surface relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Background Decorative Garlands */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-24 md:w-48 pointer-events-none opacity-40 z-20">
          <div className="w-full aspect-square bg-contain bg-no-repeat" style={{ backgroundImage: "url('/assets/garland-forgot-left.png')" }}></div>
        </div>
        <div className="absolute top-0 right-0 w-24 md:w-48 pointer-events-none opacity-40 z-20 transform scale-x-[-1]">
          <div className="w-full aspect-square bg-contain bg-no-repeat" style={{ backgroundImage: "url('/assets/garland-forgot-right.png')" }}></div>
        </div>
      </div>

      <main className="relative z-10 flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-2xl">
        <div className="w-full max-w-[480px]">
          
          {/* Brand Identity Anchor */}
          <div className="flex flex-col items-center mb-xl">
            <div className="w-32 h-16 mb-md transition-transform duration-300 hover:scale-105">
              <img
                className="w-full h-full object-contain"
                alt="Utsav logo"
                src="/logo.png"
              />
            </div>
          </div>

          {/* Focused Transactional Card */}
          <div className="glass-card rounded-xl p-xl shadow-md border border-sandstone">
            
            {/* Header info based on current step */}
            <div className="mb-lg text-center">
              <h2 className="font-headline-md text-headline-md text-primary mb-xs">
                {step === "REQUEST" && "Reset Password"}
                {step === "VERIFY" && "Verify Reset Code"}
                {step === "RESET" && "Choose New Password"}
                {step === "SUCCESS" && "Password Reset Success"}
              </h2>
              <p className="font-body-md text-on-surface-variant">
                {step === "REQUEST" && "Enter your registered email to receive a password reset code."}
                {step === "VERIFY" && `We sent a 6-digit OTP code to ${email}`}
                {step === "RESET" && "Enter a secure new password for your account."}
                {step === "SUCCESS" && "Your password has been successfully reset."}
              </p>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-4 rounded-xl mb-6 flex items-start gap-3 animate-in shake duration-300">
                <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            {/* STEP 1: Request Email */}
            {step === "REQUEST" && (
              <form onSubmit={handleRequestOtp} className="space-y-lg">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline h-5 w-5 pointer-events-none" />
                    <input
                      className="w-full h-12 pl-12 pr-4 bg-cream/50 border border-sandstone rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all duration-200 placeholder:text-outline/60 font-body-md text-on-surface"
                      id="email"
                      placeholder="name@organization.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  className="w-full h-[56px] bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-xl shadow-sm hover:shadow-md hover:bg-orange-600 active:scale-95 transition-all duration-200 flex items-center justify-center gap-sm group"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Verify OTP */}
            {step === "VERIFY" && (
              <form onSubmit={handleVerifyOtp} className="space-y-lg">
                <div className="space-y-xs">
                  <label className="block font-label-md text-label-md text-on-surface-variant ml-1 text-center" htmlFor="otp">Enter 6-digit Code</label>
                  <div className="flex justify-between gap-2 max-w-[280px] mx-auto py-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 h-11 text-center bg-cream/50 border border-sandstone rounded-xl text-md font-bold focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                      />
                    ))}
                  </div>
                  <p className="text-center text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                    Demo OTP: 123456
                  </p>
                </div>

                <button
                  className="w-full h-[56px] bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-xl shadow-sm hover:shadow-md hover:bg-orange-600 active:scale-95 transition-all duration-200 flex items-center justify-center gap-sm group"
                  type="submit"
                  disabled={loading || otp.some(d => !d)}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="text-center mt-2">
                  {countdown > 0 ? (
                    <p className="text-xs text-neutral-500 font-semibold">
                      Resend code in <span className="font-bold text-orange-600">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={() => handleRequestOtp()}
                      type="button"
                      className="text-xs font-bold text-orange-600 hover:text-orange-700"
                    >
                      Resend reset code
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* STEP 3: Reset Password */}
            {step === "RESET" && (
              <form onSubmit={handleResetPassword} className="space-y-lg">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="password">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline h-5 w-5 pointer-events-none" />
                    <input
                      className="w-full h-12 pl-12 pr-12 bg-cream/50 border border-sandstone rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all duration-200 font-body-md text-on-surface"
                      id="password"
                      placeholder="••••••••"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-outline h-5 w-5 pointer-events-none" />
                    <input
                      className="w-full h-12 pl-12 pr-4 bg-cream/50 border border-sandstone rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all duration-200 font-body-md text-on-surface"
                      id="confirmPassword"
                      placeholder="••••••••"
                      required
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  className="w-full h-[56px] bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-xl shadow-sm hover:shadow-md hover:bg-orange-600 active:scale-95 transition-all duration-200 flex items-center justify-center gap-sm group"
                  type="submit"
                  disabled={loading || !password || password !== confirmPassword}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Save New Password</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: Success State */}
            {step === "SUCCESS" && (
              <div className="text-center space-y-md animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-tulsi-green/10 text-tulsi-green rounded-full flex items-center justify-center mx-auto mb-md">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="font-body-lg text-on-surface">Password updated successfully!</p>
                <p className="font-body-md text-on-surface-variant">You can now proceed to log in with your new credentials.</p>
                <Link
                  href="/login"
                  className="w-full h-[56px] bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-xl shadow-sm hover:shadow-md hover:bg-orange-600 active:scale-95 transition-all duration-200 flex items-center justify-center"
                >
                  Go to Login
                </Link>
              </div>
            )}

            {/* Ghost Action (Back to login link) */}
            {step !== "SUCCESS" && (
              <div className="mt-xl pt-lg border-t border-sandstone/50 flex justify-center">
                <button
                  onClick={() => {
                    if (step === "REQUEST") router.push("/login");
                    if (step === "VERIFY") setStep("REQUEST");
                    if (step === "RESET") setStep("VERIFY");
                  }}
                  className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 group"
                >
                  <ArrowLeft className="h-[18px] w-[18px]" />
                  <span>{step === "REQUEST" ? "Back to Login" : "Back"}</span>
                </button>
              </div>
            )}

          </div>

          {/* Contextual Illustration/Decoration */}
          <div className="mt-2xl flex justify-center items-center gap-xl opacity-30 breathe-animation">
            <div className="text-aarti-gold diya-glow">
              <Flame className="h-[30px] w-[30px] fill-current" />
            </div>
            <div className="text-primary-container diya-glow">
              <PartyPopper className="h-[40px] w-[40px]" />
            </div>
            <div className="text-aarti-gold diya-glow">
              <Flame className="h-[30px] w-[30px] fill-current" />
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low flex flex-col md:flex-row justify-between items-center gap-lg border-t border-sandstone relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-md">
          <span className="font-headline-sm text-headline-sm text-primary">Utsav</span>
          <p className="font-body-md text-body-md text-on-surface-variant">© {new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-md">
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-colors" href="#">Privacy Policy</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-colors" href="#">Terms of Service</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-colors" href="#">Contact</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-colors" href="#">FAQ</a>
        </div>
      </footer>

    </div>
  );
}
