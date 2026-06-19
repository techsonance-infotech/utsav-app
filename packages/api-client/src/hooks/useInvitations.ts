import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../client";

export interface Invitation {
  id: string;
  tenant_id: string;
  created_by: string;
  role: string;
  token: string;
  email?: string | null;
  phone?: string | null;
  invitee_name?: string | null;
  expires_at: string;
  used_at?: string | null;
  used_by?: string | null;
  is_bulk: boolean;
  created_at: string;
}

export interface InvitationMetadata {
  token: string;
  role: string;
  tenant: {
    name: string;
    slug: string;
    city?: string | null;
    state?: string | null;
  };
}

export function useGenerateInvite() {
  return useMutation({
    mutationFn: async (data: {
      role: string;
      email?: string;
      phone?: string;
      invitee_name?: string;
      expires_in_days?: number;
    }) => {
      return apiClient<{ token: string; link: string; invitation: Invitation }>("/invitations", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

export function useFetchInvite(token: string | null) {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");
      return apiClient<InvitationMetadata>(`/invitations/${token}`);
    },
    enabled: !!token,
  });
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: async (token: string) => {
      return apiClient<{ success: boolean; tenantId: string; role: string }>("/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
    },
  });
}
