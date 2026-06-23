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
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Globe,
  Hourglass,
  ChevronDown,
  PartyPopper,
  ShieldCheck
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

const APP_DOMAIN = "techsonance.co.in";

const COLOR_PRESETS = [
  { name: "Saffron Glow", hex: "#FF9500" },
  { name: "Kumkum Red", hex: "#D92B2B" },
  { name: "Aarti Gold", hex: "#C9921A" },
  { name: "Haldi Yellow", hex: "#EAB308" },
  { name: "Tulsi Green", hex: "#22C55E" },
];

const formatDateString = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

export default function OnboardingPage() {
  const router = useRouter();
  const { userId, tenantId, tenantSlug, setAuth } = useAuthStore();

  // Redirect Logic
  useEffect(() => {
    if (!userId) {
      router.push("/login");
    } else if (tenantId) {
      if (tenantSlug) {
        router.push(`/${tenantSlug}/dashboard`);
      } else {
        router.push("/dashboard");
      }
    }
  }, [userId, tenantId, tenantSlug, router]);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [vertical, setVertical] = useState("ganpati");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [address, setAddress] = useState("");
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
      if (!address.trim() || address.trim().length < 5) {
        setErrorMsg("Address must be at least 5 characters long.");
        return;
      }
    }
    setErrorMsg("");
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
        address,
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
          <div className="absolute -bottom-20 -right-20 w-96 h-96 diya-watermark opacity-20">
            <img
              className="w-full h-full object-contain"
              alt="Intricate traditional Indian diya lamp illustration"
              src="/assets/diya-login.png"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-md w-full glass-card border border-sandstone rounded-3xl p-8 md:p-10 shadow-lg text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-tulsi-green/10 text-tulsi-green rounded-full flex items-center justify-center mx-auto border border-tulsi-green/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-md">
            <h2 className="font-display-xl text-display-xl text-on-surface">Mandal Portal Ready!</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Your digital portal has been launched successfully. Share this URL with volunteers, trustees, and devotees to coordinate event operations.
            </p>
            <span className="block mt-4 font-mono-data text-primary bg-cream/50 py-3 px-4 rounded-xl text-[15px] border border-sandstone font-bold tracking-tight">
              {slug}.{APP_DOMAIN}
            </span>
          </div>
          <button
            onClick={() => {
              if (slug) {
                router.push(`/${slug}/dashboard`);
              } else {
                router.push("/dashboard");
              }
            }}
            className="w-full h-[56px] bg-primary-container text-on-primary-fixed font-headline-sm text-headline-sm rounded-xl shadow-lg hover:bg-primary-container/90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            Enter Organization Portal
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
        <div className="absolute -bottom-20 -right-20 w-96 h-96 diya-watermark opacity-20">
          <img
            className="w-full h-full object-contain"
            alt="Intricate traditional Indian diya lamp illustration"
            src="/assets/diya-login.png"
          />
        </div>
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 py-xl px-margin-mobile flex flex-col items-center">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-xl">
          <div className="w-48 h-24 mb-xs transition-transform duration-300 hover:scale-105">
            <img
              className="w-full h-full object-contain"
              alt="Utsav logo"
              src="/logo.png"
            />
          </div>
          <p className="font-body-md text-body-md text-outline mt-xs">Empowering community celebrations</p>
        </div>
        
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
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Mandal Subdomain</p>
                    <p className="font-mono-data text-mono-data text-primary font-semibold">
                      {isCheckingSlug ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                        </span>
                      ) : (
                        `${slug || "your-mandal"}.${APP_DOMAIN}`
                      )}
                    </p>
                  </div>
                </div>
                {slugCheck?.available && slug.trim().length >= 2 ? (
                  <CheckCircle2 className="h-5 w-5 text-tulsi-green" />
                ) : (
                  <Hourglass className="h-5 w-5 text-outline" />
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
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant h-5 w-5" />
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
              <div className="col-span-1 space-y-2">
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
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant h-5 w-5" />
                </div>
              </div>

              {/* Address */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="address">Address / Location</label>
                <textarea
                  id="address"
                  className="w-full min-h-[96px] bg-white border border-sandstone rounded-xl p-4 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all resize-none"
                  placeholder="e.g. Opp. Railway Station, Lalbaug, Parel"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
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
                    <span className="text-primary font-mono-data font-bold text-sm">{slug}.{APP_DOMAIN}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Location</span>
                    <span className="text-on-surface font-bold text-sm">{city}, {state}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Festival Category</span>
                    <span className="text-on-surface font-bold text-sm">
                      {VERTICALS.find(v => v.id === vertical)?.name || vertical}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Address / Location</span>
                    <span className="text-on-surface font-bold text-sm">{address}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Branding Tone</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full border border-black/5 shadow-inner" style={{ backgroundColor: primaryColor }} />
                      <span className="text-on-surface font-bold text-sm">
                        {COLOR_PRESETS.find(c => c.hex.toLowerCase() === primaryColor.toLowerCase())?.name || "Custom"} ({primaryColor})
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px]">Default Language</span>
                    <span className="text-on-surface font-bold text-sm">
                      {language === "en" ? "English" : language === "hi" ? "Hindi (हिन्दी)" : "Gujarati (ગુજરાતી)"}
                    </span>
                  </div>
                </div>

                {description && (
                  <div className="border-t border-sandstone/50 pt-4 mt-2">
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px] font-bold mb-1">
                      Mandal Bio / Description
                    </span>
                    <p className="text-xs text-on-surface font-bold leading-relaxed">
                      {description}
                    </p>
                  </div>
                )}

                {mainEventName && (
                  <div className="border-t border-sandstone/50 pt-4 mt-2">
                    <span className="text-on-surface-variant block uppercase tracking-wider text-[10px] font-bold mb-1">
                      Primary Event configuration
                    </span>
                    <p className="text-xs text-on-surface leading-relaxed font-bold">
                      {mainEventName}{" "}
                      {startDate && `(from ${formatDateString(startDate)} ${endDate ? `to ${formatDateString(endDate)}` : ""})`}
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
                <ArrowLeft className="h-5 w-5" />
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!name || !slug || !city || !address || (slugCheck && !slugCheck.available)}
                className="flex-grow h-14 bg-primary-container text-on-primary-fixed font-headline-sm text-headline-sm rounded-xl shadow-lg hover:bg-primary-container/90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
                type="button"
              >
                Next Step
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
                    <PartyPopper className="h-5 w-5" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Footer Links */}
      <footer className="mt-xl text-center flex flex-col gap-md py-xl relative z-10">
        <div className="flex justify-center items-center gap-xl text-outline font-label-sm">
          <a className="hover:text-on-surface transition-colors" href="/privacy-policy">Privacy Policy</a>
          <a className="hover:text-on-surface transition-colors" href="/terms-of-service">Terms of Service</a>
          <a className="hover:text-on-surface transition-colors" href="/help-center">Help Center</a>
        </div>
        <p className="text-outline font-label-sm mt-md opacity-60">© {new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.</p>
      </footer>

    </div>
  );
}
