import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { VolunteerDuty } from "@utsav/types";
import { useAuthStore } from "@utsav/stores";

export function useVolunteerDuties(eventId?: string) {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: ["volunteer-duties", tenantId, eventId],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (eventId) params.event_id = eventId;
      return apiClient<VolunteerDuty[]>("/volunteer-duties", { params });
    },
    enabled: !!tenantId,
  });
}

export function useCreateVolunteerDuty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<VolunteerDuty>) =>
      apiClient<VolunteerDuty>("/volunteer-duties", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-duties"] });
    },
  });
}

export function useVolunteerCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dutyId: string) =>
      apiClient<any>(`/volunteer-duties/${dutyId}/checkin`, {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-duties"] });
    },
  });
}

export function useFetchVolunteerDuty(id: string) {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: ["volunteer-duty", id, tenantId],
    queryFn: () => apiClient<VolunteerDuty>(`/volunteer-duties/${id}`),
    enabled: !!tenantId && !!id,
  });
}

export function useUpdateVolunteerDuty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<VolunteerDuty> & { id: string }) =>
      apiClient<VolunteerDuty>(`/volunteer-duties/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["volunteer-duties"] });
      qc.invalidateQueries({ queryKey: ["volunteer-duty", variables.id] });
    },
  });
}

export function useDeleteVolunteerDuty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(`/volunteer-duties/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-duties"] });
    },
  });
}

