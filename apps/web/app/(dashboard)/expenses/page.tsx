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
import { ExpenseRow } from "@utsav/ui";

export default function WebExpensesPage() {
  const { role } = useAuthStore();
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();
  const { data: categories = [] } = useExpenseCategories();

  const createMutation = useCreateExpense();
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const payMutation = usePayExpense();

  // Dialog & Submission States
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "bank_transfer" | "upi" | "cheque">("cash");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rejection note states
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const hasAdminAccess = ["owner", "admin", "treasurer"].includes(role || "");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) return;

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

      // Clear form
      setTitle("");
      setAmount("");
      setCategoryId("");
      setDescription("");
      setReceiptUrl("");
      setShowSubmitModal(false);
    } catch (err) {
      console.error("Create expense error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
    } catch (err) {
      console.error("Approve expense error:", err);
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectId(id);
    setReviewNote("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectId) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectId, review_note: reviewNote });
      setRejectId(null);
    } catch (err) {
      console.error("Reject expense error:", err);
    }
  };

  const handlePay = async (id: string) => {
    try {
      await payMutation.mutateAsync(id);
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

  const totalPaidExpenses = expenses
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const pendingExpenses = expenses.filter((e) => e.status === "pending_approval");
  const approvedUnpaidExpenses = expenses.filter((e) => e.status === "approved");
  const paidLedger = expenses.filter((e) => e.status === "paid" || e.status === "rejected");

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6 text-neutral-100 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-100">Mandal Expenses</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage vendor disbursements and log committee cash balances.</p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/10"
        >
          ➕ Submit Expense
        </button>
      </div>

      {/* Aggregate Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-850 p-6 rounded-2xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Total Disbursed (Paid)</span>
          <div className="text-3xl font-extrabold text-neutral-100 mt-2 font-mono">
            {formatRupee(totalPaidExpenses)}
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-850 p-6 rounded-2xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Pending Review Count</span>
          <div className="text-3xl font-extrabold text-orange-400 mt-2 font-mono">
            {pendingExpenses.length}
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-850 p-6 rounded-2xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Approved & Unpaid</span>
          <div className="text-3xl font-extrabold text-blue-400 mt-2 font-mono">
            {approvedUnpaidExpenses.length}
          </div>
        </div>
      </div>

      {/* Main Ledger Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending approvals column */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-neutral-300 flex items-center gap-2">
            <span>⌛</span> Pending Review
          </h2>
          {loadingExpenses ? (
            <div className="p-4 bg-neutral-900 rounded-2xl h-24 animate-pulse" />
          ) : pendingExpenses.length === 0 ? (
            <p className="text-xs text-neutral-500 bg-neutral-900/50 border border-neutral-850 p-6 rounded-2xl text-center">
              No expenses awaiting approval.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingExpenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onApprove={handleApprove}
                  onReject={handleRejectClick}
                  showActions={hasAdminAccess}
                />
              ))}
            </div>
          )}
        </div>

        {/* Approved & Unpaid + Ledger column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Approved unpaid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-300 flex items-center gap-2">
              <span>💳</span> Approved & Awaiting Payment
            </h2>
            {approvedUnpaidExpenses.length === 0 ? (
              <p className="text-xs text-neutral-500 bg-neutral-900/50 border border-neutral-850 p-6 rounded-2xl text-center">
                No unpaid items.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedUnpaidExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onPay={handlePay}
                    showActions={hasAdminAccess}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Archived Ledger */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-300 flex items-center gap-2">
              <span>📜</span> Ledger Archive
            </h2>
            {paidLedger.length === 0 ? (
              <p className="text-xs text-neutral-500 bg-neutral-900/50 border border-neutral-850 p-6 rounded-2xl text-center">
                Archive ledger is empty.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paidLedger.map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REJECTION REVIEW MODAL */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-850 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-100">Reject Expense</h3>
            <p className="text-xs text-neutral-400">Please provide a reason or note detailing why this expense is rejected.</p>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="e.g. Missing valid vendor invoice attachment."
              className="w-full h-24 bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-orange-500"
            />
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setRejectId(null)}
                className="px-4 py-2 border border-neutral-805 text-neutral-400 text-xs font-semibold rounded-lg hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-neutral-100 text-xs font-semibold rounded-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW EXPENSE MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-850 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-855">
              <h3 className="text-xl font-bold text-neutral-100">Submit New Expense</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-neutral-500 hover:text-neutral-300">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Expense Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Flower Decoration Aarti"
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 12500"
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI / Online</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Expense Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Receipt File URL</label>
                  <input
                    type="text"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    placeholder="https://example.com/receipt.pdf"
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Description / Comments</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about vendor, item counts, or notes..."
                  className="w-full h-20 bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl text-sm transition-all"
              >
                {isSubmitting ? "Submitting..." : "Submit Expense Voucher"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
