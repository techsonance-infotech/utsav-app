"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@utsav/stores";
import { useFetchDonations, useFetchCampaigns, useCreateDonation, useFetchTenant, useUpdateDonation } from "@utsav/api-client";
import { useParams } from "next/navigation";
import { X, Check, Copy, AlertTriangle, CheckCircle, Ban } from "lucide-react";

export default function DonationsPage() {
  const { tenantId, role } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const params = useParams();
  const slug = params?.slug as string | undefined;

  // Extract main event/campaign name from onboarding description if possible
  const getOnboardingEventName = () => {
    if (!tenant?.description) return "General Contributions";
    const match = tenant.description.match(/Main Event:\s*([^.]+)/);
    if (match && match[1] && match[1].trim() && match[1].trim() !== "Annual Festival") {
      return match[1].trim();
    }
    return tenant.name ? `${tenant.name} Fund` : "General Contributions";
  };

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");

  const { data: donations = [], isLoading } = useFetchDonations({
    search: search.trim(),
    mode: modeFilter,
    status: statusFilter,
    campaign_id: campaignFilter,
  }) as any;

  const { data: campaigns = [] } = useFetchCampaigns() as any;
  const recordDonationMutation = useCreateDonation();
  const updateDonationMutation = useUpdateDonation();

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

  // Navigation, filtering, and slicing states
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Auto-open panel if record=true search param is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("record") === "true") {
        setIsPanelOpen(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({ path: newUrl }, "", newUrl);
      }
    }
  }, []);

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

  // Helper stats for telemetry
  const totalContributions = donations
    .filter((d: any) => d.status === "confirmed")
    .reduce((sum: number, d: any) => sum + Number(d.amount), 0);

  const manualCashContributions = donations
    .filter((d: any) => d.status === "confirmed" && d.mode === "cash")
    .reduce((sum: number, d: any) => sum + Number(d.amount), 0);

  const activeCampaign = campaigns?.[0];

  const getDonorInitials = (name: string) => {
    if (!name) return "DN";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Filter donations for activeTab "pending"
  const displayedDonations = donations.filter((d: any) => {
    if (activeTab === "pending" && d.status !== "pending") return false;
    return true;
  });

  const totalRows = displayedDonations.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedDonations = displayedDonations.slice(startIndex, startIndex + rowsPerPage);

  const handleExportCSV = () => {
    const headers = ["Receipt No", "Donor Name", "Amount", "Mode", "Campaign", "Date", "Status"];
    const rows = displayedDonations.map((d: any) => [
      d.receipt_number || "PENDING",
      d.donor_name,
      d.amount,
      d.mode,
      d.campaign?.name || "General Fund",
      new Date(d.created_at).toLocaleDateString("en-IN"),
      d.status
    ]);

    const csvContent = [headers.join(","), ...rows.map((e: any) => e.map((val: any) => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `donations_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!allowedToRecord) {
    return (
      <div className="p-margin-desktop text-center bg-white rounded-xl border border-sandstone shadow-sm max-w-xl mx-auto mt-20">
        <span className="material-symbols-outlined text-kumkum-red text-[48px] mb-4">gpp_bad</span>
        <h2 className="font-headline-md text-headline-sm font-bold text-on-surface">Access Denied</h2>
        <p className="font-body-md text-on-surface-variant mt-2">
          You are not authorized to view the Financial Ledger. Only treasury and committee roles are permitted.
        </p>
      </div>
    );
  }

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      
      {/* Telemetry Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div className="md:col-span-1 bg-cream rounded-xl p-lg border border-sandstone">
          <p className="text-on-surface-variant font-label-md text-label-md mb-2">Total Contributions</p>
          <h3 className="text-display-xl font-display-xl text-primary font-bold">{formatRupee(totalContributions)}</h3>
          <div className="flex items-center gap-1 mt-2 text-tulsi-green font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Live Sync Active</span>
          </div>
        </div>

        <div className="md:col-span-1 bg-white rounded-xl p-lg border border-sandstone shadow-sm">
          <p className="text-on-surface-variant font-label-md text-label-md mb-2">Manual Cash Entries</p>
          <h3 className="text-headline-lg font-headline-lg text-charcoal font-bold">{formatRupee(manualCashContributions)}</h3>
          <p className="text-on-surface-variant text-label-sm font-label-sm mt-2 italic">Requires verification</p>
        </div>

        <div className="md:col-span-2 bg-surface-bright rounded-xl p-lg border border-sandstone relative overflow-hidden flex items-center justify-between">
          <div className="relative z-10 w-full">
            <p className="text-on-surface-variant font-label-md text-label-md mb-2">Featured Festival Campaign</p>
            <h3 className="text-headline-md font-headline-md text-aarti-gold font-bold">
              {activeCampaign ? activeCampaign.name : getOnboardingEventName()}
            </h3>
            <div className="mt-4 w-64 h-2 bg-sandstone rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-aarti-gold rounded-full"></div>
            </div>
            <p className="mt-1 text-label-sm font-label-sm text-on-surface-variant">Active Campaign</p>
          </div>
          <span className="material-symbols-outlined text-[80px] opacity-[0.03] absolute -right-4 -bottom-4 rotate-12">
            account_balance_wallet
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-md justify-between items-start md:items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-surface-container-high rounded-lg p-1">
            <button
              onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-md text-label-md font-bold transition-all ${
                activeTab === "all"
                  ? "bg-puja-white shadow-sm text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => { setActiveTab("pending"); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-md text-label-md font-bold transition-all ${
                activeTab === "pending"
                  ? "bg-puja-white shadow-sm text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Pending Approvals
            </button>
          </div>
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-cream transition-colors text-label-md font-medium text-charcoal ${
              showAdvancedFilters ? "bg-cream border-primary text-primary" : "border-sandstone bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Advanced Filters
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-sandstone bg-white rounded-lg hover:bg-cream transition-colors text-label-md font-medium text-charcoal"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
          
          <button
            onClick={() => {
              setDonorName("");
              setAmount("");
              setNote("");
              setIsPanelOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary-container text-on-primary-container hover:opacity-90 px-6 py-2.5 rounded-lg font-bold shadow-md saffron-glow active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Record Donation
          </button>
        </div>
      </div>

      {/* Filter Panel (Expanded View) */}
      {showAdvancedFilters && (
        <div className="bg-white p-lg rounded-xl border border-sandstone shadow-xs grid grid-cols-1 md:grid-cols-4 gap-lg animate-in fade-in duration-200">
          <div className="space-y-2">
            <label className="block font-label-sm text-label-sm text-on-surface-variant">Search Donor</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search donor name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="bg-puja-white border border-sandstone rounded-lg pl-9 pr-4 py-2 w-full focus:ring-1 focus:ring-primary focus:border-primary text-body-md font-body-md outline-none"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block font-label-sm text-label-sm text-on-surface-variant">Campaign Name</label>
            <select
              value={campaignFilter}
              onChange={(e) => { setCampaignFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-puja-white border border-sandstone rounded-lg p-2 text-body-md focus:ring-primary focus:border-primary outline-none"
            >
              <option value="">All Campaigns</option>
              {campaigns.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-label-sm text-label-sm text-on-surface-variant">Payment Mode</label>
            <select
              value={modeFilter}
              onChange={(e) => { setModeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-puja-white border border-sandstone rounded-lg p-2 text-body-md focus:ring-primary focus:border-primary outline-none"
            >
              <option value="">All Modes</option>
              <option value="cash">Cash</option>
              <option value="online">Online (Card/Netbanking)</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-label-sm text-label-sm text-on-surface-variant">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-puja-white border border-sandstone rounded-lg p-2 text-body-md focus:ring-primary focus:border-primary outline-none"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl border border-sandstone overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-16 text-center text-on-surface-variant w-full">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Loading donation records...</span>
          </div>
        ) : displayedDonations.length > 0 ? (
          <>
            <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-cream border-b border-sandstone">
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Receipt No</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Donor Name</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right">Amount (₹)</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Payment Mode</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Campaign</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Date</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Status</th>
                  <th className="px-lg py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sandstone">
                {paginatedDonations.map((d: any) => (
                  <tr key={d.id} className="hover:bg-cream/30 transition-colors group">
                    <td className="px-lg py-4 font-mono-data text-xs text-on-surface-variant font-bold">
                      {d.receipt_number || "PENDING"}
                    </td>
                    <td className="px-lg py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-xs shrink-0">
                          {getDonorInitials(d.donor_name)}
                        </div>
                        <div>
                          <span className="font-body-md text-body-md font-semibold text-charcoal block">
                            {d.is_anonymous ? <span className="text-outline italic">Anonymous ({d.donor_name})</span> : d.donor_name}
                          </span>
                          {d.donor_phone && <span className="text-xs text-on-surface-variant font-mono">{d.donor_phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-4 font-mono-data text-mono-data text-charcoal font-bold text-right">
                      {Number(d.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-lg py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                          {d.mode === "cash" ? "payments" : d.mode === "upi" ? "qr_code_2" : "account_balance"}
                        </span>
                        <span className="text-body-md font-body-md capitalize">{d.mode}</span>
                      </div>
                    </td>
                    <td className="px-lg py-4 text-body-md font-body-md text-on-surface-variant">
                      {d.campaign?.name || "General Mandap Fund"}
                    </td>
                    <td className="px-lg py-4 text-label-sm font-label-sm text-on-surface-variant">
                      {new Date(d.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-lg py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-label-sm font-bold border ${
                          d.status === "confirmed"
                            ? "bg-tulsi-green/10 text-tulsi-green border-tulsi-green/20"
                            : d.status === "pending"
                            ? "bg-haldi-yellow/10 text-haldi-yellow border-haldi-yellow/20"
                            : "bg-error-container text-error border-error-container/20"
                        }`}
                      >
                        {d.status === "confirmed" ? "Confirmed" : d.status === "pending" ? "Pending" : "Failed"}
                      </span>
                    </td>
                    <td className="px-lg py-4 text-right">
                      <button
                        onClick={() => setSelectedDonation(d)}
                        className="text-primary hover:underline font-bold text-label-sm"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-lg bg-puja-white border-t border-sandstone flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-on-surface-variant font-label-md hover:bg-sandstone/50 rounded-lg transition-colors flex items-center gap-1 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg font-label-md transition-all font-bold ${
                    currentPage === page
                      ? "bg-primary text-on-primary font-bold"
                      : "hover:bg-sandstone/50 text-on-surface-variant"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-4 py-2 text-on-surface-variant font-label-md hover:bg-sandstone/50 rounded-lg transition-colors flex items-center gap-1 ${
                currentPage === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Next
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </>
      ) : (
          <div className="p-16 text-center text-on-surface-variant font-label-md">
            No donation transactions match the applied filters.
          </div>
        )}
      </div>

      {/* Decorative Milestone Banner */}
      <div className="glass-panel rounded-xl p-xl flex flex-col md:flex-row items-center justify-between gap-xl relative overflow-hidden group">
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              stars
            </span>
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm font-bold text-primary">Appreciation Letters</h4>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              Send personalized donation receipts and seasonal thank-you messages to your prominent festival contributors.
            </p>
          </div>
        </div>
        <button className="relative z-10 px-8 py-3 border-2 border-aarti-gold text-aarti-gold hover:bg-aarti-gold hover:text-white transition-all duration-300 rounded-lg font-bold shrink-0">
          Send Thanks
        </button>
      </div>

      {/* Right Drawer Panel for Recording Donation */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border-l border-sandstone h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300 overflow-y-auto">
            
            <button
              onClick={() => setIsPanelOpen(false)}
              className="absolute top-6 right-6 p-2 bg-[#FAFAF8] border border-[#E8E2D6] hover:bg-[#F4F1EB] rounded-lg text-gray-500 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#3A3530] uppercase tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                  Record Cash Donation
                </h2>
                <p className="text-gray-500 text-xs mt-1 font-semibold leading-relaxed">
                  Log offline cash collection directly into the community ledger database.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-error-container text-error rounded-xl text-xs font-semibold text-center border border-error/20">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleRecordDonation} className="space-y-4 pt-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                    Donor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="e.g. 98765 43210"
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="e.g. ramesh@gmail.com"
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary font-mono-data"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Payment Mode
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI Transfer</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                    Festival Campaign Link
                  </label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="">General Fund (No Campaign)</option>
                    {campaigns.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                    Note / Dedication
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. In memory of Late Sh. Baldev..."
                    rows={2}
                    className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-primary border-[#E8E2D6] focus:ring-0"
                  />
                  <label htmlFor="isAnonymous" className="text-xs font-semibold text-[#554334] cursor-pointer">
                    Hide donor identity on public boards (Anonymous)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={recordDonationMutation.isPending}
                  className="w-full bg-primary-container text-on-primary-container hover:opacity-90 font-bold py-4 rounded-xl shadow-lg mt-4 uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {recordDonationMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-on-primary-container border-t-transparent animate-spin" />
                      <span>Recording Entries...</span>
                    </>
                  ) : (
                    "Save to Digital Ledger"
                  )}
                </button>
              </form>
            </div>

            <div className="bg-[#FAFAF8] border border-sandstone p-4 rounded-xl flex gap-3 text-gray-500 text-[11px] font-semibold leading-relaxed mt-6">
              <AlertTriangle className="w-5 h-5 text-aarti-gold shrink-0" />
              <span>
                Manual ledger entries must be backed by physically collected cash values before closing monthly balance audits.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modern Receipt View Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sandstone rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-sandstone">
              <span className="material-symbols-outlined text-[48px] text-aarti-gold">
                verified
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal mt-2">
                Official Contribution Receipt
              </h3>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mt-1">
                Utsav Festival Network
              </p>
            </div>

            <div className="space-y-4 py-6 font-body-md text-body-md text-on-surface">
              <div className="flex justify-between border-b border-sandstone/50 pb-2">
                <span className="text-on-surface-variant">Receipt No:</span>
                <span className="font-mono font-bold">{selectedDonation.receipt_number || "PENDING"}</span>
              </div>
              <div className="flex justify-between border-b border-sandstone/50 pb-2">
                <span className="text-on-surface-variant">Donor Name:</span>
                <span className="font-bold">{selectedDonation.donor_name}</span>
              </div>
              <div className="flex justify-between border-b border-sandstone/50 pb-2">
                <span className="text-on-surface-variant">Amount Received:</span>
                <span className="font-bold text-primary font-mono">{formatRupee(selectedDonation.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-sandstone/50 pb-2">
                <span className="text-on-surface-variant">Payment Method:</span>
                <span className="capitalize font-semibold">{selectedDonation.mode}</span>
              </div>
              <div className="flex justify-between border-b border-sandstone/50 pb-2">
                <span className="text-on-surface-variant">Campaign Association:</span>
                <span className="font-semibold">{selectedDonation.campaign?.name || "General Fund"}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-on-surface-variant">Transaction Timestamp:</span>
                <span>{new Date(selectedDonation.created_at).toLocaleString("en-IN")}</span>
              </div>
              {selectedDonation.note && (
                <div className="bg-cream/40 p-3 rounded-lg border border-sandstone text-xs text-on-surface-variant italic">
                  "{selectedDonation.note}"
                </div>
              )}
            </div>

            {selectedDonation.status === "pending" && ["owner", "admin", "treasurer"].includes(role || "") && (
              <div className="mt-4 pt-4 border-t border-sandstone flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      const updated = await updateDonationMutation.mutateAsync({
                        id: selectedDonation.id,
                        status: "confirmed"
                      });
                      setSelectedDonation(updated);
                    } catch (err: any) {
                      alert(err.message || "Failed to confirm donation.");
                    }
                  }}
                  disabled={updateDonationMutation.isPending}
                  className="flex-1 py-2.5 bg-[#22C55E] text-white font-bold rounded-xl text-xs hover:bg-[#16A34A] transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Confirm Clearance
                </button>
                <button
                  onClick={async () => {
                    try {
                      const updated = await updateDonationMutation.mutateAsync({
                        id: selectedDonation.id,
                        status: "failed"
                      });
                      setSelectedDonation(updated);
                    } catch (err: any) {
                      alert(err.message || "Failed to reject donation.");
                    }
                  }}
                  disabled={updateDonationMutation.isPending}
                  className="flex-1 py-2.5 bg-[#EF4444] text-white font-bold rounded-xl text-xs hover:bg-[#DC2626] transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
                >
                  <Ban className="w-3.5 h-3.5" /> Mark Failed
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-sandstone text-center text-xs text-on-surface-variant font-semibold mt-4">
              Thank you for supporting community cultural heritage.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
