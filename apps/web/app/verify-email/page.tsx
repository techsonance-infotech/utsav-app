"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type VerificationStatus = "VERIFYING" | "SUCCESS" | "ERROR" | "MANUAL";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");
  const urlEmail = searchParams.get("email");

  const [status, setStatus] = useState<VerificationStatus>(urlToken ? "VERIFYING" : "MANUAL");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Manual form state
  const [emailInput, setEmailInput] = useState(urlEmail || "");
  const [codeInput, setCodeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifyCode = async (tokenToVerify: string, emailToVerify: string) => {
    try {
      const response = await fetch("/api/v1/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenToVerify, email: emailToVerify }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("SUCCESS");
        setSuccessMessage(data.message || "Your email has been verified successfully.");
        // Redirect to login after 5 seconds automatically
        setTimeout(() => {
          router.push("/login");
        }, 5000);
      } else {
        setStatus("MANUAL");
        setErrorMessage(data.message || "Verification failed. The code might have expired.");
      }
    } catch (err: any) {
      setStatus("MANUAL");
      setErrorMessage("An unexpected error occurred during email verification.");
    }
  };

  useEffect(() => {
    if (urlToken) {
      verifyCode(urlToken, urlEmail || "");
    }
  }, [urlToken, urlEmail]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !codeInput) {
      setErrorMessage("Email and verification code are required.");
      return;
    }
    if (!/^\d{6}$/.test(codeInput)) {
      setErrorMessage("Verification code must be exactly 6 digits.");
      return;
    }
    setErrorMessage("");
    setIsSubmitting(true);
    await verifyCode(codeInput, emailInput);
    setIsSubmitting(false);
  };

  return (
    <div className="glass-card border border-sandstone rounded-xl shadow-md p-xl flex flex-col items-center text-center gap-lg w-full">
      {status === "VERIFYING" && (
        <div className="flex flex-col items-center gap-md py-xl animate-pulse">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h2 className="font-headline-md text-headline-md text-primary mt-md">Verifying your email...</h2>
          <p className="font-body-md text-on-surface-variant">Please wait while we activate your account and start your 14-day trial.</p>
        </div>
      )}

      {status === "SUCCESS" && (
        <div className="flex flex-col items-center gap-md py-md">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
            <CheckCircle2 className="relative w-16 h-16 text-emerald-600" />
          </div>
          <h2 className="font-headline-md text-headline-md text-emerald-700 mt-md">Account Verified!</h2>
          <p className="font-body-md text-on-surface-variant max-w-sm">
            {successMessage || "Your email has been successfully verified. Your 14-day premium trial is now active."}
          </p>
          <p className="font-body-sm text-outline mt-sm">
            Redirecting to login page in 5 seconds...
          </p>
          <Link
            href="/login"
            className="w-full h-12 mt-lg bg-primary text-on-primary rounded-xl font-label-md flex items-center justify-center shadow-md hover:bg-surface-tint active:scale-98 transition-all"
          >
            Go to Login Now
          </Link>
        </div>
      )}

      {status === "MANUAL" && (
        <div className="w-full flex flex-col gap-md py-md">
          <h2 className="font-headline-md text-headline-md text-on-surface">Enter Verification Code</h2>
          <p className="font-body-md text-on-surface-variant mb-md text-sm">
            Please enter your email and the 6-digit verification code sent to your inbox.
          </p>

          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 text-left animate-in slide-in-from-top-2 duration-300">
              <span className="text-rose-600 text-sm mt-0.5">⚠️</span>
              <p className="text-xs text-rose-700 font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-md text-left">
            <div className="space-y-xs">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                className="w-full h-12 px-4 bg-cream border border-sandstone rounded-xl focus:border-primary focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md"
                placeholder="rahul@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-xs">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                required
                maxLength={6}
                className="w-full h-12 px-4 bg-cream border border-sandstone rounded-xl focus:border-primary focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-center text-xl font-bold tracking-widest"
                placeholder="123456"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !emailInput || codeInput.length !== 6}
              className="w-full h-12 bg-primary-container text-on-primary-container font-label-md rounded-xl shadow-md hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 mt-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>
          </form>

          <div className="flex justify-between items-center mt-md text-xs">
            <Link href="/register" className="text-primary hover:underline">
              Back to Register
            </Link>
            <Link href="/login" className="text-on-surface-variant hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="bg-puja-white font-body-md text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Background Decorative Garlands */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
        <div className="absolute top-0 left-0 w-24 md:w-48 pointer-events-none opacity-40 z-20">
          <div className="w-full aspect-square bg-contain bg-no-repeat" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD5WuXiPps5xhagiMiyF9ND7UvE3q2lARoLPND5aqgtez4Ad4R7ljMEbnrfwTL9oV1JwLwYdNlMeLgiuBxWXeaFTF53QCloGuR73gmzBT3ziOXe6XEtwLS1htjp0JFn8_24rE4AIc0kjvm3f3XM-O3kxw6ckMleGZbJj2_g0LL_pvhMAHqkTC6rLok7lfITThtWhQzAMV4CvUyrEzGhzLovtvTzybpUWbnhJHU8cOU1_t9wnCe-7t4j')" }}></div>
        </div>
        <div className="absolute top-0 right-0 w-24 md:w-48 pointer-events-none opacity-40 z-20 transform scale-x-[-1]">
          <div className="w-full aspect-square bg-contain bg-no-repeat" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-IcePHugUVg4D0LqdQ8_vnR2PLYOcNeh8C3eC4rRAP8RIRxlYAWzdOLxW8A_YIj28aGIXcI_l6veQPM9k3adAZIFMrsEA4Nxe-vWtuQX1B5oaOGKLMR49YjPAhKS7mSfLqOFcvgiY6cntkvIKUGPrkzsXQ3ELbh6TsnVlHJXzmDQ0xs-ZOXCiM_B6PsfwOWuHKZdUIvg8NIROaEUvSrvA2x23eA8PTyLXJFqfTec8Q3X9FfycO8W4')" }}></div>
        </div>
      </div>

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
        </div>

        {/* Focused Transactional Card Wrapper with Suspense */}
        <Suspense fallback={
          <div className="glass-card border border-sandstone rounded-xl shadow-md p-xl flex flex-col items-center text-center gap-lg">
            <div className="flex flex-col items-center gap-md py-xl">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h2 className="font-headline-md text-headline-md text-primary mt-md">Loading...</h2>
            </div>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>

        {/* Footer Links */}
        <footer className="mt-xl text-center flex flex-col gap-md">
          <div className="flex justify-center items-center gap-xl text-outline font-label-sm">
            <Link className="hover:text-on-surface transition-colors" href="/privacy-policy">Privacy Policy</Link>
            <Link className="hover:text-on-surface transition-colors" href="/terms-of-service">Terms of Service</Link>
            <Link className="hover:text-on-surface transition-colors" href="/help-center">Help Center</Link>
          </div>
          <p className="text-outline font-label-sm mt-md opacity-60">© {new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
