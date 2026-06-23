import { z } from "zod";

export const ChannelTypeSchema = z.enum([
  "broadcast",
  "department",
  "event",
  "direct"
]);
export type ChannelType = z.infer<typeof ChannelTypeSchema>;

export const ChatChannelSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  name: z.string().min(1, "Channel name is required"),
  description: z.string().nullable().optional(),
  type: ChannelTypeSchema.default("department"),
  is_active: z.boolean().default(true),
  last_message_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type ChatChannel = z.infer<typeof ChatChannelSchema>;

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  channel_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  content: z.string().max(2000, "Message must be under 2000 characters").nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  document_url: z.string().url().nullable().optional(),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}).refine(
  (data) => data.content || data.image_url || data.document_url,
  "Message must contain content, an image, or a document"
);
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const SendMessageSchema = z.object({
  content: z.string().max(2000).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  document_url: z.string().url().nullable().optional(),
}).refine(
  (data) => data.content?.trim() || data.image_url || data.document_url,
  "Message cannot be empty"
);
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
