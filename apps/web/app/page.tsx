"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@utsav/stores";
import { useRouter } from "next/navigation";
import { Flame, ArrowRight, Shield, Award, Users } from "lucide-react";

export default function HomePage() {
  const { userId, tenantId } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      if (tenantId) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [userId, tenantId, router]);

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-orange-500 selection:text-neutral-950">
      {/* Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center border-b border-neutral-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center">
            <Flame className="w-5.5 h-5.5 text-orange-500" />
          </div>
          <span className="font-serif font-extrabold text-lg tracking-wide bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            UTSAV
          </span>
        </div>
        <button
          onClick={handleGetStarted}
          className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-850 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          Portal Login
        </button>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl w-full mx-auto px-6 py-16 md:py-24 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          Introducing Utsav Platform v1.0
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight font-serif bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
          Celebrate Together. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            Manage Everything.
          </span>
        </h1>

        <p className="text-base md:text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed">
          The premium multi-tenant SaaS for mandals, temple trusts, and community committees. Digitize donations,
          track expenses, manage volunteers, and publish bulletins.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 w-full max-w-xs sm:max-w-none">
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-[1.01] transition-all"
          >
            Launch Setup Wizard <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/join/mock/member/mock_token")}
            className="px-8 py-4 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-neutral-300 font-semibold rounded-2xl transition-all"
          >
            Check Invitation Link
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 max-w-3xl w-full text-left">
          <div className="bg-neutral-900/40 border border-neutral-850 p-6 rounded-2xl space-y-3">
            <Shield className="w-6 h-6 text-orange-500" />
            <h3 className="font-bold text-neutral-200">SaaS Multi-Tenancy</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Complete data isolation, custom subdomains, and distinct branding colors for every mandal.
            </p>
          </div>
          <div className="bg-neutral-900/40 border border-neutral-850 p-6 rounded-2xl space-y-3">
            <Users className="w-6 h-6 text-orange-500" />
            <h3 className="font-bold text-neutral-200">Member Directory</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Secure role-based invites, custom permissions, and directory search with trigram index.
            </p>
          </div>
          <div className="bg-neutral-900/40 border border-neutral-850 p-6 rounded-2xl space-y-3">
            <Award className="w-6 h-6 text-orange-500" />
            <h3 className="font-bold text-neutral-200">Audit Compliance</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Granular DB Row-Level Security, audit trails, and cryptographically verified transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-905 bg-neutral-950 py-8 px-6 text-center text-xs text-neutral-600">
        © 2026 Utsav Technologies Pvt. Ltd. All rights reserved.
      </footer>
    </main>
  );
}
