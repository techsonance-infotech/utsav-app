import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { useAuthStore } from "@utsav/stores";

export interface TenantDetails {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  plan: string;
  plan_expires_at?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  primary_color: string;
  city?: string | null;
  state?: string | null;
  country: string;
  default_language: string;
  timezone: string;
  is_public_donations: boolean;
  is_public_expenses: boolean;
  founded_year?: number | null;
  description?: string | null;
  address?: string | null;
  website_url?: string | null;
  whatsapp_group_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  razorpay_key_id?: string | null;
}

export function useCheckSlug(name: string) {
  return useQuery({
    queryKey: ["check-slug", name],
    queryFn: async () => {
      if (!name) return { available: false, slug: "", suggestions: [] as string[] };
      return apiClient<{ available: boolean; slug: string; suggestions: string[] }>(
        "/tenants/check-slug",
        {
          params: { name },
        }
      );
    },
    enabled: name.length >= 2,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateTenant() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const currentAuth = useAuthStore((state) => state);

  return useMutation({
    mutationFn: async (data: {
      name: string;
      slug: string;
      vertical: string;
      city: string;
      state: string;
      address: string;
      primary_color?: string;
      default_language?: string;
      description?: string;
    }) => {
      return apiClient<{
        id: string;
        name: string;
        slug: string;
        role: string;
        accessToken?: string;
      }>("/tenants", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      // Update tenant session details
      setAuth({
        ...currentAuth,
        tenantId: data.id,
        tenantName: data.name,
        tenantSlug: data.slug,
        role: data.role,
      });
    },
  });
}

export function useFetchTenant(id: string | null) {
  return useQuery({
    queryKey: ["tenant", id],
    queryFn: async () => {
      if (!id) throw new Error("No tenant ID provided");
      return apiClient<TenantDetails>(`/tenants/${id}`);
    },
    enabled: !!id,
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<TenantDetails> & { id: string }) => {
      return apiClient<TenantDetails>(`/tenants/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tenant", data.id] });
    },
  });
}
