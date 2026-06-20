"use client";

import React, { useState } from "react";
import { useCreateDonation } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { useRouter, usePathname } from "next/navigation";
import { Heart, CheckCircle2, AlertCircle, Sparkles, Lock } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
}

interface DonationFormProps {
  tenantId: string;
  campaigns: Campaign[];
  primaryColor: string;
}

export default function DonationForm({ tenantId, campaigns, primaryColor }: DonationFormProps) {
  const createDonationMutation = useCreateDonation();
  const { userId } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [form, setForm] = useState({
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    campaignId: "",
    amount: "",
    note: "",
    isAnonymous: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  if (!userId) {
    return (
      <div className="text-center py-12 px-6 bg-slate-50/50 border border-zinc-200/70 rounded-2xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-amber-600 animate-pulse">
          <Lock className="w-5.5 h-5.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">Secure Login Required</h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed">
            To fulfill audit compliance, track contributions, and issue verified 80G tax receipts instantly, please sign in to your account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          }}
          className="mt-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-98"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  const amounts = [501, 1001, 2100, 5100];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.donorName.trim()) {
      newErrors.donorName = "Donor name is required";
    }

    if (!form.amount || Number(form.amount) <= 0) {
      newErrors.amount = "Contribution amount must be greater than 0";
    }

    if (form.donorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.donorEmail)) {
      newErrors.donorEmail = "Please enter a valid email address";
    }

    if (form.donorPhone.trim() && !/^\d{10}$/.test(form.donorPhone.trim())) {
      newErrors.donorPhone = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createDonationMutation.mutateAsync({
        donor_name: form.isAnonymous ? "Anonymous" : form.donorName,
        donor_phone: form.donorPhone || undefined,
        donor_email: form.donorEmail || undefined,
        amount: Number(form.amount),
        mode: "online",
        campaign_id: form.campaignId || undefined,
        is_anonymous: form.isAnonymous,
        note: form.note || undefined,
      });

      setSuccess(true);
      setForm({
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        campaignId: "",
        amount: "",
        note: "",
        isAnonymous: false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10 px-4 bg-green-50 border border-green-200/50 rounded-2xl flex flex-col items-center gap-4">
        <CheckCircle2 className="w-12 h-12 text-green-600 animate-bounce" />
        <div>
          <h3 className="text-lg font-black text-green-800">Donation Successful!</h3>
          <p className="text-xs text-green-700 mt-2 max-w-sm">
            Thank you for your generous contribution. Seek blessings of the deity. Your contribution receipt has been generated.
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all"
        >
          Make Another Donation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {createDonationMutation.isError && (
          <div className="p-4 bg-red-50 border border-red-200/50 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="font-bold">An error occurred while placing donation. Please try again.</p>
          </div>
        )}

        {/* Predefined Amounts Selection */}
        <div className="space-y-3">
          <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
            Select Donation Amount
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amounts.map((amt) => {
              const isSelected = form.amount === String(amt);
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setForm({ ...form, amount: String(amt) })}
                  className={`py-3 border.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${
                    isSelected
                      ? "text-white shadow-sm"
                      : "bg-[#FAFAF8] border-[#E8E2D6] text-gray-700 hover:border-[#8c5000] hover:bg-[#F4F1EB]"
                  }`}
                  style={{
                    backgroundColor: isSelected ? primaryColor : undefined,
                    borderColor: isSelected ? primaryColor : undefined,
                  }}
                >
                  ₹{amt}
                </button>
              );
            })}
          </div>
          
          <div className="relative mt-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#554334] font-bold text-sm">₹</span>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Enter custom amount"
              className={`w-full pl-8 pr-4 py-3 bg-[#F4F1EB] border ${
                errors.amount ? "border-red-500" : "border-[#E8E2D6]"
              } rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#8c5000]`}
            />
          </div>
          {errors.amount && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.amount}</p>}
        </div>

        {/* Campaign Selector */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
            Select Campaign (Optional)
          </label>
          <select
            value={form.campaignId}
            onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
            className="w-full px-4 py-3 bg-[#F4F1EB] border border-[#E8E2D6] rounded-xl text-xs font-bold text-[#554334] focus:outline-none focus:ring-1 focus:ring-[#8c5000]"
          >
            <option value="">General Donation</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Donor Details */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
              Donor Full Name
            </label>
            <input
              type="text"
              value={form.donorName}
              onChange={(e) => setForm({ ...form, donorName: e.target.value })}
              placeholder="e.g. Rajesh Kumar"
              className={`w-full px-4 py-3 bg-[#F4F1EB] border ${
                errors.donorName ? "border-red-500" : "border-[#E8E2D6]"
              } rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#8c5000]`}
              disabled={form.isAnonymous}
            />
            {errors.donorName && !form.isAnonymous && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{errors.donorName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
                Mobile Number
              </label>
              <input
                type="text"
                value={form.donorPhone}
                onChange={(e) => setForm({ ...form, donorPhone: e.target.value })}
                placeholder="e.g. 9876543210"
                className={`w-full px-4 py-3 bg-[#F4F1EB] border ${
                  errors.donorPhone ? "border-red-500" : "border-[#E8E2D6]"
                } rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#8c5000]`}
              />
              {errors.donorPhone && (
                <p className="text-[10px] text-red-500 font-bold mt-1">{errors.donorPhone}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                value={form.donorEmail}
                onChange={(e) => setForm({ ...form, donorEmail: e.target.value })}
                placeholder="e.g. rajesh@example.com"
                className={`w-full px-4 py-3 bg-[#F4F1EB] border ${
                  errors.donorEmail ? "border-red-500" : "border-[#E8E2D6]"
                } rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#8c5000]`}
              />
              {errors.donorEmail && (
                <p className="text-[10px] text-red-500 font-bold mt-1">{errors.donorEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Special Note */}
        <div className="space-y-1">
          <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
            Special Note or Instructions
          </label>
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="e.g. In memory of... / Family name / specific puja slot"
            rows={2}
            className="w-full px-4 py-3 bg-[#F4F1EB] border border-[#E8E2D6] rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#8c5000]"
          />
        </div>

        {/* Anonymous Checkbox */}
        <div className="flex items-center justify-between p-4 bg-[#F4F1EB]/50 rounded-xl border border-[#E8E2D6]/40">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#8c5000] text-xl">visibility_off</span>
            <div>
              <p className="text-xs font-bold text-gray-950 leading-none">Donate Anonymously</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Hide your name from the public leaderboard</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={form.isAnonymous}
              onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E8E2D6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8c5000]"></div>
          </label>
        </div>

        {/* Razorpay Trust block */}
        <div className="p-4 rounded-xl border border-[#E8E2D6] flex items-center justify-between bg-white shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#22C55E] text-sm">verified_user</span>
            <span className="text-[10px] font-bold text-[#554334] uppercase tracking-wider">Secured by Razorpay</span>
          </div>
          <div className="flex gap-2 opacity-60 grayscale shrink-0">
            <img
              className="h-3.5"
              alt="Visa"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYhXEWDXq4nzrQg1eMckEdQfSH3mMBdvWodOo0VtGJiIWeGKIx24LlBts4qR6oTu5v3LZjIgwfm9EbEvfL3uFVYZp6Nzw_fCJ-I_1LxFy9mXUbzaBDP6OxF82oLH7La-KrolOUxioIjBVil9qH0e8JA2PgYONm92FuZufvvf2BL-7VZJyFTRRUGoPQYXqZKxZgv0TUiFbMiHxmae8cRV8xTm_WzWmuKcxhAp4hz7E8Z5wVvT4vAPPw"
            />
            <img
              className="h-3.5"
              alt="Mastercard"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-DwIMH8rHHbvk3lpOAoiriSKHBQIrQpV9rkuvxey1CHQzQn_MsKJN4DQA2GRzitDZqDM7v1tzYaLCUlicFgZT2cEbticAvMPM9kOrhRE72bJpQhjDAi4vjhgZJkG__R3494bVknB4zJmcOY6Raibu19-4OXUy7t47Jeq3MEQJmC83bD_rw4YYGg4QAu6YcLiPJae0vNdeaogHqJDiFmVukbUh2rk0x4AyfMkZVB_D6gOBXoNN8gFg"
            />
            <img
              className="h-3.5"
              alt="UPI"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ07ml-9fZ-65N_BjzsY3Qei9nSwjTSzBuydbQEPi82jrncr6BcIHcYe_vxlXybxWp7pOubBLLVG1zVfsFvr1T9xcsqNxhvwwTpxhkUH4G34FoxGXns5UH_et4bYepPhcVZB_yOvMTWSzgmzW_vyrd9wNAY1bX-tEGjOxiu4SLzwmzVmxdDE_YON6ERqRwsdvaQrIVe4hVGDXuK98CQ_7zhmlYkgzvWyX0yaNwW2ItGNwvi_OPvU_4"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={createDonationMutation.isPending}
          className="w-full text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 saffron-glow"
          style={{
            backgroundColor: primaryColor,
          }}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          {createDonationMutation.isPending ? "Processing Donation..." : "Proceed to Secure Payment"}
        </button>

        <p className="text-center text-[10px] text-[#554334] font-semibold leading-relaxed">
          By clicking, you agree to our{" "}
          <a className="underline hover:text-[#8c5000]" href="#">Terms of Service</a> and{" "}
          <a className="underline hover:text-[#8c5000]" href="#">Tax Exemption Policy (80G)</a>.
        </p>
      </form>
    </div>
  );
}
