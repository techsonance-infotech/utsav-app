import { create } from "zustand";

export interface FinancialSummary {
  totalDonations: number;
  totalExpenses: number;
  netBalance: number;
  pendingApprovals: number;
  donationCount: number;
}

export interface TenantState {
  financialSummary: FinancialSummary | null;
  setFinancialSummary: (summary: FinancialSummary | null) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  financialSummary: null,
  setFinancialSummary: (financialSummary) => set({ financialSummary }),
}));
