import { z } from "zod";

export const TenantVerticalSchema = z.enum([
  "ganpati",
  "temple",
  "navratri",
  "diwali",
  "trust",
  "cultural",
  "other"
]);
export type TenantVertical = z.infer<typeof TenantVerticalSchema>;

export const TenantPlanSchema = z.enum(["free", "mandal", "premium", "enterprise"]);
export type TenantPlan = z.infer<typeof TenantPlanSchema>;

export const TenantRoleSchema = z.enum([
  "owner",
  "admin",
  "treasurer",
  "committee_member",
  "volunteer",
  "member",
  "vendor"
]);
export type TenantRole = z.infer<typeof TenantRoleSchema>;

export const TenantStatusSchema = z.enum(["active", "inactive", "suspended"]);
export type TenantStatus = z.infer<typeof TenantStatusSchema>;

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be url-safe"),
  vertical: TenantVerticalSchema.default("ganpati"),
  plan: TenantPlanSchema.default("free"),
  logo_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#FF9500"),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  default_language: z.enum(["en", "hi", "gu"]).default("en"),
  is_public_donations: z.boolean().default(true),
  is_public_expenses: z.boolean().default(false),
  is_active: z.boolean().default(true),
  razorpay_key_id: z.string().nullable().optional(),
  whatsapp_group_url: z.string().nullable().optional(),
  founded_year: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  facebook_url: z.string().nullable().optional(),
  instagram_url: z.string().nullable().optional(),
  country: z.string().default("IN"),
  timezone: z.string().default("Asia/Kolkata"),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Tenant = z.infer<typeof TenantSchema>;

export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;

export const TenantMemberSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: TenantRoleSchema.default("member"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  membership_type: z.enum(["life", "annual", "volunteer_only"]).default("annual"),
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  preferred_language: z.enum(["en", "hi", "gu"]).default("en"),
  dnd_start_time: z.string().nullable().optional(),
  dnd_end_time: z.string().nullable().optional(),
  joined_at: z.string().datetime(),
  last_seen_at: z.string().datetime().nullable().optional(),
});
export type TenantMember = z.infer<typeof TenantMemberSchema>;

export const InvitationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  role: TenantRoleSchema.default("member"),
  token: z.string(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  invitee_name: z.string().nullable().optional(),
  expires_at: z.string().datetime(),
  used_at: z.string().datetime().nullable().optional(),
  used_by: z.string().uuid().nullable().optional(),
  is_bulk: z.boolean().default(false),
  created_at: z.string().datetime(),
});
export type Invitation = z.infer<typeof InvitationSchema>;
