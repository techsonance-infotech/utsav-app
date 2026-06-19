import React from "react";
import type { Donation } from "@utsav/types";

interface ReceiptSheetProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
  tenantName?: string | null;
}

export function ReceiptSheet({ donation, isOpen, onClose, tenantName }: ReceiptSheetProps) {
  if (!isOpen || !donation) return null;

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-850 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header bar */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-855 flex justify-between items-center">
          <h3 className="font-bold text-neutral-200">Contribution Receipt</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        {/* Receipt content wrapper (designed for print formatting) */}
        <div id="utsav-receipt-print" className="p-6 md:p-8 space-y-6 flex-1 bg-white text-neutral-900">
          <div className="text-center space-y-2 pb-6 border-b border-dashed border-neutral-300">
            <span className="text-3xl">🪔</span>
            <h2 className="text-2xl font-black tracking-tight font-serif uppercase text-orange-600">
              {tenantName || "Utsav Mandal"}
            </h2>
            <p className="text-xs text-neutral-500 font-medium">Official Donation / Aarti Receipt Voucher</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Receipt No.</span>
              <p className="font-bold text-neutral-800 font-mono">{donation.receipt_number || "PENDING"}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Date & Time</span>
              <p className="font-medium text-neutral-800">
                {donation.paid_at ? new Date(donation.paid_at).toLocaleString("en-IN") : "Pending capture"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Received From</span>
              <p className="font-bold text-neutral-800">
                {donation.is_anonymous ? "Anonymous Devotee" : donation.donor_name}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Payment Mode</span>
              <p className="font-medium text-neutral-800 capitalize">{donation.mode.replace("_", " ")}</p>
            </div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 flex flex-col items-center justify-center space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Amount Contributed</span>
            <span className="text-4xl font-extrabold text-neutral-900 font-mono">
              {formatRupee(donation.amount)}
            </span>
          </div>

          {donation.note && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-neutral-600 italic">
              <span className="font-bold not-italic text-neutral-500 block mb-1">Message / Note:</span>
              "{donation.note}"
            </div>
          )}

          <div className="text-center pt-6 border-t border-dashed border-neutral-300 space-y-1">
            <p className="text-xs text-neutral-500">May divine blessings bring happiness, prosperity, and peace.</p>
            <p className="text-[10px] text-neutral-400 font-bold">This is a system generated e-receipt. No signature required.</p>
          </div>
        </div>

        {/* Action buttons footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-855 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 text-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl text-sm transition-all"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
