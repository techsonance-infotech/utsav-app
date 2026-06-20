import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { useAuthStore } from "@utsav/stores";

export interface Member {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  status: string;
  membership_type?: string | null;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  state?: string | null;
  preferred_language: string;
  joined_at: string;
  last_seen_at?: string | null;
}

export function useFetchMembers(filters?: { role?: string; status?: string; search?: string }) {
  const { tenantId, userId } = useAuthStore();
  return useQuery({
    queryKey: ["members", tenantId, filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.role) params.role = filters.role;
      if (filters?.status) params.status = filters.status;
      if (filters?.search) params.search = filters.search;

      return apiClient<Member[]>("/members", { params });
    },
    enabled: !!tenantId && !!userId,
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      return apiClient<Member>(`/members/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ success: boolean }>(`/members/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
