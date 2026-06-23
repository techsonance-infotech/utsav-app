"use client";

import React, { useState } from "react";
import { useAuthStore } from "@utsav/stores";
import {
  useFinancialSummary,
  useFetchDonations,
  useExpenses,
  useFetchCampaigns,
  useFetchTenant,
} from "@utsav/api-client";
import { useParams } from "next/navigation";
import { FileDown, Calendar, CreditCard, LayoutDashboard, Printer, FileText } from "lucide-react";

export default function WebReportsPage() {
  const { tenantId, role } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const params = useParams();
  const slug = params?.slug as string | undefined;

  // Filters State
  const [dateRange, setDateRange] = useState("all"); // all, 30, 90, year
  const [campaignId, setCampaignId] = useState("all");
  const [paymentMode, setPaymentMode] = useState("all");

  // PDF Preview Modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activeReportType, setActiveReportType] = useState<"donations" | "expenses" | "pl">("pl");

  // Fetch API Queries
  const { data: summary, isLoading: loadingSummary } = useFinancialSummary() as any;
  const { data: donations = [], isLoading: loadingDonations } = useFetchDonations() as any;
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses() as any;
  const { data: campaigns = [] } = useFetchCampaigns() as any;

  const isLoading = loadingSummary || loadingDonations || loadingExpenses;

  // Filter Logic Helper
  const filterByDate = (dateStr: string) => {
    if (dateRange === "all") return true;
    const date = new Date(dateStr);
    const now = new Date();
    if (dateRange === "30") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return date >= thirtyDaysAgo;
    }
    if (dateRange === "90") {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      return date >= ninetyDaysAgo;
    }
    if (dateRange === "year") {
      return date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredDonations = donations.filter((d: any) => {
    if (!filterByDate(d.created_at)) return false;
    if (campaignId !== "all" && d.campaign_id !== campaignId) return false;
    if (paymentMode !== "all" && d.mode !== paymentMode) return false;
    return true;
  });

  const filteredExpenses = expenses.filter((e: any) => {
    if (!filterByDate(e.expense_date || e.created_at)) return false;
    if (paymentMode !== "all" && e.payment_mode !== paymentMode) return false;
    return true;
  });

  // Export handlers
  const exportDonationsCSV = () => {
    const headers = ["Donation ID", "Donor Name", "Phone", "Amount (₹)", "Campaign", "Mode", "Status", "Date"];
    const rows = filteredDonations.map((d: any) => {
      const campaignName = campaigns.find((c: any) => c.id === d.campaign_id)?.name || "General Contribution";
      return [
        d.id,
        d.donor_name || (d.is_anonymous ? "Anonymous" : "N/A"),
        d.donor_phone || "N/A",
        d.amount,
        campaignName,
        d.mode?.toUpperCase() || "CASH",
        d.status?.toUpperCase() || "CONFIRMED",
        new Date(d.created_at).toLocaleDateString(),
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `donation_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExpensesCSV = () => {
    const headers = ["Expense ID", "Title", "Amount (₹)", "Category", "Payment Mode", "Date", "Status"];
    const rows = filteredExpenses.map((e: any) => [
      e.id,
      e.title,
      e.amount,
      e.category_id || "Operations",
      e.payment_mode?.toUpperCase() || "CASH",
      e.expense_date || new Date(e.created_at).toLocaleDateString(),
      e.status?.toUpperCase() || "APPROVED",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expense_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPlCSV = () => {
    const totalInflow = filteredDonations.reduce((sum: number, d: any) => sum + Number(d.amount), 0);
    const totalOutflow = filteredExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const netSavings = totalInflow - totalOutflow;

    const headers = ["Account Section", "Details", "Amount (₹)"];
    const rows = [
      ["Total Donation Inflows", `Count: ${filteredDonations.length} records`, totalInflow],
      ["Total Operations Outflows", `Count: ${filteredExpenses.length} records`, totalOutflow],
      ["Net Festival Surplus / Deficit", dateRange === "all" ? "All Time" : `Range: Last ${dateRange} days`, netSavings],
    ];

    const csvContent = [headers.join(","), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `festival_pl_statement_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Aggregated totals
  const donationTotal = filteredDonations.reduce((sum: number, d: any) => sum + Number(d.amount), 0);
  const expenseTotal = filteredExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const balanceTotal = donationTotal - expenseTotal;

  const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
  const isAllowed = allowedRoles.includes(role || "");

  if (!isAllowed) {
    return (
      <div className="p-margin-desktop text-center bg-white rounded-xl border border-sandstone max-w-xl mx-auto mt-20 p-12 shadow-sm">
        <span className="material-symbols-outlined text-kumkum-red text-[48px] mb-4">gpp_bad</span>
        <h2 className="font-headline-md text-headline-sm font-bold text-on-surface">Access Denied</h2>
        <p className="font-body-md text-on-surface-variant mt-2">
          You are not authorized to view Financial Reports. Only treasury, committee, and admin roles are permitted.
        </p>
      </div>
    );
  }

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display-md text-display-md font-bold text-primary">
            Financial Reports
          </h2>
          <p className="text-on-surface-variant font-body-medium">
            Generate and audit compliant ledgers for {tenant?.name || "the Mandal"}.
          </p>
        </div>
      </div>

      {/* Global Filters Panel */}
      <div className="bg-cream p-lg rounded-2xl border border-sandstone flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Date Interval
          </label>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="all">All-Time History</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="year">This Calendar Year</option>
            </select>
            <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-on-surface-variant/70 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Campaign Scope
          </label>
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Mode of Payment
          </label>
          <div className="relative">
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash / Offline</option>
              <option value="razorpay">Online (Razorpay)</option>
              <option value="upi">UPI Transfers</option>
              <option value="cheque">Cheque</option>
            </select>
            <CreditCard className="absolute right-3 top-2.5 w-4 h-4 text-on-surface-variant/70 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-sans tracking-wide text-on-surface-variant">
            Analyzing transaction archives...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Export Center Cards */}
          <div className="lg:col-span-2 space-y-lg">
            <div className="bg-cream border border-sandstone rounded-2xl p-lg space-y-md">
              <h3 className="font-title-lg text-title-lg font-bold text-primary flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Ledger Downloads
              </h3>
              <p className="text-on-surface-variant text-sm">
                Generate tabular audits containing client profiles, bank settlements, and approval markers.
              </p>

              <div className="divide-y divide-sandstone/50">
                {/* Donations row */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-on-surface">Donation Ledger</h4>
                    <p className="text-xs text-on-surface-variant">
                      Contains donor names, contact info, campaign categories, values, and verification details.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportDonationsCSV}
                      className="px-4 py-2 border border-sandstone bg-white rounded-xl text-sm font-bold hover:bg-white/70 active:scale-95 duration-100 transition-all flex items-center gap-1.5"
                    >
                      <FileDown className="w-4 h-4" /> CSV
                    </button>
                    <button
                      onClick={() => {
                        setActiveReportType("donations");
                        setIsPdfModalOpen(true);
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover shadow-sm active:scale-95 duration-100 transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" /> Print PDF
                    </button>
                  </div>
                </div>

                {/* Expenses row */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-on-surface">Expense Ledger</h4>
                    <p className="text-xs text-on-surface-variant">
                      Full log of operational payments, categories, vendor listings, dates, and approvals.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportExpensesCSV}
                      className="px-4 py-2 border border-sandstone bg-white rounded-xl text-sm font-bold hover:bg-white/70 active:scale-95 duration-100 transition-all flex items-center gap-1.5"
                    >
                      <FileDown className="w-4 h-4" /> CSV
                    </button>
                    <button
                      onClick={() => {
                        setActiveReportType("expenses");
                        setIsPdfModalOpen(true);
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover shadow-sm active:scale-95 duration-100 transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" /> Print PDF
                    </button>
                  </div>
                </div>

                {/* Profit and loss row */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-on-surface">Festival P&L Summary</h4>
                    <p className="text-xs text-on-surface-variant">
                      Summarized comparison of total collections against total expenditures.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportPlCSV}
                      className="px-4 py-2 border border-sandstone bg-white rounded-xl text-sm font-bold hover:bg-white/70 active:scale-95 duration-100 transition-all flex items-center gap-1.5"
                    >
                      <FileDown className="w-4 h-4" /> CSV
                    </button>
                    <button
                      onClick={() => {
                        setActiveReportType("pl");
                        setIsPdfModalOpen(true);
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover shadow-sm active:scale-95 duration-100 transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" /> Print PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Balance Sheet Sidecard */}
          <div className="bg-cream border border-sandstone rounded-2xl p-lg space-y-md h-fit">
            <h3 className="font-title-lg text-title-lg font-bold text-primary flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Financial Health
            </h3>
            <p className="text-on-surface-variant text-sm">
              Live scoped balance of resources matching applied dashboard filters.
            </p>

            <div className="space-y-4 pt-2">
              <div className="bg-white p-4 rounded-xl border border-sandstone/70">
                <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                  Scope Collections
                </p>
                <p className="text-2xl font-bold text-[#2e7d32]">
                  ₹{donationTotal.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Active entries: {filteredDonations.length} records
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-sandstone/70">
                <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                  Scope Operations
                </p>
                <p className="text-2xl font-bold text-primary">
                  ₹{expenseTotal.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Approved entries: {filteredExpenses.length} records
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-sandstone/70">
                <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                  Net Balance
                </p>
                <p className={`text-2xl font-bold ${balanceTotal >= 0 ? "text-[#2e7d32]" : "text-red-700"}`}>
                  ₹{balanceTotal.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Festival savings reserves
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF / Printing Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setIsPdfModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="bg-white rounded-3xl w-full max-w-[850px] max-h-[85vh] flex flex-col shadow-2xl border border-sandstone z-10 relative overflow-hidden">
            {/* Header controls (Non-Printable) */}
            <div className="flex justify-between items-center bg-[#FAFAF8] px-lg py-md border-b border-sandstone print:hidden">
              <span className="font-semibold text-primary flex items-center gap-1.5">
                <Printer className="w-5 h-5" /> Report Print Studio
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-primary text-white hover:bg-primary-hover shadow-sm active:scale-95 duration-100 transition-all font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm"
                >
                  <Printer className="w-4 h-4" /> Trigger Browser Print
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-4 py-2 border border-sandstone rounded-xl hover:bg-[#F4F1EB] active:scale-95 duration-100 transition-all text-sm font-bold"
                >
                  Close Studio
                </button>
              </div>
            </div>

            {/* Document body (Printable) */}
            <div className="flex-1 overflow-y-auto p-10 font-serif leading-relaxed text-zinc-900 printable-document bg-white">
              {/* Report Header */}
              <div className="border-b-4 border-primary pb-6 text-center space-y-2">
                <h1 className="text-3xl font-bold uppercase tracking-wide text-zinc-800">
                  {tenant?.name || "UTSAV FESTIVAL TRUST"}
                </h1>
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-sans font-bold">
                  Official Account Audit Statement
                </p>
                <div className="flex justify-center items-center gap-6 pt-2 text-xs font-sans font-semibold text-zinc-600">
                  <span>Report Year: {new Date().getFullYear()}</span>
                  <span>|</span>
                  <span>Scope: {dateRange === "all" ? "Full History" : `Last ${dateRange} Days`}</span>
                  <span>|</span>
                  <span>Printed: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Render Report Type content */}
              {activeReportType === "pl" && (
                <div className="space-y-8 pt-8">
                  <div>
                    <h3 className="text-xl font-bold border-b border-zinc-300 pb-2 text-zinc-800">
                      Festival Profit & Loss Statement
                    </h3>
                  </div>

                  <table className="w-full text-left border-collapse border border-zinc-300 font-sans text-sm mt-4">
                    <thead>
                      <tr className="bg-zinc-100 text-zinc-800 font-bold border-b border-zinc-300">
                        <th className="p-3 border-r border-zinc-300">Section</th>
                        <th className="p-3 border-r border-zinc-300">Source / Category</th>
                        <th className="p-3 text-right">Settled Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-300">
                        <td className="p-3 border-r border-zinc-300 font-semibold" rowSpan={3}>
                          Donation Inflows
                        </td>
                        <td className="p-3 border-r border-zinc-300">Member Contributions (Offline Cash)</td>
                        <td className="p-3 text-right">
                          ₹{filteredDonations.filter((d: any) => d.mode === "cash").reduce((sum: number, d: any) => sum + Number(d.amount), 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-300">
                        <td className="p-3 border-r border-zinc-300">Online Transactions (Razorpay Core)</td>
                        <td className="p-3 text-right">
                          ₹{filteredDonations.filter((d: any) => d.mode !== "cash").reduce((sum: number, d: any) => sum + Number(d.amount), 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                      <tr className="bg-zinc-50 border-b border-zinc-300 font-bold">
                        <td className="p-3 border-r border-zinc-300 text-primary">Subtotal Collections</td>
                        <td className="p-3 text-right text-primary">₹{donationTotal.toLocaleString("en-IN")}</td>
                      </tr>

                      <tr className="border-b border-zinc-300">
                        <td className="p-3 border-r border-zinc-300 font-semibold" rowSpan={3}>
                          Operational Outflows
                        </td>
                        <td className="p-3 border-r border-zinc-300">Decoration, Pandal & Idol Arrangements</td>
                        <td className="p-3 text-right">
                          ₹{filteredExpenses.filter((e: any) => ["Decoration", "Pandal", "Idol"].includes(e.category_id || "")).reduce((sum: number, e: any) => sum + Number(e.amount), 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-300">
                        <td className="p-3 border-r border-zinc-300">Catering, Sound, and Volunteer Logistics</td>
                        <td className="p-3 text-right">
                          ₹{filteredExpenses.filter((e: any) => !["Decoration", "Pandal", "Idol"].includes(e.category_id || "")).reduce((sum: number, e: any) => sum + Number(e.amount), 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                      <tr className="bg-zinc-50 border-b border-zinc-300 font-bold">
                        <td className="p-3 border-r border-zinc-300 text-primary">Subtotal Disbursements</td>
                        <td className="p-3 text-right text-primary">₹{expenseTotal.toLocaleString("en-IN")}</td>
                      </tr>

                      <tr className="bg-zinc-100 border-t-2 border-zinc-500 font-bold text-lg">
                        <td className="p-4 border-r border-zinc-300 text-zinc-800" colSpan={2}>
                          Net Festival Surplus
                        </td>
                        <td className={`p-4 text-right ${balanceTotal >= 0 ? "text-[#2e7d32]" : "text-red-700"}`}>
                          ₹{balanceTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeReportType === "donations" && (
                <div className="space-y-8 pt-8">
                  <h3 className="text-xl font-bold border-b border-zinc-300 pb-2 text-zinc-800 font-serif">
                    Donation Ledger Book
                  </h3>
                  <table className="w-full text-left border-collapse border border-zinc-300 font-sans text-xs">
                    <thead>
                      <tr className="bg-zinc-100 font-bold border-b border-zinc-300 text-zinc-800">
                        <th className="p-2 border-r border-zinc-300">Donor Name</th>
                        <th className="p-2 border-r border-zinc-300">Campaign</th>
                        <th className="p-2 border-r border-zinc-300">Payment Mode</th>
                        <th className="p-2 border-r border-zinc-300 text-center">Date</th>
                        <th className="p-2 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDonations.slice(0, 30).map((d: any) => {
                        const campaignName = campaigns.find((c: any) => c.id === d.campaign_id)?.name || "General Contribution";
                        return (
                          <tr key={d.id} className="border-b border-zinc-200">
                            <td className="p-2 border-r border-zinc-300">{d.donor_name || (d.is_anonymous ? "Anonymous" : "N/A")}</td>
                            <td className="p-2 border-r border-zinc-300">{campaignName}</td>
                            <td className="p-2 border-r border-zinc-300 uppercase">{d.mode || "CASH"}</td>
                            <td className="p-2 border-r border-zinc-300 text-center">{new Date(d.created_at).toLocaleDateString()}</td>
                            <td className="p-2 text-right font-bold">₹{Number(d.amount).toLocaleString("en-IN")}</td>
                          </tr>
                        );
                      })}
                      {filteredDonations.length > 30 && (
                        <tr>
                          <td colSpan={5} className="p-2 text-center text-zinc-500 italic">
                            ... and {filteredDonations.length - 30} additional records (truncated in print view, download CSV for full audit)
                          </td>
                        </tr>
                      )}
                      <tr className="bg-zinc-50 font-bold border-t border-zinc-500">
                        <td colSpan={4} className="p-2 text-right text-zinc-700">Total Scoped Collections</td>
                        <td className="p-2 text-right text-primary">₹{donationTotal.toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeReportType === "expenses" && (
                <div className="space-y-8 pt-8">
                  <h3 className="text-xl font-bold border-b border-zinc-300 pb-2 text-zinc-800 font-serif">
                    Disbursement Ledger Book
                  </h3>
                  <table className="w-full text-left border-collapse border border-zinc-300 font-sans text-xs">
                    <thead>
                      <tr className="bg-zinc-100 font-bold border-b border-zinc-300 text-zinc-800">
                        <th className="p-2 border-r border-zinc-300">Expense Title</th>
                        <th className="p-2 border-r border-zinc-300">Category</th>
                        <th className="p-2 border-r border-zinc-300">Payment Mode</th>
                        <th className="p-2 border-r border-zinc-300 text-center">Date</th>
                        <th className="p-2 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.slice(0, 30).map((e: any) => (
                        <tr key={e.id} className="border-b border-zinc-200">
                          <td className="p-2 border-r border-zinc-300">{e.title}</td>
                          <td className="p-2 border-r border-zinc-300">{e.category_id || "Operations"}</td>
                          <td className="p-2 border-r border-zinc-300 uppercase">{e.payment_mode || "CASH"}</td>
                          <td className="p-2 border-r border-zinc-300 text-center">{e.expense_date || new Date(e.created_at).toLocaleDateString()}</td>
                          <td className="p-2 text-right font-bold">₹{Number(e.amount).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                      {filteredExpenses.length > 30 && (
                        <tr>
                          <td colSpan={5} className="p-2 text-center text-zinc-500 italic">
                            ... and {filteredExpenses.length - 30} additional records (truncated in print view, download CSV for full audit)
                          </td>
                        </tr>
                      )}
                      <tr className="bg-zinc-50 font-bold border-t border-zinc-500">
                        <td colSpan={4} className="p-2 text-right text-zinc-700">Total Scoped Disbursements</td>
                        <td className="p-2 text-right text-primary">₹{expenseTotal.toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sign-off signatures */}
              <div className="pt-20 flex justify-between items-center text-xs font-sans font-bold text-zinc-500 print:pt-32">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-40 border-b border-zinc-400 mb-1" />
                  <span>PREPARED BY TREASURER</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-40 border-b border-zinc-400 mb-1" />
                  <span>AUDITED BY PRESIDENT / OWNER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
