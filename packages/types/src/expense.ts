import { z } from "zod";

export const ExpenseStatusSchema = z.enum([
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "paid"
]);
export type ExpenseStatus = z.infer<typeof ExpenseStatusSchema>;

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  invoice_id: z.string().uuid().nullable().optional(),
  submitted_by: z.string().uuid(),
  approved_by: z.string().uuid().nullable().optional(),
  rejected_by: z.string().uuid().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  status: ExpenseStatusSchema.default("draft"),
  payment_mode: z.enum(["cash", "bank_transfer", "upi", "cheque"]).nullable().optional(),
  receipt_url: z.string().nullable().optional(),
  gst_amount: z.number().default(0),
  review_note: z.string().nullable().optional(),
  expense_date: z.string(),
  approved_at: z.string().datetime().nullable().optional(),
  rejected_at: z.string().datetime().nullable().optional(),
  paid_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Expense = z.infer<typeof ExpenseSchema>;

export const CreateExpenseSchema = ExpenseSchema.pick({
  category_id: true,
  vendor_id: true,
  invoice_id: true,
  title: true,
  description: true,
  amount: true,
  payment_mode: true,
  receipt_url: true,
  gst_amount: true,
  expense_date: true,
});
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

export const ExpenseCategorySchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1, "Category name is required"),
  name_hi: z.string().nullable().optional(),
  name_gu: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  budget: z.number().positive().nullable().optional(),
  color: z.string().default("#FF9500"),
  sort_order: z.number().default(0),
  created_at: z.string().datetime(),
});
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;
