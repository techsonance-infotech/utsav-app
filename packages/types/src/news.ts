import { z } from "zod";

export const ContentStatusSchema = z.enum([
  "draft",
  "scheduled",
  "published",
  "archived"
]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const NewsCategorySchema = z.enum([
  "festival_update",
  "announcement",
  "achievement",
  "press",
  "charity",
  "general"
]);
export type NewsCategory = z.infer<typeof NewsCategorySchema>;

export const BlogCategorySchema = z.enum([
  "festival_story",
  "tradition_culture",
  "volunteer_voice",
  "committee_update",
  "recipe",
  "other"
]);
export type BlogCategory = z.infer<typeof BlogCategorySchema>;

export const NewsArticleSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  author_id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  title_hi: z.string().nullable().optional(),
  title_gu: z.string().nullable().optional(),
  body: z.string().min(1, "Body is required"),
  body_hi: z.string().nullable().optional(),
  body_gu: z.string().nullable().optional(),
  excerpt: z.string().nullable().optional(),
  category: NewsCategorySchema.default("general"),
  language: z.string().default("en"),
  banner_image_url: z.string().url().nullable().optional(),
  tags: z.array(z.string()).default([]),
  status: ContentStatusSchema.default("draft"),
  scheduled_at: z.string().datetime().nullable().optional(),
  published_at: z.string().datetime().nullable().optional(),
  allow_comments: z.boolean().default(false),
  read_count: z.number().int().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

export const BlogPostSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  author_id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().nullable().optional(),
  slug: z.string().min(1),
  body: z.string().min(1, "Body is required"),
  excerpt: z.string().nullable().optional(),
  cover_image_url: z.string().url().nullable().optional(),
  category: BlogCategorySchema.default("other"),
  tags: z.array(z.string()).default([]),
  language: z.string().default("en"),
  status: ContentStatusSchema.default("draft"),
  scheduled_at: z.string().datetime().nullable().optional(),
  published_at: z.string().datetime().nullable().optional(),
  estimated_read_mins: z.number().int().positive().nullable().optional(),
  allow_comments: z.boolean().default(false),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;
