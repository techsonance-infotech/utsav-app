import React from "react";
import type { Donation } from "@utsav/types";

interface DonationCardProps {
  donation: Donation;
  onViewReceipt?: (donation: Donation) => void;
}

export function DonationCard({ donation, onViewReceipt }: DonationCardProps) {
  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusColors: Record<string, string> = {
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    failed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    refunded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  const statusStyle = statusColors[donation.status] || "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";

  return (
    <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-orange-500/20 transition-all">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-100">
            {donation.is_anonymous ? "Anonymous Devotee" : donation.donor_name}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle} uppercase tracking-wider`}>
            {donation.status}
          </span>
        </div>
        <div className="text-xs text-neutral-400 flex flex-wrap gap-x-3 gap-y-1">
          {donation.receipt_number && <span>Receipt: {donation.receipt_number}</span>}
          <span>Mode: <span className="capitalize">{donation.mode.replace("_", " ")}</span></span>
          {donation.note && <span className="italic">"{donation.note}"</span>}
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <div className="text-left sm:text-right">
          <div className="text-xl font-extrabold text-neutral-100 font-mono">
            {formatRupee(donation.amount)}
          </div>
          <div className="text-[10px] text-neutral-500">
            {donation.paid_at ? new Date(donation.paid_at).toLocaleDateString("en-IN") : "Pending"}
          </div>
        </div>

        {onViewReceipt && donation.status === "confirmed" && (
          <button
            onClick={() => onViewReceipt(donation)}
            className="px-3 py-1.5 bg-neutral-950 border border-neutral-805 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg transition-all"
          >
            Receipt
          </button>
        )}
      </div>
    </div>
  );
}
