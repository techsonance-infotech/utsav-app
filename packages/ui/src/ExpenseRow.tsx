import React from "react";
import type { Expense } from "@utsav/types";

interface ExpenseRowProps {
  expense: Expense & {
    category?: { name: string; color: string; icon: string } | null;
    vendor?: { name: string; phone: string } | null;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPay?: (id: string) => void;
  showActions?: boolean;
}

export function ExpenseRow({ expense, onApprove, onReject, onPay, showActions = false }: ExpenseRowProps) {
  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    draft: { bg: "bg-neutral-500/10", text: "text-neutral-400", border: "border-neutral-500/20" },
    pending_approval: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    approved: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    rejected: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
    paid: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  };

  const currentStatus = statusColors[expense.status] || statusColors.draft;

  return (
    <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-5 hover:border-orange-500/20 transition-all space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-100">{expense.title}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} uppercase tracking-wider`}>
              {expense.status.replace("_", " ")}
            </span>
          </div>

          <div className="text-xs text-neutral-400 flex flex-wrap gap-x-3 gap-y-1">
            {expense.category && (
              <span className="flex items-center gap-1">
                <span>{expense.category.icon || "📂"}</span>
                <span>{expense.category.name}</span>
              </span>
            )}
            {expense.vendor && <span>Vendor: {expense.vendor.name}</span>}
            <span>Date: {expense.expense_date}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-extrabold text-neutral-100 font-mono">
            {formatRupee(expense.amount)}
          </div>
          {expense.payment_mode && (
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">
              via {expense.payment_mode}
            </span>
          )}
        </div>
      </div>

      {expense.description && (
        <p className="text-xs text-neutral-400 bg-neutral-950 p-3 rounded-lg border border-neutral-900 italic">
          "{expense.description}"
        </p>
      )}

      {expense.receipt_url && (
        <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-900">
          <span className="text-xs text-neutral-400">Attached Receipt Voucher</span>
          <a
            href={expense.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-orange-400 hover:text-orange-500 transition-colors"
          >
            View File ↗
          </a>
        </div>
      )}

      {/* Approve / Reject Actions */}
      {showActions && expense.status === "pending_approval" && (onApprove || onReject) && (
        <div className="flex gap-2 pt-2 border-t border-neutral-855">
          {onApprove && (
            <button
              onClick={() => onApprove(expense.id)}
              className="flex-1 py-2 text-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl text-xs transition-all"
            >
              Approve
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(expense.id)}
              className="flex-1 py-2 text-center bg-neutral-950 border border-neutral-805 hover:bg-neutral-800 text-rose-500 font-bold rounded-xl text-xs transition-all"
            >
              Reject
            </button>
          )}
        </div>
      )}

      {/* Pay Action for approved expense */}
      {showActions && expense.status === "approved" && onPay && (
        <div className="pt-2 border-t border-neutral-855">
          <button
            onClick={() => onPay(expense.id)}
            className="w-full py-2 text-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-neutral-950 font-bold rounded-xl text-xs transition-all"
          >
            Record Payment
          </button>
        </div>
      )}
    </div>
  );
}
