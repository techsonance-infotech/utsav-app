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
  date_of_birth?: string | null;
  skills?: string[] | string | null;
  languages?: string[] | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
  preferred_language: string;
  dnd_start_time?: string | null;
  dnd_end_time?: string | null;
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
    mutationFn: async ({ id, role, status }: { id: string; role?: string; status?: string }) => {
      return apiClient<Member>(`/members/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role, status }),
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

export function useFetchMyProfile() {
  const { tenantId, userId } = useAuthStore();
  return useQuery({
    queryKey: ["my-profile", tenantId, userId],
    queryFn: async () => {
      return apiClient<Member & { email: string }>("/members/me");
    },
    enabled: !!tenantId && !!userId,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  const { tenantId, userId } = useAuthStore();

  return useMutation({
    mutationFn: async (data: {
      fullName?: string;
      phone?: string;
      avatarUrl?: string;
      city?: string;
      state?: string;
      dateOfBirth?: string | null;
      skills?: string[] | string | null;
      languages?: string[] | null;
      emergencyContactName?: string | null;
      emergencyContactPhone?: string | null;
      notes?: string | null;
      preferredLanguage?: string | null;
      membershipType?: string | null;
      dndStartTime?: string | null;
      dndEndTime?: string | null;
    }) => {
      return apiClient<Member>("/members/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      if (data && data.full_name) {
        useAuthStore.getState().setAuth({
          userFullName: data.full_name,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["my-profile", tenantId, userId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
