"use client";

import React, { useState, useEffect } from "react";
import { useCheckSlug, useCreateTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle
} from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const VERTICALS = [
  { id: "ganpati", name: "Ganesh Chaturthi Mandal" },
  { id: "temple", name: "Temple / Devasthanam Trust" },
  { id: "navratri", name: "Navratri / Garba Committee" },
  { id: "diwali", name: "Diwali / Mela Committee" },
  { id: "cultural", name: "Cultural / Community Association" },
  { id: "charity", name: "Charitable Trust" },
  { id: "other", name: "Other Festival" },
];

const COLOR_PRESETS = [
  { name: "Saffron Glow", hex: "#FF9500" },
  { name: "Kumkum Red", hex: "#D92B2B" },
  { name: "Aarti Gold", hex: "#C9921A" },
  { name: "Haldi Yellow", hex: "#EAB308" },
  { name: "Tulsi Green", hex: "#22C55E" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { userId, tenantId, setAuth } = useAuthStore();

  // Redirect Logic
  useEffect(() => {
    if (!userId) {
      router.push("/login");
    } else if (tenantId) {
      router.push("/dashboard");
    }
  }, [userId, tenantId, router]);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [vertical, setVertical] = useState("ganpati");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [primaryColor, setPrimaryColor] = useState("#FF9500");
  const [language, setLanguage] = useState("en");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mainEventName, setMainEventName] = useState("");
  const [description, setDescription] = useState("");
  const [launchSuccess, setLaunchSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Check Slug Hook
  const { data: slugCheck, isLoading: isCheckingSlug } = useCheckSlug(name);
  const createTenantMutation = useCreateTenant();

  // Keep slug updated with suggestions or defaults
  useEffect(() => {
    if (slugCheck?.available && slugCheck.slug) {
      setSlug(slugCheck.slug);
    }
  }, [slugCheck]);

  const handleNext = () => {
    if (step === 1) {
      if (!name || name.trim().length < 2) return;
      if (!slug || slug.trim().length < 2) return;
      if (!city.trim()) return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleLaunch = async () => {
    setErrorMsg("");
    try {
      const res = await createTenantMutation.mutateAsync({
        name,
        slug,
        vertical,
        city,
        state,
        primary_color: primaryColor,
        default_language: language,
        description: `${description || "No description provided."} Main Event: ${mainEventName || "Annual Festival"}. Dates: ${startDate || "TBD"} to ${endDate || "TBD"}.`,
      });

      // Update auth store
      setAuth({
        tenantId: res.id,
        tenantName: res.name,
        tenantSlug: res.slug,
        role: "owner"
      });

      setLaunchSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create organization. Check fields.");
    }
  };

  // If not logged in or already has a tenant, render loading while redirecting
  if (!userId || tenantId) {
    return (
      <div className="min-h-screen bg-puja-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 1. Success Launch View
  if (launchSuccess) {
    return (
      <div className="bg-puja-white min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
        
        {/* Decorative Marigold Garlands */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 right-0 flex justify-between px-12 md:px-24">
            <div className="w-16 h-64 opacity-40">
              <img className="w-full h-full object-contain" alt="Hanging marigold flower garland string" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFNO1Mqqxkrz--Rm8M099HuaGojshxX61r3K-hIaTGpP7nOnFf5bd4UiMuamq3p5zKYkJ8DgF4r-q7JTQqHJkTDv_FWqTJ55kUgNP9wdhChiJvva-QJFUzE-ebtRi69btPzdzJVYBZj2dmfjqU4mlNXgUgU0uo2CB54SuaM1NYuXEVFL4CL1I4AtAnTYqwgIUjo1X9kYUhAlOetmQKwe3F1nSI-CrkkESCEpEkA0is0rBkFugrBCHo" />
            </div>
            <div className="w-16 h-64 opacity-40">
              <img className="w-full h-full object-contain" alt="Hanging marigold flower garland string" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQh0KBtV23G31DHZ8RGBpMDFQWfOtrMY478Z7NSiMrz0uquIuBJp9GYOsPPoT7wzlpsulUVbZH-hzoPjdDcYkck3iE1rsdmfn6iJEXK8yZKv1qwDv1s1hGmkv35efN6jfVjaeoKTt9oS4hgZrX4ZM9zAvb_BewWI1VfMZhXoQ2r_PcCEGuPHKoTF207hzI88NX7TV4XR9M8fpfeyW1QNz99_yyQ2NdAB17-B4OahVZ7SjwjR11bA9n" />
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-md w-full glass-card border border-sandstone rounded-3xl p-8 md:p-10 shadow-lg text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-tulsi-green/10 text-tulsi-green rounded-full flex items-center justify-center mx-auto border border-tulsi-green/20">
            <span className="material-symbols-outlined text-[40px]">verified</span>
          </div>
          <div className="space-y-md">
            <h2 className="font-display-xl text-display-xl text-on-surface">Mandal Portal Ready!</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Your digital portal has been launched successfully. Share this URL with volunteers, trustees, and devotees to coordinate event operations.
            </p>
            <span className="block mt-4 font-mono-data text-primary bg-cream/50 py-3 px-4 rounded-xl text-[15px] border border-sandstone font-bold tracking-tight">
              {slug}.utsav.app
            </span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full h-[56px] bg-primary-container text-on-primary-fixed font-headline-sm text-headline-sm rounded-xl shadow-lg hover:bg-primary-container/90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            Enter Organization Portal
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  // Helper step text
  const stepTitles = [
    "Mandal Identity",
    "Branding & Style",
    "Timeline Settings",
    "Confirm & Launch"
  ];

  return (
    <div className="bg-puja-white font-body-md text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Top Header / Branding Anchor */}
      <header className="fixed top-0 left-0 w-full z-50 px-margin-mobile md:px-margin-desktop h-16 flex justify-between items-center bg-puja-white/80 backdrop-blur-md border-b border-sandstone">
        <div className="flex items-center gap-2">
          <div className="w-28 h-12 transition-transform duration-300 hover:scale-105">
            <img
              className="w-full h-full object-contain"
              alt="Utsav logo"
              src="/logo.png"
            />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-md">
          <span className="font-label-md text-label-md text-on-surface-variant">Setup Assistance</span>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">help_outline</button>
        </div>
      </header>

      {/* Decorative Background Illustrations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top Marigold Garland */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-12 md:px-24">
          <div className="w-16 h-64 opacity-50">
            <img className="w-full h-full object-contain" alt="Hanging marigold garland" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFNO1Mqqxkrz--Rm8M099HuaGojshxX61r3K-hIaTGpP7nOnFf5bd4UiMuamq3p5zKYkJ8DgF4r-q7JTQqHJkTDv_FWqTJ55kUgNP9wdhChiJvva-QJFUzE-ebtRi69btPzdzJVYBZj2dmfjqU4mlNXgUgU0uo2CB54SuaM1NYuXEVFL4CL1I4AtAnTYqwgIUjo1X9kYUhAlOetmQKwe3F1nSI-CrkkESCEpEkA0is0rBkFugrBCHo" />
          </div>
          <div className="w-16 h-48 opacity-30 hidden md:block">
            <img className="w-full h-full object-contain" alt="Decorative festive marigolds" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf3Ogia6jidRTjUNfqvMrpfThytPIRaz1kMEHsdcsqmCtZQpxHfsVm3sIbUkO90j-SoXF8Ir7s3r6PpTLvVEDkPqeuVC0voQA1QtoAd4ZyXSqSA5qeUOuqtCvfgC_ecYKPuMky4E0bg2cRogaxvVmZryPPIfQ-EL5X_-gnQVCf48Ay71YZu8xu6CtGZqvH9ZocYJ6h5sAMqRqyhNQuGOd3rzmzQKhP47ER0k90uWzpFE6vFoxxbzjf" />
          </div>
          <div className="w-16 h-64 opacity-50">
            <img className="w-full h-full object-contain" alt="Hanging marigold garland" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQh0KBtV23G31DHZ8RGBpMDFQWfOtrMY478Z7NSiMrz0uquIuBJp9GYOsPPoT7wzlpsulUVbZH-hzoPjdDcYkck3iE1rsdmfn6iJEXK8yZKv1qwDv1s1hGmkv35efN6jfVjaeoKTt9oS4hgZrX4ZM9zAvb_BewWI1VfMZhXoQ2r_PcCEGuPHKoTF207hzI88NX7TV4XR9M8fpfeyW1QNz99_yyQ2NdAB17-B4OahVZ7SjwjR11bA9n" />
          </div>
        </div>
        
        {/* Decorative Arch (Asymmetric) */}
        <div className="absolute -right-20 top-1/4 w-[400px] h-[600px] opacity-[0.06]">
          <img className="w-full h-full object-contain" alt="Traditional Indian architectural temple arch outline decoration" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVDZZo7-qPTeVLMolGaARX5RhNGe_DZrbiUcWyTQx3DJjOShi04yW1sWzxPEtkdL7gbHZjJjmraN-odLOSQWUhOVpusQheNqqZnDG3Ul5Wto96wfHn0MG2Mw3kYGu-4Q6v76Ik0beCpZZmbeKznd2qxg16uBpLRkCA_XVr93lXBzQdX2bYPBDQOt1i_35PHEJXVQK_IZQ-fVixYgSy_ROcf5L2PWW5DHkPnEf8D_gyBqUfLO6r6mCr" />
        </div>

        {/* Floating Diyas */}
        <div className="absolute bottom-10 left-10 animate-breathe diya-glow">
          <div className="w-20 h-20">
            <img className="w-full h-full object-contain" alt="Glowing traditional diya clay lamp illustration" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFB4nRD5FgPruUkJgUj08z0Ie6gondOiPzIwjEOVuZJEqkRA6742qv5d3ObKrNofMEDL_6Fh7E6K0SRtwQmWfHfjOP4UIoLVGKiu62vHKfd73KpjPaJo0Lz-3-kxq-ox8pW57l8SFI_mn84ZLtHuty4dYDuPM6GDrOokRo3s_mmpZ3tuupYEZRGFjsKsiR_5dhLJVSlRchA3vlFvu7waOK0FD8Zit7GIjs6fhHJ42uYQ4KOifOaA_F" />
          </div>
        </div>
        <div className="absolute bottom-24 right-20 animate-breathe diya-glow" style={{ animationDelay: "1.5s" }}>
          <div className="w-16 h-16">
            <img className="w-full h-full object-contain" alt="Decorative festive diya" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXQeAyRS6_udQbf50CoEG5-uxJ_DaSF06EZO8aLArKCyAoMg4xnvfbur4wPMSmLnUL9nxXxYbKB2t98QVxUOXVw1SwJbd0jSo_WB9RFimqSpUHCcKyCktQaBvvNvb7MDLJ99Q7mfk5tw_536buirLeIk3YWh-M4NcF3IfMRsVz1twHC8-UnHa89ugBwwhLfUq5GV48YW57sVRVow99ySzD8t7Rk7cheIbPjU01TMTBiZ-6RzIRmMiz" />
          </div>
        </div>
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 pt-32 pb-xl px-margin-mobile flex flex-col items-center">
        
        {/* Step Indicator */}
        <div className="w-full max-w-2xl mb-xl">
          <div className="flex justify-between items-center mb-base px-2">
            <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">Step {step} of 4</span>
            <span className="font-label-md text-label-md text-on-surface-variant">{stepTitles[step - 1]}</span>
          </div>
          <div className="h-2 w-full bg-sandstone rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Bento Layout Form Card */}
        <div className="w-full max-w-2xl glass-card rounded-2xl shadow-md p-lg md:p-xl space-y-lg">
          
          <header className="mb-md">
            <h1 className="font-display-xl text-display-xl text-charcoal mb-2">Create Your Portal</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Provide details about your trust, events, and branding preferences.</p>
          </header>

          {errorMsg && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* STEP 1: Mandal Identity */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg animate-in fade-in duration-300">
              {/* Mandal Name (Full Width) */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="mandal-name">Mandal / Organization Name</label>
                <input
                  className="w-full h-14 bg-white border border-sandstone rounded-xl px-4 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                  id="mandal-name"
                  placeholder="e.g. Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Subdomain Preview (Full Width Accent) */}
              <div className="col-span-1 md:col-span-2 bg-cream/50 rounded-xl p-md border border-sandstone flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">language</span>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Mandal Subdomain</p>
                    <p className="font-mono-data text-mono-data text-primary font-semibold">
                      {isCheckingSlug ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                        </span>
                      ) : (
                        `${slug || "your-mandal"}.utsav.app`
                      )}
                    </p>
                  </div>
                </div>
                {slugCheck?.available && slug.trim().length >= 2 ? (
                  <span className="material-symbols-outlined text-tulsi-green">verified</span>
                ) : (
                  <span className="material-symbols-outlined text-outline">hourglass_empty</span>
                )}
              </div>

              {/* Subdomain slug override options */}
              {slugCheck && !slugCheck.available && (
                <div className="col-span-1 md:col-span-2 bg-rose-50/50 p-md border border-rose-100 rounded-xl space-y-2">
                  <p className="text-xs text-rose-700 font-semibold">Subdomain already taken. Try these available variants:</p>
                  <div className="flex flex-wrap gap-2">
                    {slugCheck.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSlug(s)}
                        className="text-xs bg-white hover:bg-cream border border-sandstone rounded-lg px-2.5 py-1 font-mono-data text-primary font-bold transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="col-span-1 space-y-2">
                <label className="block font-label-md text-label-md text-on-surface">Festival Category</label>
                <div className="relative">
                  <select
                    className="w-full h-14 bg-white border border-sandstone rounded-xl px-4 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none appearance-none"
                    value={vertical}
                    onChange={(e) => setVertical(e.target.value)}
                  >
                    {VERTICALS.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>

              {/* City */}
              <div className="col-span-1 space-y-2">
                <label className="block font-label-md text-label-md text-on-surface">City / Village</label>
                <input
                  className="w-full h-14 bg-white border border-sandstone rounded-xl px-4 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                  placeholder="e.g. Surat"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              {/* State */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="block font-label-md text-label-md text-on-surface">State</label>
                <div className="relative">
                  <select
                    className="w-full h-14 bg-white border border-sandstone rounded-xl px-4 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none appearance-none"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Branding Settings */}
          {step === 2 && (
            <div className="space-y-lg animate-in fade-in duration-300">
              
              {/* Presets Grid */}
              <div className="space-y-xs">
                <label className="block font-label-md text-label-md text-on-surface mb-2">Accent Color Theme Preset</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setPrimaryColor(color.hex)}
                      className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        primaryColor === color.hex
                          ? "bg-cream border-primary text-primary shadow-sm"
                          : "bg-white border-sandstone hover:border-outline text-on-surface-variant"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full border border-black/5 shadow-inner"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] font-bold truncate tracking-tight">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-xs">
                <label className="block font-label-md text-label-md text-on-surface">Default Portal Language</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: "en", name: "English" },
                    { code: "hi", name: "Hindi (हिन्दी)" },
                    { code: "gu", name: "Gujarati (ગુજરાતી)" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`h-12 rounded-xl border text-xs font-bold transition-all ${
                        language === lang.code
                          ? "bg-cream border-primary text-primary shadow-sm"
                          : "bg-white border-sandstone hover:border-outline text-on-surface-variant"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-xs">
                <label className="block font-label-md text-label-md text-on-surface">Mandal Bio / Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share a short summary about the mandal history, community charity work, or special decorations planned for the festive season..."
                  className="w-full p-4 bg-white border border-sandstone rounded-xl font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all resize-none"
                />
              </div>

            </div>
          )}

          {/* STEP 3: Timeline Settings */}
          {step === 3 && (
            <div className="space-y-lg animate-in fade-in duration-300">
              
              {/* Event Name */}
              <div className="space-y-xs">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="event-name">Primary Festival Event Name</label>
                <input
                  className="w-full h-14 bg-white border border-sandstone rounded-xl px-4 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                  id="event-name"
                  placeholder="e.g. Ganesh Chaturthi Mahotsav 2026"
                  type="text"
                  value={mainEventName}
                  onChange={(e) => setMainEventName(e.target.value)}
                />
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="space-y-xs">
                  <label className="block font-label-md text-label-md text-on-surface">Festival Start Date</label>
                  <input
                    className="w-full h-14 bg-white border border-sandstone rounded-xl px-4 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block font-label-md text-label-md text-on-surface">Festival End Date</label>
                  <input
                    className="w-full h-14 bg-white border border-sandstone rounded-xl px-4 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: Confirm & Launch */}
          {step === 4 && (
            <div className="space-y-lg animate-in fade-in duration-300">
              
              <div className="bg-cream/40 border border-sandstone rounded-2xl p-6 space-y-4">
                <h3 className="font-headline-sm text-headline-sm text-primary border-b border-sandstone/50 pb-2">Workspace Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs font-semibold">
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Mandal Name</span>
                    <span className="text-on-surface font-bold text-sm">{name}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Web Subdomain</span>
                    <span className="text-primary font-mono-data font-bold text-sm">{slug}.utsav.app</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Location</span>
                    <span className="text-on-surface font-bold text-sm">{city}, {state}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Festival Category</span>
                    <span className="text-on-surface font-bold text-sm capitalize">{vertical}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Branding Tone</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-4.5 h-4.5 rounded-full border border-black/5" style={{ backgroundColor: primaryColor }} />
                      <span className="text-on-surface font-bold text-sm">{primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Default Language</span>
                    <span className="text-on-surface font-bold text-sm uppercase">{language}</span>
                  </div>
                </div>

                {mainEventName && (
                  <div className="border-t border-sandstone/50 pt-4 mt-2">
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px] font-bold mb-1">
                      Primary Event configuration
                    </span>
                    <p className="text-xs text-on-surface leading-relaxed font-bold">
                      {mainEventName}{" "}
                      {startDate && `(from ${startDate} ${endDate ? `to ${endDate}` : ""})`}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="pt-md flex gap-md">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={createTenantMutation.isPending}
                className="h-14 px-md bg-white border border-sandstone hover:bg-cream/35 text-on-surface-variant font-headline-sm text-headline-sm rounded-xl transition-all flex items-center justify-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!name || !slug || !city || (slugCheck && !slugCheck.available)}
                className="flex-grow h-14 bg-primary-container text-on-primary-fixed font-headline-sm text-headline-sm rounded-xl shadow-lg hover:bg-primary-container/90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
                type="button"
              >
                Next Step
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleLaunch}
                disabled={createTenantMutation.isPending}
                className="flex-grow h-14 bg-primary-container text-on-primary-fixed font-headline-sm text-headline-sm rounded-xl shadow-lg hover:bg-primary-container/90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                type="button"
              >
                {createTenantMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Launching Portal...
                  </>
                ) : (
                  <>
                    Launch Portal
                    <span className="material-symbols-outlined">celebration</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* Trust Badges / Info Footer */}
        <div className="mt-xl flex flex-wrap justify-center gap-lg relative z-10">
          <div className="flex items-center gap-2 bg-tulsi-green/10 text-tulsi-green px-4 py-2 rounded-full border border-tulsi-green/20">
            <span className="material-symbols-outlined text-[18px]">security</span>
            <span className="font-label-sm text-label-sm font-bold">Secure Data Handling</span>
          </div>
          <div className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full border border-primary/10">
            <span className="material-symbols-outlined text-[18px]">celebration</span>
            <span className="font-label-sm text-label-sm font-bold">5,000+ Mandals Registered</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-xl px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-lg border-t border-sandstone bg-surface-container-low mt-3xl">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-headline-sm text-headline-sm text-primary font-bold">Utsav</span>
          <p className="font-body-md text-body-md text-on-surface-variant">© 2026 Utsav Digital Platforms. All rights reserved.</p>
        </div>
        <div className="flex gap-lg">
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">Contact</a>
        </div>
      </footer>

    </div>
  );
}
