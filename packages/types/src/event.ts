import { z } from "zod";

export const EventCategorySchema = z.enum([
  "puja",
  "cultural",
  "sports",
  "aarti",
  "prasad_vitran",
  "volunteer_duty",
  "meeting",
  "visarjan",
  "general"
]);
export type EventCategory = z.infer<typeof EventCategorySchema>;

export const EventStatusSchema = z.enum([
  "draft",
  "published",
  "cancelled",
  "completed"
]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const RSVPStatusSchema = z.enum([
  "attending",
  "maybe",
  "not_attending"
]);
export type RSVPStatus = z.infer<typeof RSVPStatusSchema>;

export const DutyTypeSchema = z.enum([
  "entry_management",
  "crowd_control",
  "prasad_distribution",
  "decoration",
  "parking",
  "first_aid",
  "registration_desk",
  "photo_video",
  "other"
]);
export type DutyType = z.infer<typeof DutyTypeSchema>;

export const EventSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  title_hi: z.string().nullable().optional(),
  title_gu: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category: EventCategorySchema.default("general"),
  start_at: z.string().datetime(),
  end_at: z.string().datetime().nullable().optional(),
  location_name: z.string().nullable().optional(),
  location_maps_url: z.string().url().nullable().optional(),
  banner_image_url: z.string().url().nullable().optional(),
  status: EventStatusSchema.default("draft"),
  max_capacity: z.number().int().positive().nullable().optional(),
  rsvp_required: z.boolean().default(false),
  rsvp_deadline: z.string().datetime().nullable().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.string().nullable().optional(),
  organiser_id: z.string().uuid().nullable().optional(),
  language: z.string().default("en"),
  tags: z.array(z.string()).default([]),
  volunteer_slots_count: z.number().int().default(0),
  reminder_sent_24h: z.boolean().default(false),
  reminder_sent_1h: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Event = z.infer<typeof EventSchema>;

export const CreateEventSchema = EventSchema.pick({
  title: true,
  title_hi: true,
  title_gu: true,
  description: true,
  category: true,
  start_at: true,
  end_at: true,
  location_name: true,
  location_maps_url: true,
  banner_image_url: true,
  max_capacity: true,
  rsvp_required: true,
  rsvp_deadline: true,
  organiser_id: true,
  tags: true,
});
export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const EventRSVPSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: RSVPStatusSchema.default("attending"),
  checked_in: z.boolean().default(false),
  checked_in_at: z.string().datetime().nullable().optional(),
  note: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type EventRSVP = z.infer<typeof EventRSVPSchema>;

export const VolunteerDutySchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_id: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  created_by: z.string().uuid(),
  duty_type: DutyTypeSchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime().nullable().optional(),
  max_volunteers: z.number().int().default(1),
  status: z.enum(["open", "assigned", "completed"]).default("open"),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type VolunteerDuty = z.infer<typeof VolunteerDutySchema>;
