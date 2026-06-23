"use client";

import { useEffect } from "react";
import { useAuthStore } from "@utsav/stores";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();
  const { tenantSlug, userId } = useAuthStore();

  useEffect(() => {
    if (!userId) {
      router.replace("/login");
    } else if (tenantSlug) {
      router.replace(`/${tenantSlug}/dashboard`);
    } else {
      router.replace("/onboarding");
    }
  }, [userId, tenantSlug, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-zinc-505 font-medium">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-amber-600 border-t-transparent animate-spin" />
        <span className="text-sm font-sans tracking-wide">Redirecting to organization dashboard...</span>
      </div>
    </div>
  );
}
