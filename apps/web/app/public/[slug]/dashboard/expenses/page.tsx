"use client";

import React, { useState } from "react";
import {
  useExpenses,
  useExpenseCategories,
  useCreateExpense,
  useApproveExpense,
  useRejectExpense,
  usePayExpense,
} from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { useParams } from "next/navigation";
import { X, Check, Eye, AlertTriangle } from "lucide-react";

export default function WebExpensesPage() {
  const { role } = useAuthStore();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const { data: expenses = [], isLoading: loadingExpenses, refetch } = useExpenses() as any;
  const { data: categories = [] } = useExpenseCategories() as any;

  const createMutation = useCreateExpense();
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const payMutation = usePayExpense();

  // Create Form Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "bank_transfer" | "upi" | "cheque">("cash");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Rejection Dialog State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  // Zoom receipt state
  const [zoomedReceipt, setZoomedReceipt] = useState<string | null>(null);

  // Search, Filters, and Pagination states
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const hasAdminAccess = ["owner", "admin", "treasurer"].includes(role || "");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title || !amount || Number(amount) <= 0) {
      setErrorMsg("Please enter a valid title and amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        title,
        amount: Number(amount),
        category_id: categoryId || undefined,
        description: description || undefined,
        payment_mode: paymentMode,
        expense_date: expenseDate,
        receipt_url: receiptUrl || undefined,
        gst_amount: 0,
      });

      // Clear Form
      setTitle("");
      setAmount("");
      setCategoryId("");
      setDescription("");
      setReceiptUrl("");
      setIsDrawerOpen(false);
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create expense record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      refetch();
    } catch (err) {
      console.error("Approve expense error:", err);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectId) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectId, review_note: reviewNote });
      setRejectId(null);
      refetch();
    } catch (err) {
      console.error("Reject expense error:", err);
    }
  };

  const handlePay = async (id: string) => {
    try {
      await payMutation.mutateAsync(id);
      refetch();
    } catch (err) {
      console.error("Pay expense error:", err);
    }
  };

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Stats computation
  const totalBudgetUsed = expenses
    .filter((e: any) => e.status === "paid")
    .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  const pendingAmount = expenses
    .filter((e: any) => e.status === "pending_approval")
    .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  const pendingCount = expenses.filter((e: any) => e.status === "pending_approval").length;
  const totalVouchers = expenses.length;

  const getSubmittingInitials = (userStr: string) => {
    if (!userStr) return "MB";
    return userStr.slice(0, 2).toUpperCase();
  };

  // Local filtering & pagination logic
  const filteredExpenses = expenses.filter((e: any) => {
    if (search.trim() && !e.title.toLowerCase().includes(search.toLowerCase()) && !(e.description || "").toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (categoryFilter && e.category_id !== categoryFilter) {
      return false;
    }
    if (statusFilter && e.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const totalRows = filteredExpenses.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + rowsPerPage);

  const handleExportCSV = () => {
    const headers = ["ID", "Expense Title", "Category", "Vendor", "Date", "Amount", "Submitted By", "Status"];
    const rows = filteredExpenses.map((e: any) => [
      `EX-${e.id.slice(0, 6).toUpperCase()}`,
      e.title,
      e.category?.name || "General",
      e.description || "General Vendor",
      e.expense_date,
      e.amount,
      e.created_by?.split("@")[0] || "Member",
      e.status
    ]);

    const csvContent = [headers.join(","), ...rows.map((r: any) => r.map((val: any) => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      
      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div className="bg-surface-container-low border border-sandstone p-lg rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="p-2 bg-primary-container/10 rounded-lg">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            </div>
            <span className="text-tulsi-green font-bold text-label-sm">+12.5%</span>
          </div>
          <p className="text-on-surface-variant font-label-md mb-xs">Total Budget Used</p>
          <h3 className="font-display-xl text-display-xl font-bold text-on-surface">{formatRupee(totalBudgetUsed)}</h3>
        </div>

        <div className="bg-surface-container-low border border-sandstone p-lg rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="p-2 bg-haldi-yellow/10 rounded-lg">
              <span className="material-symbols-outlined text-haldi-yellow">pending_actions</span>
            </div>
            <span className="text-secondary font-bold text-label-sm">{pendingCount} Pending</span>
          </div>
          <p className="text-on-surface-variant font-label-md mb-xs">Pending Approval</p>
          <h3 className="font-display-xl text-display-xl font-bold text-on-surface">{formatRupee(pendingAmount)}</h3>
        </div>

        <div className="bg-surface-container-low border border-sandstone p-lg rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="p-2 bg-aarti-gold/10 rounded-lg">
              <span className="material-symbols-outlined text-aarti-gold">receipt_long</span>
            </div>
            <span className="text-on-surface-variant text-label-sm">This Month</span>
          </div>
          <p className="text-on-surface-variant font-label-md mb-xs">Total Vouchers</p>
          <h3 className="font-display-xl text-display-xl font-bold text-on-surface">{totalVouchers}</h3>
        </div>

        <div
          onClick={() => {
            setTitle("");
            setAmount("");
            setDescription("");
            setIsDrawerOpen(true);
          }}
          className="bg-primary shadow-lg shadow-primary/20 p-lg rounded-xl flex flex-col justify-between text-white group cursor-pointer overflow-hidden relative"
        >
          <div className="shimmer absolute inset-0 opacity-20 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="font-headline-sm text-headline-sm font-bold mb-xs text-white">New Expense</p>
            <p className="text-puja-white/80 font-label-md">Submit a digital receipt for quick reimbursement</p>
          </div>
          <button className="relative z-10 mt-md bg-white text-primary w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined">add</span>
            Add Expense
          </button>
        </div>
      </div>

      {/* Main Table Ledger Section */}
      <section className="bg-white border border-sandstone rounded-xl shadow-sm overflow-hidden">
        <div className="p-lg border-b border-sandstone flex flex-wrap justify-between items-center gap-md">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Expense Ledger</h2>
            <p className="text-on-surface-variant text-body-md">Detailed view of all festival expenditures</p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-on-surface font-label-md hover:bg-surface-variant transition-colors ${
                showFilters ? "bg-cream border-primary text-primary" : "border-sandstone bg-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-sandstone bg-white rounded-lg text-on-surface font-label-md hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Panel (Expanded View) */}
        {showFilters && (
          <div className="p-lg bg-surface-container-low border-b border-sandstone grid grid-cols-1 md:grid-cols-3 gap-md animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="block font-label-sm text-label-sm text-on-surface-variant">Search Expense</label>
              <input
                type="text"
                placeholder="Search description or title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white border border-sandstone rounded-lg p-2 text-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block font-label-sm text-label-sm text-on-surface-variant">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white border border-sandstone rounded-lg p-2 text-body-md focus:ring-primary focus:border-primary outline-none font-bold"
              >
                <option value="">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-label-sm text-label-sm text-on-surface-variant">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white border border-sandstone rounded-lg p-2 text-body-md focus:ring-primary focus:border-primary outline-none font-bold"
              >
                <option value="">All Statuses</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          {loadingExpenses ? (
            <div className="bg-white rounded-xl border border-sandstone shadow-sm overflow-hidden p-16 text-center w-full">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Loading organization expenses...</span>
            </div>
          ) : filteredExpenses.length > 0 ? (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-sandstone">
                    <th className="px-lg py-4 font-label-md text-on-surface-variant">Expense Title</th>
                    <th className="px-lg py-4 font-label-md text-on-surface-variant">Category</th>
                    <th className="px-lg py-4 font-label-md text-on-surface-variant">Vendor</th>
                    <th className="px-lg py-4 font-label-md text-on-surface-variant text-right">Amount (₹)</th>
                    <th className="px-lg py-4 font-label-md text-on-surface-variant">Submitted By</th>
                    <th className="px-lg py-4 font-label-md text-on-surface-variant">Receipt</th>
                    <th className="px-lg py-4 font-label-md text-on-surface-variant">Status</th>
                    <th className="px-lg py-4 font-label-md text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sandstone">
                  {paginatedExpenses.map((expense: any) => (
                    <tr key={expense.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-lg py-4">
                        <div className="font-label-md font-bold text-on-surface">{expense.title}</div>
                        <div className="text-xs text-on-surface-variant font-mono">
                          ID: #{expense.id.slice(0, 6).toUpperCase()} • {expense.expense_date}
                        </div>
                      </td>
                      <td className="px-lg py-4">
                        <span className="px-3 py-1 bg-primary-container/10 text-primary font-label-sm rounded-full text-xs font-bold uppercase tracking-wider">
                          {expense.category?.name || "General"}
                        </span>
                      </td>
                      <td className="px-lg py-4 font-body-md text-on-surface-variant">
                        {expense.description || "General Vendor"}
                      </td>
                      <td className="px-lg py-4 text-right font-mono-data font-bold text-charcoal">
                        {Number(expense.amount).toLocaleString("en-IN")}
                      </td>
                    <td className="px-lg py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sandstone flex items-center justify-center text-[10px] font-bold text-charcoal shrink-0">
                          {getSubmittingInitials(expense.created_by)}
                        </div>
                        <span className="font-label-sm text-xs truncate max-w-[100px]" title={expense.created_by}>
                          {expense.created_by?.split("@")[0] || "Member"}
                        </span>
                      </div>
                    </td>
                    <td className="px-lg py-4">
                      {expense.receipt_url ? (
                        <div
                          onClick={() => setZoomedReceipt(expense.receipt_url)}
                          className="w-10 h-10 rounded-lg border border-sandstone bg-surface overflow-hidden cursor-zoom-in group relative shrink-0"
                        >
                          <img src={expense.receipt_url} className="w-full h-full object-cover" alt="receipt" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-outline italic">No Receipt</span>
                      )}
                    </td>
                    <td className="px-lg py-4">
                      <span
                        className={`flex items-center gap-1.5 font-bold text-label-sm capitalize ${
                          expense.status === "paid"
                            ? "text-aarti-gold"
                            : expense.status === "approved"
                            ? "text-tulsi-green"
                            : expense.status === "rejected"
                            ? "text-kumkum-red"
                            : "text-haldi-yellow"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            expense.status === "paid"
                              ? "bg-aarti-gold"
                              : expense.status === "approved"
                              ? "bg-tulsi-green"
                              : expense.status === "rejected"
                              ? "bg-kumkum-red"
                              : "bg-haldi-yellow animate-pulse"
                          }`}
                        />
                        {expense.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-lg py-4 text-right">
                      {hasAdminAccess && expense.status === "pending_approval" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(expense.id)}
                            className="px-3 py-1.5 bg-tulsi-green text-white rounded-lg font-bold text-label-sm hover:opacity-90 active:scale-95 transition-all text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setReviewNote("");
                              setRejectId(expense.id);
                            }}
                            className="px-3 py-1.5 border border-kumkum-red text-kumkum-red rounded-lg font-bold text-label-sm hover:bg-kumkum-red/5 active:scale-95 transition-all text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {hasAdminAccess && expense.status === "approved" && (
                        <button
                          onClick={() => handlePay(expense.id)}
                          className="px-4 py-1.5 bg-aarti-gold text-white rounded-lg font-bold text-label-sm hover:opacity-90 active:scale-95 transition-all text-xs"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="p-lg border-t border-sandstone flex justify-between items-center bg-surface-container-low">
              <p className="text-label-sm text-on-surface-variant">
                Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)} of {totalRows} expenditures
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-sandstone rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-label-sm transition-all ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "hover:bg-white text-on-surface"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 border border-sandstone rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        ) : (
            <div className="p-16 text-center text-on-surface-variant font-label-md">
              No expenditures recorded in this mandal ledger.
            </div>
          )}
        </div>
      </section>

      {/* Slide-out Submit Expense Panel */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border-l border-sandstone h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300 overflow-y-auto">
            
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-6 right-6 p-2 bg-[#FAFAF8] border border-[#E8E2D6] hover:bg-[#F4F1EB] rounded-lg text-gray-500 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#3A3530] uppercase tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                  Submit Expense Voucher
                </h2>
                <p className="text-gray-500 text-xs mt-1 font-semibold leading-relaxed">
                  Log a payout request for community mandal approval.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-error-container text-error rounded-xl text-xs font-semibold text-center border border-error/20">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                    Voucher Description / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Florist Stage Setup"
                    className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Amount (INR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary font-mono-data"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary font-bold"
                    >
                      <option value="">General / Operations</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Submittal Date
                    </label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Reimbursement Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e: any) => setPaymentMode(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI / Online</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                    Digital Receipt URL
                  </label>
                  <input
                    type="url"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    placeholder="https://example.com/receipt.jpg"
                    className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                    Remarks / Submittal Note
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write detailed vendor information or breakdown..."
                    rows={2}
                    className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-container text-on-primary-container hover:opacity-90 font-bold py-4 rounded-xl shadow-lg mt-4 uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-on-primary-container border-t-transparent animate-spin" />
                      <span>Submitting Voucher...</span>
                    </>
                  ) : (
                    "Submit for Approval"
                  )}
                </button>
              </form>
            </div>

            <div className="bg-[#FAFAF8] border border-sandstone p-4 rounded-xl flex gap-3 text-gray-500 text-[11px] font-semibold leading-relaxed mt-6">
              <AlertTriangle className="w-5 h-5 text-aarti-gold shrink-0" />
              <span>
                All submitted expenditures are audited by the treasure committee. Please upload high-resolution receipts to avoid rejection.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Dialog */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sandstone rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-charcoal">Reject Expense Voucher</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Please provide a validation rejection note detailing why this transaction cannot be approved.
            </p>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="e.g. Uploaded receipt does not show the clear final amount."
              rows={3}
              className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectId(null)}
                className="px-4 py-2 border border-sandstone rounded-lg text-xs font-semibold text-charcoal hover:bg-cream"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-kumkum-red text-white rounded-lg text-xs font-semibold hover:opacity-90"
              >
                Reject Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Zoom modal */}
      {zoomedReceipt && (
        <div
          onClick={() => setZoomedReceipt(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img src={zoomedReceipt} className="max-w-full max-h-[90vh] object-contain rounded-lg border border-sandstone/20" alt="zoom receipt" />
        </div>
      )}

    </div>
  );
}
