"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type VerificationStatus = "VERIFYING" | "SUCCESS" | "ERROR";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>("VERIFYING");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("ERROR");
      setErrorMessage("The email verification link is invalid or missing.");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/v1/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("SUCCESS");
          // Redirect to login after 5 seconds automatically
          setTimeout(() => {
            router.push("/login");
          }, 5000);
        } else {
          setStatus("ERROR");
          setErrorMessage(data.message || "Verification failed. The token might have expired.");
        }
      } catch (err: any) {
        setStatus("ERROR");
        setErrorMessage("An unexpected error occurred during email verification.");
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="glass-card border border-sandstone rounded-xl shadow-md p-xl flex flex-col items-center text-center gap-lg">
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
            Your email has been successfully verified. Your 14-day premium trial is now active.
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

      {status === "ERROR" && (
        <div className="flex flex-col items-center gap-md py-md">
          <XCircle className="w-16 h-16 text-rose-600" />
          <h2 className="font-headline-md text-headline-md text-rose-700 mt-md">Verification Failed</h2>
          <p className="font-body-md text-on-surface-variant max-w-sm">
            {errorMessage}
          </p>
          <Link
            href="/register"
            className="w-full h-12 mt-lg bg-primary text-on-primary rounded-xl font-label-md flex items-center justify-center shadow-md hover:bg-surface-tint active:scale-98 transition-all"
          >
            Back to Registration
          </Link>
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

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-xl px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-lg border-t border-sandstone/50 bg-surface-container-low/50 backdrop-blur-sm mt-8">
        <p className="font-body-md text-body-md text-on-surface-variant">© {new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.</p>
        <div className="flex gap-lg">
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-all" href="/privacy-policy">Privacy Policy</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-all" href="/terms-of-service">Terms of Service</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-all" href="/help-center">Help Center</Link>
        </div>
      </footer>
    </div>
  );
}
