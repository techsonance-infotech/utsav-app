import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { Event, CreateEventInput, EventRSVP } from "@utsav/types";
import { useAuthStore } from "@utsav/stores";

export function useEvents() {
  const { tenantId, userId } = useAuthStore();
  return useQuery({
    queryKey: ["events", tenantId],
    queryFn: () => apiClient<Event[]>("/events"),
    enabled: !!tenantId && !!userId,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) =>
      apiClient<Event>("/events", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useRSVP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: "attending" | "maybe" | "not_attending" }) =>
      apiClient<EventRSVP>(`/events/${eventId}/rsvp`, {
        method: "POST",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
