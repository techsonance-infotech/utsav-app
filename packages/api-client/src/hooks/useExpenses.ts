import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { Expense, CreateExpenseInput, ExpenseCategory } from "@utsav/types";
import { useAuthStore } from "@utsav/stores";

export function useExpenses(status?: string) {
  const { tenantId, userId } = useAuthStore();
  return useQuery({
    queryKey: ["expenses", tenantId, status],
    queryFn: () => {
      const url = `/expenses${status ? `?status=${status}` : ""}`;
      return apiClient<Expense[]>(url);
    },
    enabled: !!tenantId && !!userId,
  });
}

export function useExpenseCategories() {
  const { tenantId, userId } = useAuthStore();
  return useQuery({
    queryKey: ["expense-categories", tenantId],
    queryFn: () => apiClient<ExpenseCategory[]>("/expense-categories"),
    enabled: !!tenantId && !!userId,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) =>
      apiClient<Expense>("/expenses", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

export function useApproveExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<Expense>(`/expenses/${id}/approve`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

export function useRejectExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, review_note }: { id: string; review_note?: string }) =>
      apiClient<Expense>(`/expenses/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ review_note }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

export function usePayExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<Expense>(`/expenses/${id}/pay`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

export function useFetchExpense(id: string) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => apiClient<Expense>(`/expenses/${id}`),
    enabled: !!id,
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<CreateExpenseInput> & { id: string }) =>
      apiClient<Expense>(`/expenses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expense", data.id] });
      qc.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; color?: string; icon?: string; budget?: number; sort_order?: number }) =>
      apiClient<ExpenseCategory>("/expense-categories", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });
}

