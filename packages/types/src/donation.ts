import { z } from "zod";

export const DonationModeSchema = z.enum([
  "online",
  "cash",
  "cheque",
  "bank_transfer",
  "in_kind"
]);
export type DonationMode = z.infer<typeof DonationModeSchema>;

export const DonationStatusSchema = z.enum([
  "pending",
  "confirmed",
  "failed",
  "refunded"
]);
export type DonationStatus = z.infer<typeof DonationStatusSchema>;

export const DonationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  campaign_id: z.string().uuid().nullable().optional(),
  donor_id: z.string().uuid().nullable().optional(),
  recorded_by: z.string().uuid().nullable().optional(),
  donor_name: z.string().min(1, "Donor name is required"),
  donor_phone: z.string().nullable().optional(),
  donor_email: z.string().email().nullable().optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  mode: DonationModeSchema.default("online"),
  status: DonationStatusSchema.default("pending"),
  receipt_number: z.string().nullable().optional(),
  is_anonymous: z.boolean().default(false),
  is_in_kind: z.boolean().default(false),
  in_kind_description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  razorpay_order_id: z.string().nullable().optional(),
  razorpay_payment_id: z.string().nullable().optional(),
  razorpay_signature: z.string().nullable().optional(),
  paid_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Donation = z.infer<typeof DonationSchema>;

export const CreateDonationSchema = DonationSchema.pick({
  campaign_id: true,
  donor_name: true,
  donor_phone: true,
  donor_email: true,
  amount: true,
  mode: true,
  is_anonymous: true,
  note: true,
});
export type CreateDonationInput = z.infer<typeof CreateDonationSchema>;

export const DonationCampaignSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().nullable().optional(),
  target_amount: z.number().positive().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  is_public: z.boolean().default(true),
  cover_image_url: z.string().url().nullable().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type DonationCampaign = z.infer<typeof DonationCampaignSchema>;
