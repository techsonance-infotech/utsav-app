"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@utsav/stores";
import { useFetchTenant, useUpdateTenant } from "@utsav/api-client";
import { Save, Flame, Globe, MessageSquare, AlertCircle } from "lucide-react";

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
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings.");
    }
  };

  if (isLoading) {
    return <div className="text-neutral-400">Loading settings...</div>;
  }

  const activeColor = tenant?.primary_color || "#FF9500";

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif text-neutral-100">Organization Settings</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Configure branding, locale, vertical categories, and custom preferences for your portal.
        </p>
      </div>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <Save className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-neutral-900 border border-neutral-850 rounded-2xl p-6 md:p-8 space-y-6">
        {/* Branding Section */}
        <div className="border-b border-neutral-850 pb-6 space-y-4">
          <h2 className="text-lg font-bold text-neutral-200 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Branding & Styling
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Vertical Category
              </label>
              <select
                value={vertical}
                onChange={(e) => setVertical(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-orange-500"
              >
                {VERTICALS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Primary Theme Color
            </label>
            <div className="flex flex-wrap gap-3">
              {COLOR_PRESETS.map((color) => (
                <button
                  type="button"
                  key={color.hex}
                  onClick={() => setPrimaryColor(color.hex)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    primaryColor === color.hex
                      ? "bg-neutral-850 border-orange-500 text-white"
                      : "bg-neutral-950 border-neutral-850 hover:bg-neutral-800 text-neutral-400"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: color.hex }} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Details Section */}
        <div className="border-b border-neutral-850 pb-6 space-y-4">
          <h2 className="text-lg font-bold text-neutral-200 flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-500" /> Geography & Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                City / Town
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Founded Year
              </label>
              <input
                type="number"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                placeholder="e.g. 2012"
                className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Full Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              About Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Integration links */}
        <div className="pb-4 space-y-4">
          <h2 className="text-lg font-bold text-neutral-200 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-500" /> Digital Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Website Link
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                WhatsApp Group link
              </label>
              <input
                type="url"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {(role === "owner" || role === "admin") && (
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={updateTenantMutation.isPending}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-500/10"
            >
              <Save className="w-5 h-5" />
              {updateTenantMutation.isPending ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
