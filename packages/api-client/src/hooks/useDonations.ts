import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { useAuthStore } from "@utsav/stores";

export interface Donation {
  id: string;
  tenant_id: string;
  campaign_id?: string | null;
  donor_id?: string | null;
  recorded_by?: string | null;
  donor_name: string;
  donor_phone?: string | null;
  donor_email?: string | null;
  amount: number;
  currency: string;
  mode: "online" | "cash" | "cheque" | "bank_transfer" | "in_kind";
  status: "pending" | "confirmed" | "failed" | "refunded";
  receipt_number?: string | null;
  is_anonymous: boolean;
  is_in_kind: boolean;
  in_kind_description?: string | null;
  note?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonationCampaign {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  target_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  is_public: boolean;
  cover_image_url?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  total_donations: number;
  total_expenses: number;
  net_balance: number;
  pending_approvals: number;
  donation_count: number;
  expense_count: number;
}

export function useFetchDonations(params?: Record<string, string>) {
  const { tenantId, userId } = useAuthStore();
  return useQuery({
    queryKey: ["donations", tenantId, params],
    queryFn: async () => {
      return apiClient<Donation[]>("/donations", { params });
    },
    enabled: !!tenantId && !!userId,
  });
}

export function useFetchCampaigns() {
  const { tenantId, userId } = useAuthStore();
  return useQuery({
    queryKey: ["donation-campaigns", tenantId],
    queryFn: async () => {
      return apiClient<DonationCampaign[]>("/donations?campaigns=true");
    },
    enabled: !!tenantId && !!userId,
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      donor_name: string;
      donor_phone?: string;
      donor_email?: string;
      amount: number;
      mode: string;
      campaign_id?: string;
      is_anonymous?: boolean;
      note?: string;
    }) => {
      return apiClient<Donation>("/donations", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

export function useCreateRazorpayOrder() {
  return useMutation({
    mutationFn: async (data: {
      donor_name: string;
      donor_phone?: string;
      donor_email?: string;
      amount: number; // In rupees, backend will convert to paise
      campaign_id?: string;
      is_anonymous?: boolean;
      note?: string;
    }) => {
      return apiClient<{
        id: string;
        amount: number;
        currency: string;
        key_id?: string;
        donation_id: string;
        is_mock?: boolean;
      }>("/donations/razorpay/order", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

export function useFinancialSummary(tenantId?: string | null) {
  const { userId } = useAuthStore();
  return useQuery({
    queryKey: ["financial-summary", tenantId],
    queryFn: async () => {
      if (!tenantId) {
        return {
          total_donations: 0,
          total_expenses: 0,
          net_balance: 0,
          pending_approvals: 0,
          donation_count: 0,
          expense_count: 0,
        } as FinancialSummary;
      }
      return apiClient<FinancialSummary>("/reports/financial-summary");
    },
    enabled: !!tenantId && !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useFetchDonation(id: string) {
  return useQuery({
    queryKey: ["donation", id],
    queryFn: async () => {
      return apiClient<Donation>(`/donations/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      target_amount?: number;
      start_date?: string;
      end_date?: string;
    }) => {
      return apiClient<DonationCampaign>("/donation-campaigns", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation-campaigns"] });
    },
  });
}

export function useUpdateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiClient<Donation>(`/donations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

