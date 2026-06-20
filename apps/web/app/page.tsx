"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@utsav/stores";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { userId, tenantId, tenantSlug } = useAuthStore();
  const router = useRouter();

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Redirect authenticated sessions
  useEffect(() => {
    if (userId) {
      if (tenantId) {
        if (tenantSlug) {
          router.push(`/${tenantSlug}/dashboard`);
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/onboarding");
      }
    }
  }, [userId, tenantId, tenantSlug, router]);

  const handleGetStarted = () => {
    if (userId) {
      router.push("/onboarding");
    } else {
      router.push("/register");
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      q: "How does the subdomain routing work for our Mandal?",
      a: "When you register, you choose a unique slug (e.g. 'truptinagar'). In production, your public page will be accessible at 'truptinagar.yourdomain.com'. In development, it defaults to a clean path structure '/truptinagar' so you can review details instantly.",
    },
    {
      q: "Are the payment processes secure and compliant?",
      a: "Yes, all transactions are processed through RBI-approved, PCI-DSS compliant payment gateways like Razorpay. Funds go directly to your registered Mandal bank account with automated digital receipts.",
    },
    {
      q: "Can we track volunteer shifts and roles?",
      a: "Absolutely. The administrative dashboard allows you to define team hierarchies (Owners, Admins, Volunteers) and assign roles like gate coordinators, food distribution heads, or finance managers.",
    },
    {
      q: "Does UtsavManager support 80G tax benefits?",
      a: "Yes, if your temple trust has 80G registration, you can configure UtsavManager to automatically generate tax-exempt receipt PDFs with your trust credentials and email them to donors.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1e1b18] flex flex-col font-sans selection:bg-[#ff9500]/25 selection:text-[#2d1600] overflow-x-clip relative">
      
      {/* Dynamic Background Grid and Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[800px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,149,0,0.08)_0%,transparent_70%)]" />
        <div className="absolute top-0 inset-0 bg-[radial-gradient(circle,rgba(140,80,0,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />
        <div className="absolute top-[800px] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,149,0,0.04)_0%,transparent_60%)] blur-2xl" />
        <div className="absolute bottom-[200px] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(140,80,0,0.03)_0%,transparent_60%)] blur-2xl" />
      </div>

      {/* Top Glassmorphic Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-[#E8E2D6]/40 shadow-xs">
        <div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#8c5000] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              temple_hindu
            </span>
            <span className="font-sans font-black text-lg tracking-tight text-[#8c5000] uppercase">
              UtsavManager
            </span>
          </div>
          
          {/* Menu Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-[#554334]">
            <a href="#features" className="hover:text-[#8c5000] transition-colors">Features</a>
            <a href="#solutions" className="hover:text-[#8c5000] transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-[#8c5000] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#8c5000] transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogin}
              type="button"
              className="text-xs font-black uppercase tracking-widest text-[#554334] hover:text-[#8c5000] px-4 py-2.5 hover:bg-[#F4F1EB]/50 rounded-xl transition-all"
            >
              Login
            </button>
            <button
              onClick={handleGetStarted}
              type="button"
              className="bg-[#8c5000] hover:bg-[#ff9500] text-white hover:text-[#2d1600] px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-98"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-36 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[#F4F1EB] border border-[#8c5000]/15 px-4 py-1.5 rounded-full shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500] animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-black text-[#8c5000]">
                Modernizing 500+ Indian Mandals & trusts
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[54px] lg:leading-[1.1] font-black tracking-tight text-[#3A3530] uppercase font-headline-lg">
              Scale Your Mandal's <span className="text-[#8c5000] italic font-normal">Legacy</span> & Impact.
            </h1>
            
            <p className="text-xs md:text-sm text-[#554334] max-w-lg leading-relaxed font-medium">
              The premier SaaS portal built to digitize temple trusts, streamline high-volume donations, schedule committee rosters, and send automated devotee WhatsApp updates with zero stress.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleGetStarted}
                type="button"
                className="h-14 px-8 bg-[#8c5000] hover:bg-[#ff9500] text-white hover:text-[#2d1600] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5"
              >
                Start Free Trial
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </button>
              <button
                onClick={() => router.push("/public/shri-sai-ganpati-mandal")}
                type="button"
                className="h-14 px-8 bg-white border border-[#E8E2D6] text-[#3A3530] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#F4F1EB] transition-all"
              >
                View Live Demo
              </button>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-[#E8E2D6]/40">
              <div className="flex -space-x-3">
                <div className="w-9 h-9 rounded-full border-2 border-white bg-[#8c5000] flex items-center justify-center text-[10px] font-black text-white">SS</div>
                <div className="w-9 h-9 rounded-full border-2 border-white bg-[#ff9500] flex items-center justify-center text-[10px] font-black text-[#2d1600]">TM</div>
                <div className="w-9 h-9 rounded-full border-2 border-white bg-[#3A3530] flex items-center justify-center text-[10px] font-black text-white">GK</div>
              </div>
              <p className="text-[10px] font-bold text-[#554334] uppercase tracking-wider">
                Trusted by historical mandal committees nationwide.
              </p>
            </div>
          </div>

          {/* Hero Right Visual (Connecting Ecosystem Diagram) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-[480px] flex items-center justify-center">
              
              {/* Connecting Lines and Concentric Circles */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="26" fill="none" stroke="#E8E2D6" strokeDasharray="1.5 2" strokeWidth="0.3" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#E8E2D6" strokeDasharray="1.5 2" strokeWidth="0.3" />
                <line x1="50" y1="50" x2="50" y2="18" stroke="#E8E2D6" strokeWidth="0.3" />
                <line x1="50" y1="50" x2="80" y2="40" stroke="#E8E2D6" strokeWidth="0.3" />
                <line x1="50" y1="50" x2="72" y2="72" stroke="#E8E2D6" strokeWidth="0.3" />
                <line x1="50" y1="50" x2="28" y2="72" stroke="#E8E2D6" strokeWidth="0.3" />
                <line x1="50" y1="50" x2="20" y2="40" stroke="#E8E2D6" strokeWidth="0.3" />
              </svg>

              {/* Central Core Node */}
              <div className="absolute z-20 flex w-28 h-28 flex-col items-center justify-center rounded-full border-[6px] border-[#F4F1EB] bg-white shadow-md breathe-animation">
                <span className="material-symbols-outlined text-[#8c5000] text-3xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  temple_hindu
                </span>
                <span className="text-[10px] font-black text-[#8c5000] uppercase tracking-wider text-center">
                  Utsav Core
                </span>
              </div>

              {/* Floating Node 1: QR Collections */}
              <div className="absolute top-[6%] left-1/2 -translate-x-1/2 z-10 flex w-28 flex-col items-center justify-center rounded-2xl border border-[#E8E2D6] bg-white/95 p-3 text-center shadow-xs backdrop-blur-xs">
                <span className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#8c5000]/10 text-[#8c5000]">
                  <span className="material-symbols-outlined text-xs">qr_code_2</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#3A3530]">
                  Custom QR Pay
                </span>
              </div>

              {/* Floating Node 2: Devotee Directory */}
              <div className="absolute top-[32%] right-[2%] z-10 flex w-28 flex-col items-center justify-center rounded-2xl border border-[#E8E2D6] bg-white/95 p-3 text-center shadow-xs backdrop-blur-xs">
                <span className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff9500]/10 text-[#ff9500]">
                  <span className="material-symbols-outlined text-xs">contact_phone</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#3A3530]">
                  Devotee Logs
                </span>
              </div>

              {/* Floating Node 3: 80G Tax Exemption */}
              <div className="absolute bottom-[16%] right-[10%] z-10 flex w-28 flex-col items-center justify-center rounded-2xl border border-[#E8E2D6] bg-white/95 p-3 text-center shadow-xs backdrop-blur-xs">
                <span className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-[#22C55E]">
                  <span className="material-symbols-outlined text-xs">verified</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#3A3530]">
                  80G Compliance
                </span>
              </div>

              {/* Floating Node 4: Volunteer Shifts */}
              <div className="absolute bottom-[16%] left-[10%] z-10 flex w-28 flex-col items-center justify-center rounded-2xl border border-[#E8E2D6] bg-white/95 p-3 text-center shadow-xs backdrop-blur-xs">
                <span className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#3A3530]/10 text-[#3A3530]">
                  <span className="material-symbols-outlined text-xs">groups</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#3A3530]">
                  Duty Rosters
                </span>
              </div>

              {/* Floating Node 5: WhatsApp Bulletins */}
              <div className="absolute top-[32%] left-[2%] z-10 flex w-28 flex-col items-center justify-center rounded-2xl border border-[#E8E2D6] bg-white/95 p-3 text-center shadow-xs backdrop-blur-xs">
                <span className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-orange-100/40 text-orange-655">
                  <span className="material-symbols-outlined text-xs">sms</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#3A3530]">
                  WhatsApp Alerts
                </span>
              </div>

            </div>
          </div>

        </div>
      </header>

      {/* Telemetry Stats Strip */}
      <section className="bg-[#3A3530] text-white py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <span className="material-symbols-outlined text-4xl text-[#ff9500]" style={{ fontVariationSettings: "'FILL' 1" }}>
              currency_rupee
            </span>
            <div>
              <p className="text-2xl font-black">₹4.8Cr+</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Donations Tracked</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <span className="material-symbols-outlined text-4xl text-[#ff9500]" style={{ fontVariationSettings: "'FILL' 1" }}>
              volunteer_activism
            </span>
            <div>
              <p className="text-2xl font-black">15,000+</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Volunteers Enrolled</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <span className="material-symbols-outlined text-4xl text-[#ff9500]" style={{ fontVariationSettings: "'FILL' 1" }}>
              event_available
            </span>
            <div>
              <p className="text-2xl font-black">1,200+</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Mandal Events Managed</p>
            </div>
          </div>

        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10" id="features">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest">
            Complete Operations Engine
          </span>
          <h2 className="text-3xl font-black text-[#3A3530] mt-2 uppercase tracking-tight font-headline-lg">
            Everything you need to lead
          </h2>
          <p className="text-xs text-[#554334] mt-1 font-semibold leading-relaxed">
            Sophisticated digital tools structured specifically for the unique legal and social demands of modern cultural organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Card 1: Secure Donations Sandbox (Large 8cols) */}
          <div className="md:col-span-8 bg-white border border-[#E8E2D6] rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between group overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              
              <div className="flex-1 space-y-4">
                <span className="inline-flex items-center justify-center w-12 h-12 bg-[#8c5000]/10 rounded-2xl text-[#8c5000]">
                  <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                </span>
                <h3 className="text-xl md:text-2xl font-black text-[#3A3530] uppercase">
                  High-Volume Donations
                </h3>
                <p className="text-xs text-[#554334] leading-relaxed">
                  Support continuous collections via dynamic QR codes, credit cards, and UPI. Instantly print receipts with custom temple branding and automated 80G reports.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#1e1b18]">
                    <span className="material-symbols-outlined text-[#22C55E] text-lg">check_circle</span>
                    Instant PDF receipt delivery
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#1e1b18]">
                    <span className="material-symbols-outlined text-[#22C55E] text-lg">check_circle</span>
                    80G compliance document generation
                  </div>
                </div>
              </div>

              {/* Secure sandbox visual */}
              <div className="flex-1 bg-[#FAFAF8] border border-[#E8E2D6] rounded-2xl p-5 w-full space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D6]">
                  <span className="text-[9px] font-black uppercase text-gray-400">Incoming Stream</span>
                  <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded-md text-[8px] font-black uppercase tracking-wider">
                    Secured
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-white border border-[#E8E2D6]/40 rounded-xl shadow-xxs">
                    <div>
                      <p className="text-[10px] font-black text-[#3A3530]">Devendra Phadke</p>
                      <p className="text-[8px] text-gray-400">UPI payment successfully cleared</p>
                    </div>
                    <span className="text-xs font-black text-[#8c5000]">₹11,000</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white border border-[#E8E2D6]/40 rounded-xl shadow-xxs">
                    <div>
                      <p className="text-[10px] font-black text-[#3A3530]">Ananya Deshmukh</p>
                      <p className="text-[8px] text-gray-400">80G tax receipt generated</p>
                    </div>
                    <span className="text-xs font-black text-[#8c5000]">₹25,000</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Volunteer Duty Rosters (Small 4cols) */}
          <div className="md:col-span-4 bg-[#F4F1EB] border border-[#E8E2D6] rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-white border border-[#E8E2D6] rounded-2xl text-[#8c5000]">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </span>
              <h3 className="text-lg md:text-xl font-black text-[#3A3530] uppercase">
                Volunteer Force
              </h3>
              <p className="text-xs text-[#554334] leading-relaxed">
                Appoint department heads, assign ground activities, schedule shifts, and track check-ins live.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#E8E2D6]/60 flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#554334] uppercase tracking-wider">Mobile dashboard integration</span>
              <span className="material-symbols-outlined text-[#8c5000] text-sm">cell_phone</span>
            </div>
          </div>

          {/* Card 3: Route Timeline & VIP seat (Small 4cols) */}
          <div className="md:col-span-4 bg-[#3A3530] text-white rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-2xl text-[#ff9500]">
                <span className="material-symbols-outlined text-2xl">route</span>
              </span>
              <h3 className="text-lg md:text-xl font-black text-white uppercase">
                Procession Maps
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Plot coordinates for street parades, monitor procession speed, and automatically alert local traffic authorities.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">VIP Passes & seating</span>
              <span className="material-symbols-outlined text-[#ff9500] text-sm">confirmation_number</span>
            </div>
          </div>

          {/* Card 4: Devotee Communications & Newsletters (Medium 8cols) */}
          <div className="md:col-span-8 bg-white border border-[#E8E2D6] rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between group overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8">
              
              <div className="flex-1 space-y-4">
                <span className="inline-flex items-center justify-center w-12 h-12 bg-[#ff9500]/10 rounded-2xl text-[#8c5000]">
                  <span className="material-symbols-outlined text-2xl">campaign</span>
                </span>
                <h3 className="text-xl md:text-2xl font-black text-[#3A3530] uppercase">
                  Devotee Outreach
                </h3>
                <p className="text-xs text-[#554334] leading-relaxed font-medium">
                  Dispatch daily prayers, temple updates, and emergency event changes instantly via WhatsApp and automated newsletters.
                </p>
                <div className="pt-2">
                  <button type="button" className="text-xs font-black text-[#8c5000] border-b border-[#8c5000]/20 pb-0.5 uppercase tracking-widest hover:border-[#8c5000] transition-all">
                    Learn about broadcasts &rarr;
                  </button>
                </div>
              </div>

              {/* Devotee interface mockup */}
              <div className="flex-1 relative min-h-[160px] bg-[#FAFAF8] rounded-2xl overflow-hidden border border-[#E8E2D6]/40 p-4">
                <div className="bg-white border border-[#E8E2D6] p-3 rounded-xl shadow-xxs space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    <span className="text-[8px] font-black uppercase text-gray-500">Mandal Broadcaster</span>
                  </div>
                  <p className="text-[9px] text-[#554334] leading-snug">
                    "Morning Aarti scheduled for 6:00 AM today is live. Tap to listen to the live stream audio darshan."
                  </p>
                  <div className="w-full bg-[#F4F1EB] rounded-lg p-1.5 flex items-center justify-between text-[8px] font-bold text-[#8c5000]">
                    <span>AudioDarshanStream.mp3</span>
                    <span className="material-symbols-outlined text-xs">play_circle</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Onboarding / Setup Steps */}
      <section className="py-20 bg-[#F4F1EB] border-y border-[#E8E2D6]/40 relative z-10" id="solutions">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            <div className="lg:w-1/3 space-y-6 lg:sticky lg:top-32">
              <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest">
                Seamless Deployment
              </span>
              <h2 className="text-3xl font-black text-[#3A3530] uppercase tracking-tight font-headline-lg leading-tight">
                Launch your digital Mandal in 3 steps
              </h2>
              <p className="text-xs text-[#554334] leading-relaxed font-semibold">
                Modernizing your community organization shouldn't be complex. Configure your portal and connect with devotees instantly.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-[#8c5000] shadow-xs">
                  <span className="text-[#8c5000] font-black text-sm uppercase tracking-wider">01 Setup Identity</span>
                  <p className="text-[10px] text-[#554334] mt-1 font-semibold">
                    Enter your organization details, upload logo media, and define brand primary colors.
                  </p>
                </div>
                <div className="p-4 rounded-2xl hover:bg-white/50 transition-all">
                  <span className="text-[#554334] font-black text-sm uppercase tracking-wider">02 Launch Campaigns</span>
                  <p className="text-[10px] text-[#554334] mt-1 font-semibold">
                    Establish target donations for upcoming celebrations, social work, or structural developments.
                  </p>
                </div>
                <div className="p-4 rounded-2xl hover:bg-white/50 transition-all">
                  <span className="text-[#554334] font-black text-sm uppercase tracking-wider">03 Sync Devotees</span>
                  <p className="text-[10px] text-[#554334] mt-1 font-semibold">
                    Distribute your unique domain link. Track real-time digital contributions and WhatsApp lists instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-10 lg:pt-0">
              <div className="bg-white p-3.5 rounded-3xl shadow-xs border border-[#E8E2D6] transform md:translate-y-12">
                <img
                  className="w-full rounded-2xl aspect-[10/16] object-cover"
                  alt="Mobile setup screenshot representation"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNJ_yLwfa3CJMcuiBd34OFwX7PWUFiuX6u7NFKpT2NePV7gdEZOlje9qy2P8JQMwqEH8apLs5xr8x4kQyuj_TysmNDk_5tW2rvYS7dGqsTsJMTwwV0tSUUOssikMcj-IOqlAZG9E2ldLiykMwry0WO0a4lxGEdEEz3t97dVP8loAKCxekod8r7tliLPU7I3lWQomokKWg93nzU02chShYlRmyvR3MWGJo8OkNNVpTnDQAjSd6YAbZL"
                />
              </div>
              <div className="bg-white p-3.5 rounded-3xl shadow-xs border border-[#E8E2D6]">
                <img
                  className="w-full rounded-2xl aspect-[10/16] object-cover"
                  alt="Financial analytics overview dashboard"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLvL6Ve3x9lau-FqbcRuE5uNpJHJIA5D1-Q5_lveDf_rqwoB6qEOWqzj2yIDm_hYgTZPSgnlFIlSs1p2oC0k9fjnZhPawCBtF0x8LWs7jusc0Vfpflz50jYxae4aqoI6gCEeIG_uorz6DSfRiDrxyAjIU7QolVtmf8injQLBcW8KPvm-JbFe1s32Grwos0PSYlPISyo5ktJAvC6XNOkIi8GgElxystdrd0fPaQya7PtfMqNn9xLA8c"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10" id="pricing">
        <div className="text-center mb-16">
          <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest">
            Pricing Plans
          </span>
          <h2 className="text-3xl font-black text-[#3A3530] uppercase tracking-tight mt-1 font-headline-lg">
            Flexible plans for every community
          </h2>
          <p className="text-xs text-[#554334] font-semibold mt-1">
            Whether you are a local street committee or a historical public temple trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Plan 1: Standard */}
          <div className="bg-white border border-[#E8E2D6] rounded-3xl p-8 flex flex-col hover:shadow-md transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#554334]">Standard tier</span>
            <div className="mt-4 mb-6">
              <span className="text-4xl font-extrabold text-[#3A3530]">₹999</span>
              <span className="text-xs text-[#554334] font-bold"> / year</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 border-t border-gray-100 pt-6">
              <li className="flex items-center gap-2 text-xs text-[#554334] font-bold">
                <span className="material-symbols-outlined text-[#8c5000] text-lg font-black">done</span>
                Up to 500 Donors
              </li>
              <li className="flex items-center gap-2 text-xs text-[#554334] font-bold">
                <span className="material-symbols-outlined text-[#8c5000] text-lg font-black">done</span>
                Digital Receipts (Email)
              </li>
              <li className="flex items-center gap-2 text-xs text-[#554334] font-bold">
                <span className="material-symbols-outlined text-[#8c5000] text-lg font-black">done</span>
                Basic Campaign Target Bar
              </li>
            </ul>

            <button
              onClick={handleGetStarted}
              type="button"
              className="w-full py-3 bg-[#F4F1EB] hover:bg-[#E8E2D6] text-[#3A3530] rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
            >
              Start Free Trial
            </button>
          </div>

          {/* Plan 2: Premium (Featured) */}
          <div className="bg-[#3A3530] text-white rounded-3xl p-8 flex flex-col relative shadow-md border-2 border-[#ff9500] scale-103 z-10">
            <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 bg-[#ff9500] text-[#2d1600] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
              Most Popular
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ffb874]">Premium tier</span>
            <div className="mt-4 mb-6">
              <span className="text-4xl font-extrabold text-white">₹4,999</span>
              <span className="text-xs text-gray-300 font-bold"> / year</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1 border-t border-white/10 pt-6">
              <li className="flex items-center gap-2 text-xs text-gray-200 font-semibold">
                <span className="material-symbols-outlined text-[#ff9500] text-lg font-black">done</span>
                Unlimited Donor Database
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-200 font-semibold">
                <span className="material-symbols-outlined text-[#ff9500] text-lg font-black">done</span>
                WhatsApp Notification Alerts
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-200 font-semibold">
                <span className="material-symbols-outlined text-[#ff9500] text-lg font-black">done</span>
                80G Compliance Support
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-200 font-semibold">
                <span className="material-symbols-outlined text-[#ff9500] text-lg font-black">done</span>
                Multi-admin Role Hierarchies
              </li>
            </ul>

            <button
              onClick={handleGetStarted}
              type="button"
              className="w-full py-3.5 bg-[#ff9500] text-[#2d1600] hover:bg-[#8c5000] hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              Start Free Trial
            </button>
          </div>

          {/* Plan 3: Enterprise / Trust */}
          <div className="bg-white border border-[#E8E2D6] rounded-3xl p-8 flex flex-col hover:shadow-md transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#554334]">Trust tier</span>
            <div className="mt-4 mb-6">
              <span className="text-4xl font-extrabold text-[#3A3530]">Custom</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1 border-t border-gray-100 pt-6">
              <li className="flex items-center gap-2 text-xs text-[#554334] font-bold">
                <span className="material-symbols-outlined text-[#8c5000] text-lg font-black">done</span>
                White-labeled custom domains
              </li>
              <li className="flex items-center gap-2 text-xs text-[#554334] font-bold">
                <span className="material-symbols-outlined text-[#8c5000] text-lg font-black">done</span>
                Dedicated security audit log
              </li>
              <li className="flex items-center gap-2 text-xs text-[#554334] font-bold">
                <span className="material-symbols-outlined text-[#8c5000] text-lg font-black">done</span>
                Specialized payment routing api
              </li>
            </ul>

            <button
              onClick={handleGetStarted}
              type="button"
              className="w-full py-3 bg-[#F4F1EB] hover:bg-[#E8E2D6] text-[#3A3530] rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
            >
              Contact Sales
            </button>
          </div>

        </div>
      </section>

      {/* Trust Compliance Grid */}
      <section className="bg-white border-y border-[#E8E2D6]/40 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center text-center">
            
            <div className="space-y-2 p-4">
              <span className="material-symbols-outlined text-[#8c5000] text-3xl font-black">shield</span>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#3A3530]">RBI Compliant</h4>
              <p className="text-[10px] text-[#554334] font-semibold leading-relaxed">Secure gateway allocations passing direct bank payouts.</p>
            </div>

            <div className="space-y-2 p-4 border-t md:border-t-0 md:border-l border-[#E8E2D6]/40">
              <span className="material-symbols-outlined text-[#8c5000] text-3xl font-black">verified_user</span>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#3A3530]">SSL Encryption</h4>
              <p className="text-[10px] text-[#554334] font-semibold leading-relaxed">All transaction packets encrypted end-to-end.</p>
            </div>

            <div className="space-y-2 p-4 border-t md:border-t-0 md:border-l border-[#E8E2D6]/40">
              <span className="material-symbols-outlined text-[#8c5000] text-3xl font-black">dns</span>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#3A3530]">99.9% Uptime</h4>
              <p className="text-[10px] text-[#554334] font-semibold leading-relaxed">Distributed cloud architecture to withstand festival traffic.</p>
            </div>

            <div className="space-y-2 p-4 border-t md:border-t-0 md:border-l border-[#E8E2D6]/40">
              <span className="material-symbols-outlined text-[#8c5000] text-3xl font-black">help_center</span>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#3A3530]">Devoted Support</h4>
              <p className="text-[10px] text-[#554334] font-semibold leading-relaxed">Our support executives help map your trust accounts instantly.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full relative z-10" id="faq">
        <div className="text-center mb-16">
          <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest">
            FAQ Section
          </span>
          <h2 className="text-3xl font-black text-[#3A3530] uppercase tracking-tight mt-1 font-headline-lg">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={item.q}
                className="bg-white border border-[#E8E2D6] rounded-2xl overflow-hidden transition-all shadow-xxs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-5 text-left text-[#3A3530] hover:bg-[#F4F1EB]/30 transition-colors"
                >
                  <span className="text-xs font-black uppercase tracking-wider">{item.q}</span>
                  <span className="material-symbols-outlined text-[#8c5000]">
                    {isOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-50">
                    <p className="text-xs text-[#554334] leading-relaxed font-semibold">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full relative z-10">
        <div className="bg-[#ff9500] rounded-[36px] p-8 md:p-12 text-center relative overflow-hidden border border-[#ff9500]/20 saffron-glow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          
          <div className="relative z-10 space-y-6 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-[#2d1600] uppercase tracking-tight leading-none">
              Empower your community today
            </h2>
            <p className="text-xs md:text-sm text-[#2d1600]/80 font-bold leading-relaxed">
              Join the 500+ Mandals that are already celebrating, coordinating, and receiving collections effectively with UtsavManager.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <button
                onClick={handleGetStarted}
                type="button"
                className="h-14 px-8 bg-[#3A3530] hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all hover:scale-103"
              >
                Get Started Now
              </button>
              <button
                onClick={() => router.push("/public/shri-sai-ganpati-mandal")}
                type="button"
                className="h-14 px-8 bg-white/20 text-[#2d1600] border border-white/30 backdrop-blur-xs rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-all"
              >
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 bg-[#e9e1dc] border-t border-[#dbc2ad] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8c5000] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                temple_hindu
              </span>
              <span className="font-sans font-black text-base tracking-tight text-[#8c5000] uppercase">
                UtsavManager
              </span>
            </div>
            <p className="text-[11px] text-[#554334] leading-relaxed font-semibold">
              Preserving Indian traditions through modern technology. Building stronger, more transparent community connections.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#3A3530]">Product</h4>
            <ul className="space-y-2 text-xs text-[#554334] font-bold uppercase tracking-wider">
              <li><a href="#features" className="hover:text-[#8c5000] transition-all">Donations</a></li>
              <li><a href="#features" className="hover:text-[#8c5000] transition-all">Event Coordination</a></li>
              <li><a href="#features" className="hover:text-[#8c5000] transition-all">Volunteer Force</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#3A3530]">Company</h4>
            <ul className="space-y-2 text-xs text-[#554334] font-bold uppercase tracking-wider">
              <li><a href="#" className="hover:text-[#8c5000] transition-all">About Us</a></li>
              <li><a href="#" className="hover:text-[#8c5000] transition-all">Contact Support</a></li>
              <li><a href="#" className="hover:text-[#8c5000] transition-all">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#3A3530]">Stay Connected</h4>
            <div className="flex gap-2">
              <a className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#8c5000] shadow-sm hover:bg-[#8c5000] hover:text-white transition-all" href="#">
                <span className="material-symbols-outlined text-sm font-bold">share</span>
              </a>
              <a className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#8c5000] shadow-sm hover:bg-[#8c5000] hover:text-white transition-all" href="#">
                <span className="material-symbols-outlined text-sm font-bold">mail</span>
              </a>
            </div>
            <p className="text-[10px] text-[#554334] font-semibold">© 2026 UtsavManager. Crafted for Celebration.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
