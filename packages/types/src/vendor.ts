import { z } from "zod";

export const VendorCategorySchema = z.enum([
  "decoration",
  "sound_lighting",
  "catering",
  "transport",
  "photography",
  "pandal_construction",
  "idol_supply",
  "printing",
  "other"
]);
export type VendorCategory = z.infer<typeof VendorCategorySchema>;

export const VendorStatusSchema = z.enum([
  "prospect",
  "approved",
  "active",
  "blacklisted"
]);
export type VendorStatus = z.infer<typeof VendorStatusSchema>;

export const POStatusSchema = z.enum([
  "draft",
  "sent",
  "accepted",
  "in_progress",
  "completed",
  "disputed",
  "cancelled"
]);
export type POStatus = z.infer<typeof POStatusSchema>;

export const InvoiceStatusSchema = z.enum([
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "paid"
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const VendorSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  linked_user_id: z.string().uuid().nullable().optional(),
  business_name: z.string().min(1, "Business name is required"),
  contact_person: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  gst_number: z.string().nullable().optional(),
  category: VendorCategorySchema.default("other"),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  bank_account_encrypted: z.instanceof(Uint8Array).or(z.string()).nullable().optional(), // encrypted binary
  rating: z.number().min(1).max(5).nullable().optional(),
  status: VendorStatusSchema.default("prospect"),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Vendor = z.infer<typeof VendorSchema>;

export const CreateVendorSchema = VendorSchema.pick({
  business_name: true,
  contact_person: true,
  phone: true,
  email: true,
  gst_number: true,
  category: true,
  address: true,
  city: true,
  state: true,
  notes: true,
});
export type CreateVendorInput = z.infer<typeof CreateVendorSchema>;

export const POLineItemSchema = z.object({
  description: z.string().min(1),
  qty: z.number().positive(),
  unit_price: z.number().nonnegative(),
  total: z.number().nonnegative(),
});
export type POLineItem = z.infer<typeof POLineItemSchema>;

export const PurchaseOrderSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  created_by: z.string().uuid(),
  po_number: z.string(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  line_items: z.array(POLineItemSchema).default([]),
  subtotal: z.number().nonnegative(),
  gst_amount: z.number().nonnegative().default(0),
  total_amount: z.number().nonnegative(),
  delivery_date: z.string().nullable().optional(),
  terms: z.string().nullable().optional(),
  status: POStatusSchema.default("draft"),
  pdf_url: z.string().nullable().optional(),
  sent_at: z.string().datetime().nullable().optional(),
  accepted_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;

export const VendorInvoiceSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  po_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid(),
  reviewed_by: z.string().uuid().nullable().optional(),
  invoice_number: z.string().min(1),
  invoice_date: z.string(),
  due_date: z.string().nullable().optional(),
  line_items: z.array(POLineItemSchema).default([]),
  subtotal: z.number().nonnegative(),
  gst_amount: z.number().nonnegative().default(0),
  total_amount: z.number().nonnegative(),
  document_url: z.string().nullable().optional(),
  status: InvoiceStatusSchema.default("submitted"),
  review_note: z.string().nullable().optional(),
  paid_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type VendorInvoice = z.infer<typeof VendorInvoiceSchema>;
