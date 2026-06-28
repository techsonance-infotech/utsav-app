import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { useAuthStore } from "@utsav/stores";

export interface Vendor {
  id: string;
  tenant_id: string;
  name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  category?: string | null;
  address?: string | null;
  payment_terms?: string | null;
  gst_number?: string | null;
  status: "active" | "inactive";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  tenant_id: string;
  vendor_id: string;
  po_number: string;
  title: string;
  description?: string | null;
  total_amount: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "completed";
  expected_delivery_date?: string | null;
  items: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  vendors?: { name: string };
}

export interface VendorInvoice {
  id: string;
  tenant_id: string;
  vendor_id: string;
  purchase_order_id?: string | null;
  invoice_number: string;
  amount: number;
  due_date?: string | null;
  status: "pending" | "approved" | "rejected" | "paid";
  notes?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  vendors?: { name: string };
  purchase_orders?: { po_number: string };
}

export function useFetchVendors() {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: ["vendors", tenantId],
    queryFn: () => apiClient<Vendor[]>("/vendors"),
    enabled: !!tenantId,
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      category: string;
      contact_person: string;
      phone: string;
      email?: string;
      gst_number?: string;
      payment_terms?: string;
      bank_account_number?: string;
      bank_ifsc_code?: string;
      notes?: string;
    }) =>
      apiClient<Vendor>("/vendors", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

export function useFetchPurchaseOrders() {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: ["purchase-orders", tenantId],
    queryFn: () => apiClient<PurchaseOrder[]>("/purchase-orders"),
    enabled: !!tenantId,
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      vendor_id: string;
      po_number: string;
      title: string;
      description?: string;
      total_amount: number;
      expected_delivery_date?: string;
      items?: any[];
    }) =>
      apiClient<PurchaseOrder>("/purchase-orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useFetchVendorInvoices() {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: ["vendor-invoices", tenantId],
    queryFn: () => apiClient<VendorInvoice[]>("/vendor-invoices"),
    enabled: !!tenantId,
  });
}

export function useCreateVendorInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      vendor_id: string;
      purchase_order_id?: string;
      invoice_number: string;
      amount: number;
      due_date?: string;
      notes?: string;
    }) =>
      apiClient<VendorInvoice>("/vendor-invoices", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-invoices"] });
    },
  });
}

export function useUpdateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        name?: string;
        category?: string;
        contact_person?: string;
        phone?: string;
        email?: string;
        gst_number?: string;
        payment_terms?: string;
        bank_account_number?: string;
        bank_ifsc_code?: string;
        notes?: string;
        status?: string;
      };
    }) =>
      apiClient<Vendor>(`/vendors/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(`/vendors/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}
