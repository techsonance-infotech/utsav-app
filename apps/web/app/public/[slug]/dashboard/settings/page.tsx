"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@utsav/stores";
import { useFetchTenant, useUpdateTenant } from "@utsav/api-client";
import { Save, Flame, Globe, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";

const COLOR_PRESETS = [
  { name: "Saffron Glow", hex: "#FF9500" },
  { name: "Kumkum Crimson", hex: "#D92B2B" },
  { name: "Aarti Gold", hex: "#C9921A" },
  { name: "Marigold Yellow", hex: "#EAB308" },
  { name: "Puja Green", hex: "#22C55E" },
];

const VERTICALS = [
  { id: "ganpati", name: "Ganpati Utsav Mandal" },
  { id: "temple", name: "Temple / Devasthanam Trust" },
  { id: "navratri", name: "Navratri / Garba Committee" },
  { id: "diwali", name: "Diwali / Mela Committee" },
  { id: "cultural", name: "Cultural / Community Association" },
  { id: "charity", name: "Charitable Trust" },
  { id: "other", name: "Other Festival" },
];

export default function SettingsPage() {
  const { tenantId, role } = useAuthStore();
  const { data: tenant, isLoading } = useFetchTenant(tenantId);
  const updateTenantMutation = useUpdateTenant();

  const [name, setName] = useState("");
  const [vertical, setVertical] = useState("ganpati");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#FF9500");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-fill state when tenant loads
  useEffect(() => {
    if (tenant) {
      setName(tenant.name || "");
      setVertical(tenant.vertical || "ganpati");
      setCity(tenant.city || "");
      setState(tenant.state || "");
      setPrimaryColor(tenant.primary_color || "#FF9500");
      setDescription(tenant.description || "");
      setAddress(tenant.address || "");
      setWebsiteUrl(tenant.website_url || "");
      setWhatsappUrl(tenant.whatsapp_group_url || "");
      setFoundedYear(tenant.founded_year?.toString() || "");
    }
  }, [tenant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!tenantId) return;

    // Check permissions: only admin or owner
    if (role !== "owner" && role !== "admin") {
      setErrorMsg("Only the organization Owner or Admin can update settings.");
      return;
    }

    try {
      await updateTenantMutation.mutateAsync({
        id: tenantId,
        name,
        vertical,
        city,
        state,
        primary_color: primaryColor,
        description,
        address,
        website_url: websiteUrl,
        whatsapp_group_url: whatsappUrl,
        founded_year: foundedYear ? parseInt(foundedYear) : null,
      } as any);

      setSuccessMsg("Organization settings updated successfully!");
      // Auto-clear success message after 4s
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings.");
    }
  };

  const handleDiscard = () => {
    if (tenant) {
      setName(tenant.name || "");
      setVertical(tenant.vertical || "ganpati");
      setCity(tenant.city || "");
      setState(tenant.state || "");
      setPrimaryColor(tenant.primary_color || "#FF9500");
      setDescription(tenant.description || "");
      setAddress(tenant.address || "");
      setWebsiteUrl(tenant.website_url || "");
      setWhatsappUrl(tenant.whatsapp_group_url || "");
      setFoundedYear(tenant.founded_year?.toString() || "");
      setSuccessMsg("");
      setErrorMsg("");
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-on-surface-variant w-full bg-puja-white rounded-xl border border-sandstone">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Loading Mandal Settings...</span>
      </div>
    );
  }

  const generatedSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      <div className="max-w-[860px] space-y-lg">
        <header className="mb-8">
          <h1 className="font-display-xl text-display-xl text-charcoal font-bold mb-1">Mandal Settings</h1>
          <p className="text-body-lg text-on-surface-variant">
            Configure your organization's core identity and operational preferences.
          </p>
        </header>

      {successMsg && (
        <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] p-4 rounded-xl text-sm flex items-center gap-2 mb-6 font-semibold animate-in fade-in duration-300">
          <Save className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-[#D92B2B]/10 border border-[#D92B2B]/30 text-[#D92B2B] p-4 rounded-xl text-sm flex items-center gap-2 mb-6 font-semibold animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Organisation Identity Section */}
        <section className="bg-puja-white rounded-xl border border-sandstone shadow-sm overflow-hidden">
          <div className="p-6 border-b border-sandstone bg-surface-container-low">
            <h2 className="text-headline-sm font-bold text-charcoal flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" /> Organisation Identity
            </h2>
            <p className="text-label-sm text-on-surface-variant mt-0.5">
              Manage how your Mandal appears to members and donors.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="relative group self-center md:self-start">
                <div className="w-24 h-24 rounded-2xl bg-cream border-2 border-dashed border-outline-variant flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors">
                  <img
                    className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                    alt="Mandal Logo"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBmVmEk9cwkZD9vSAZloi8sZQZGICXJJLU-bmG4LuhJc8F1g9OVCHnK__KDs8AEfYQDoggqxnEO76Lwe7ij-5bo-gxremwJjPdMmxAG7pjCeXMpJyQweGi_UWBj7QlWzfqQpWpJNh3mB-vW2ZX4EEPyXhUbbsa0EZxdwjn0BcwnsEfauNKPFmo04jGE3li3PmLqSMKZiyGdpqnjJAIRH0tquOopBC77edsfEvFEaOoTy1tCopmBq6f2E5YdPrc-MW7MIGiHneKBBE"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-primary">upload</span>
                    <span className="text-[10px] font-bold text-primary uppercase">Change</span>
                  </div>
                </div>
                <label className="block text-center mt-1 text-xs font-semibold text-on-surface-variant">Mandal Logo</label>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">Organisation Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md bg-white text-charcoal font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">Public Slug</label>
                  <div className="flex items-center">
                    <span className="px-4 py-2.5 bg-surface-container border border-r-0 border-sandstone rounded-l-xl text-on-surface-variant text-label-md font-bold">
                      utsav.app/
                    </span>
                    <input
                      type="text"
                      disabled
                      value={generatedSlug}
                      className="w-full px-4 py-2.5 rounded-r-xl border border-sandstone bg-[#F4F1EB]/50 text-outline outline-none transition-all font-mono-data font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">Vertical Category</label>
                <select
                  value={vertical}
                  onChange={(e) => setVertical(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none bg-white text-charcoal font-bold cursor-pointer"
                >
                  {VERTICALS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">Founded Year</label>
                <input
                  type="number"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="e.g. 2012"
                  className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md bg-white text-charcoal font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-md text-on-surface-variant mb-2 font-semibold">Primary Theme Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    type="button"
                    key={color.hex}
                    onClick={() => setPrimaryColor(color.hex)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      primaryColor === color.hex
                        ? "bg-primary-container/20 border-primary text-primary"
                        : "bg-white border-sandstone hover:bg-cream/40 text-on-surface-variant"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Regional Preferences Section */}
        <section className="bg-puja-white rounded-xl border border-sandstone shadow-sm overflow-hidden">
          <div className="p-6 border-b border-sandstone bg-surface-container-low">
            <h2 className="text-headline-sm font-bold text-charcoal flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Regional Preferences
            </h2>
            <p className="text-label-sm text-on-surface-variant mt-0.5">
              Set your local language and time standards.
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">Primary Language</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none bg-white text-charcoal font-semibold cursor-pointer">
                <option>English (International)</option>
                <option selected>Marathi (मराठी)</option>
                <option>Hindi (हिन्दी)</option>
                <option>Gujarati (ગુજરાતી)</option>
              </select>
            </div>

            <div>
              <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">Default Timezone</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none bg-white text-charcoal font-semibold cursor-pointer">
                <option selected>(GMT+05:30) Mumbai, Kolkata, New Delhi</option>
                <option>(GMT+00:00) UTC</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">Full Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md bg-white text-charcoal font-semibold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">City / Town</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md bg-white text-charcoal font-semibold"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md bg-white text-charcoal font-semibold"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">About Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md bg-white text-charcoal font-semibold"
              />
            </div>
          </div>
        </section>

        {/* Financial Config Section */}
        <section className="bg-puja-white rounded-xl border border-sandstone shadow-sm overflow-hidden">
          <div className="p-6 border-b border-sandstone bg-surface-container-low flex justify-between items-center">
            <div>
              <h2 className="text-headline-sm font-bold text-charcoal flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Financial Config & Links
              </h2>
              <p className="text-label-sm text-on-surface-variant mt-0.5">
                Connect your payment gateway and configure digital portals.
              </p>
            </div>
            <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded-full font-label-sm flex items-center gap-1 font-bold text-xs">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              Connected
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div className="p-4 bg-cream/50 rounded-xl border border-sandstone flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg border border-sandstone flex items-center justify-center p-2">
                  <img
                    className="w-full h-auto"
                    alt="Razorpay"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIoxEpAXK9oKihGPMPhof2ZjBHX0lhySvKUg4BCjyaSTAa4xO2k2EG1Secfw43MqoPpt7XLrp9LFk_D_nmEgmSwSRTKogTrNFlspSKwpipIiMYYL9FffEar9NakTSmmAPbcaNF3-0eFsasN4eb-uS3WVhag6VQh8PeRwwZ9Dt4850iU-m5HkU7Zn6Lm7Si8_BZ5bOoW06EQZW9MNXJdNUVGKN2Jb09D8BAbN7EyFbugPocm6E9_1IDtnA0UNcvMHS5CM_3UcYYGIs"
                  />
                </div>
                <div>
                  <p className="font-semibold text-charcoal text-sm">Razorpay Integration</p>
                  <p className="text-xs text-on-surface-variant">Active: mid_H8j7K9l2M1n0</p>
                </div>
              </div>
              <button type="button" className="text-primary font-bold text-xs hover:underline">Reconfigure</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">Website Link</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md bg-white text-charcoal font-semibold"
                />
              </div>

              <div>
                <label className="block font-label-md text-on-surface-variant mb-1 font-semibold">WhatsApp Group Link</label>
                <input
                  type="url"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-sandstone focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md bg-white text-charcoal font-semibold"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                id="auto-receipt"
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-sandstone text-primary focus:ring-primary-container cursor-pointer mt-0.5"
              />
              <label htmlFor="auto-receipt" className="text-sm text-on-surface-variant cursor-pointer font-semibold select-none leading-tight">
                Auto-generate e-receipts for all digital donations via WhatsApp notifications
              </label>
            </div>
          </div>
        </section>

        {/* Action Footer */}
        <footer className="mt-8 py-6 flex items-center justify-end gap-4 border-t border-sandstone">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-6 py-3 rounded-xl font-bold text-charcoal bg-cream border border-sandstone hover:bg-surface-container-high transition-all active:scale-95 text-xs uppercase tracking-wider"
          >
            Discard Changes
          </button>
          {(role === "owner" || role === "admin") && (
            <button
              type="submit"
              disabled={updateTenantMutation.isPending}
              className="px-8 py-3 rounded-xl font-bold text-on-primary bg-primary saffron-glow hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 relative overflow-hidden text-xs uppercase tracking-wider"
            >
              {updateTenantMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          )}
        </footer>
      </form>
    </div>
  </div>
  );
}
