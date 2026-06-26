import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { useAuthStore } from "@utsav/stores";

export interface ChatChannel {
  id: string;
  tenant_id: string;
  name?: string | null;
  type: "direct" | "group";
  created_by: string;
  created_at: string;
  last_message_at: string;
  last_message_text?: string | null;
  members?: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  }[];
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar_url?: string | null;
  message_text?: string | null;
  media_url?: string | null;
  media_type?: "image" | "video" | "document" | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export function useChatChannels() {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: ["chat-channels", tenantId],
    queryFn: () => apiClient<ChatChannel[]>("/chat/channels"),
    enabled: !!tenantId,
  });
}

export function useCreateChatChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; type: "direct" | "group"; member_ids: string[] }) =>
      apiClient<ChatChannel>("/chat/channels", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
    },
  });
}

export function useChatMessages(channelId?: string, cursor?: string) {
  return useQuery({
    queryKey: ["chat-messages", channelId, cursor],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (cursor) params.cursor = cursor;
      return apiClient<{ messages: ChatMessage[]; nextCursor: string | null }>(
        `/chat/channels/${channelId}/messages`,
        { params }
      );
    },
    enabled: !!channelId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      channelId,
      text,
      media_url,
      media_type,
    }: {
      channelId: string;
      text?: string;
      media_url?: string;
      media_type?: string;
    }) =>
      apiClient<ChatMessage>(`/chat/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text, media_url, media_type }),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["chat-messages", data.channel_id] });
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
    },
  });
}

export function useEditMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, text, is_deleted }: { messageId: string; text?: string; is_deleted?: boolean }) =>
      apiClient<ChatMessage>(`/chat/messages/${messageId}`, {
        method: "PATCH",
        body: JSON.stringify({ text, is_deleted }),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["chat-messages", data.channel_id] });
    },
  });
}
