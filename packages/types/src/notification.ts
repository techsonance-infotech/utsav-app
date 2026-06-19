import { z } from "zod";

export const NotificationTypeSchema = z.enum([
  "donation_received",
  "expense_submitted",
  "expense_status_change",
  "event_reminder",
  "volunteer_duty_assigned",
  "general_broadcast"
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string().min(1),
  title_hi: z.string().nullable().optional(),
  title_gu: z.string().nullable().optional(),
  body: z.string().min(1),
  body_hi: z.string().nullable().optional(),
  body_gu: z.string().nullable().optional(),
  is_read: z.boolean().default(false),
  read_at: z.string().datetime().nullable().optional(),
  deep_link: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  created_at: z.string().datetime(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const PushTokenSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  token: z.string().min(1),
  device_type: z.enum(["ios", "android"]),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type PushToken = z.infer<typeof PushTokenSchema>;
