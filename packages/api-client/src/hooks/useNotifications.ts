import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { Notification, PushToken } from "@utsav/types";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      return apiClient<Notification[]>("/notifications");
    },
  });
}

export function useUnreadNotificationsCount() {
  const { data: notifications } = useNotifications();
  return notifications?.filter((n) => !n.is_read).length || 0;
}

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: async (data: { token: string; platform: "ios" | "android" }) => {
      return apiClient<PushToken>("/push-tokens", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id?: string; ids?: string[]; all?: boolean }) => {
      return apiClient<{ success: boolean; count: number }>("/notifications", {
        method: "PATCH",
        body: JSON.stringify(params),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      title_hi?: string;
      title_gu?: string;
      body: string;
      body_hi?: string;
      body_gu?: string;
      target_role?: string;
      payload?: Record<string, any>;
    }) => {
      return apiClient<{ success: boolean; in_app_count: number; push_count: number }>(
        "/notifications/broadcast",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
