"use client";

import React, { useState } from "react";
import { useAuthStore } from "@utsav/stores";
import { useFetchDonations, useFetchCampaigns, useCreateDonation } from "@utsav/api-client";
import { Search, Plus, FileText, X, CheckCircle, Clock, XCircle, ChevronDown, Check } from "lucide-react";

export default function DonationsPage() {
  const { tenantId, role } = useAuthStore();
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");

  const { data: donations, isLoading } = useFetchDonations({
    search,
    mode: modeFilter,
    status: statusFilter,
    campaign_id: campaignFilter,
  });

  const { data: campaigns } = useFetchCampaigns();
  const recordDonationMutation = useCreateDonation();

  // Cash slider panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [campaignId, setCampaignId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Receipt modal state
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  const allowedToRecord = ["owner", "admin", "treasurer", "committee_member"].includes(role || "");

  const handleRecordDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!donorName) return setErrorMsg("Donor name is required");
    if (!amount || parseFloat(amount) <= 0) return setErrorMsg("Amount must be a positive number");

    try {
      await recordDonationMutation.mutateAsync({
        donor_name: donorName,
        donor_phone: donorPhone || undefined,
        donor_email: donorEmail || undefined,
        amount: parseFloat(amount),
        mode,
        campaign_id: campaignId || undefined,
        is_anonymous: isAnonymous,
        note: note || undefined,
      });

      // Reset form
      setDonorName("");
      setDonorPhone("");
      setDonorEmail("");
      setAmount("");
      setMode("cash");
      setCampaignId("");
      setIsAnonymous(false);
      setNote("");
      setIsPanelOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record donation.");
    }
  };

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const amountToWords = (num: number) => {
    // Simple helper for visual receipt
    const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const double = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    if (num === 0) return "Zero";
    let words = "";
    
    if (Math.floor(num / 1000) > 0) {
      words += amountToWords(Math.floor(num / 1000)) + " Thousand ";
      num %= 1000;
    }
    if (Math.floor(num / 100) > 0) {
      words += single[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num > 0) {
      if (num < 10) words += single[num];
      else if (num < 20) words += double[num - 10];
      else {
        words += tens[Math.floor(num / 10)];
        if (num % 10 > 0) words += " " + single[num % 10];
      }
    }
    return words.trim() + " Rupees Only";
  };

  if (!allowedToRecord) {
    return (
      <div className="bg-neutral-900 border border-neutral-850 p-8 rounded-2xl text-center text-neutral-400">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-neutral-200">Access Denied</h2>
        <p className="text-sm mt-1">You are not authorized to view the Financial Ledger. Committee roles only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-neutral-100">Donations Ledger</h1>
          <p className="text-neutral-400 text-sm mt-1">Record and manage offline cash collections and online contributions.</p>
        </div>
        <button
          onClick={() => setIsPanelOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-500/10 text-sm"
        >
          <Plus className="w-5 h-5" />
          Record Cash Donation
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-5 h-5 text-neutral-500 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search donor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-805 rounded-xl pl-12 pr-4 py-3 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Mode filter */}
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-sm text-neutral-300 focus:outline-none"
        >
          <option value="">All Modes</option>
          <option value="cash">Cash</option>
          <option value="online">Online</option>
          <option value="cheque">Cheque</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="in_kind">In Kind</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-sm text-neutral-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        {/* Campaign filter */}
        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-sm text-neutral-300 focus:outline-none"
        >
          <option value="">All Campaigns</option>
          {campaigns?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Donations Table */}
      <div className="bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500 text-sm">Loading ledger directory...</div>
        ) : donations && donations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-850 text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-900/50">
                  <th className="px-6 py-4">Receipt No</th>
                  <th className="px-6 py-4">Donor Details</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-850/30 transition-all text-sm text-neutral-300">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-neutral-400">
                      {d.receipt_number || "PENDING"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-100">
                        {d.is_anonymous ? <span className="text-neutral-500 italic">Anonymous ({d.donor_name})</span> : d.donor_name}
                      </div>
                      {d.donor_phone && <div className="text-xs text-neutral-500 mt-0.5">{d.donor_phone}</div>}
                    </td>
                    <td className="px-6 py-4 font-bold font-mono text-neutral-100">
                      {formatRupee(d.amount)}
                    </td>
                    <td className="px-6 py-4 capitalize text-xs text-neutral-400">{d.mode.replace("_", " ")}</td>
                    <td className="px-6 py-4">
                      {d.status === "confirmed" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                        </span>
                      ) : d.status === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-400">
                      {new Date(d.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {d.status === "confirmed" && (
                        <button
                          onClick={() => setSelectedDonation(d)}
                          className="p-2 bg-neutral-950 border border-neutral-805 hover:bg-neutral-800 text-neutral-400 hover:text-orange-400 rounded-xl transition-all inline-flex items-center gap-1 text-xs"
                        >
                          <FileText className="w-4 h-4" /> View Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-neutral-500 text-sm">No donation records found.</div>
        )}
      </div>

      {/* Record Cash Donation Slide-Over Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-lg bg-neutral-900 h-screen border-l border-neutral-850 p-6 md:p-8 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right">
            <div>
              <div className="flex justify-between items-center border-b border-neutral-850 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-100 font-serif">Record Offline Donation</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Collect and confirm offline contributions immediately.</p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 bg-neutral-950 hover:bg-neutral-800 rounded-xl border border-neutral-850 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5" />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleRecordDonation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Donor Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Donor Phone
                    </label>
                    <input
                      type="tel"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Donor Email
                    </label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="rajesh@gmail.com"
                      className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Amount (INR)
                    </label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Payment Mode
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
                    >
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="in_kind">In Kind</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Link to Campaign (Optional)
                  </label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
                  >
                    <option value="">No Campaign link (General Fund)</option>
                    {campaigns?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Remarks / Remarks Note
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Received envelope during Arti"
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-805 bg-neutral-950 text-orange-500 accent-orange-500"
                  />
                  <label htmlFor="anonymous" className="text-xs font-semibold text-neutral-400 cursor-pointer">
                    Keep Donor Anonymous on Public Feed
                  </label>
                </div>
              </form>
            </div>

            <div className="border-t border-neutral-850 pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="flex-1 py-3 bg-neutral-950 border border-neutral-850 rounded-xl font-bold text-neutral-400 hover:bg-neutral-800 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordDonation}
                disabled={recordDonationMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold rounded-xl text-sm"
              >
                {recordDonationMutation.isPending ? "Recording..." : "Record Donation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Receipt Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-6 right-6 p-2 bg-neutral-950 hover:bg-neutral-800 rounded-xl border border-neutral-850 text-neutral-400"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Print Area */}
            <div id="receipt-print-area" className="border-4 border-amber-500/20 bg-neutral-950 p-6 rounded-2xl relative overflow-hidden space-y-6">
              
              {/* Receipt Border Deco */}
              <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
              
              {/* Header */}
              <div className="text-center space-y-2 pb-4 border-b border-neutral-850">
                <h3 className="text-2xl font-extrabold font-serif bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                  UTSAV MANDAL TRUST
                </h3>
                <p className="text-xs text-neutral-500">Official Donation Acknowledgment Receipt</p>
                <div className="flex justify-between items-center text-[10px] text-neutral-500 pt-2 px-2 font-mono">
                  <span>RECEIPT NO: {selectedDonation.receipt_number}</span>
                  <span>DATE: {new Date(selectedDonation.paid_at || selectedDonation.created_at).toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="space-y-4 text-sm text-neutral-300">
                <div className="flex justify-between border-b border-neutral-900 py-1.5">
                  <span className="text-neutral-500">Received From:</span>
                  <span className="font-bold text-neutral-200">{selectedDonation.donor_name}</span>
                </div>
                {selectedDonation.donor_phone && (
                  <div className="flex justify-between border-b border-neutral-900 py-1.5">
                    <span className="text-neutral-500">Phone Number:</span>
                    <span className="font-mono text-neutral-200">{selectedDonation.donor_phone}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-neutral-900 py-1.5">
                  <span className="text-neutral-500">Amount Received:</span>
                  <span className="font-bold text-neutral-200">{formatRupee(selectedDonation.amount)}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 py-1.5">
                  <span className="text-neutral-500">Amount in Words:</span>
                  <span className="italic text-amber-500 font-semibold">{amountToWords(selectedDonation.amount)}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 py-1.5">
                  <span className="text-neutral-500">Payment Mode:</span>
                  <span className="capitalize text-neutral-200">{selectedDonation.mode.replace("_", " ")}</span>
                </div>
                {selectedDonation.note && (
                  <div className="flex flex-col gap-1 border-b border-neutral-900 py-1.5 text-left">
                    <span className="text-neutral-500">Remarks / Remarks:</span>
                    <span className="text-neutral-300 text-xs italic">{selectedDonation.note}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-8 flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-[9px] text-neutral-500 font-mono">Utsav Safe Core Ledger ID:</div>
                  <div className="text-[9px] text-neutral-600 font-mono truncate max-w-[200px]">{selectedDonation.id}</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-32 border-b border-neutral-800 text-[10px] text-neutral-500 italic pb-1">
                    Verified Digital Seal
                  </div>
                  <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                    Treasurer Signature
                  </div>
                </div>
              </div>
            </div>

            {/* Print Action */}
            <div className="pt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDonation(null)}
                className="px-5 py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-850 rounded-xl text-neutral-400 font-bold text-sm"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold rounded-xl flex items-center gap-2 text-sm"
              >
                <Plus className="w-5 h-5 rotate-45" /> Print Receipt
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
