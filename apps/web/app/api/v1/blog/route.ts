import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent, checkRole } from "../utils";
import { z } from "zod";
import { BlogCategorySchema, ContentStatusSchema } from "@utsav/types";

const CreateBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().nullable().optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, dashes, and underscores"),
  body: z.string().min(1, "Body is required"),
  excerpt: z.string().nullable().optional(),
  cover_image_url: z.string().url("Must be a valid URL").nullable().or(z.literal("")).optional(),
  category: BlogCategorySchema.default("other"),
  tags: z.array(z.string()).default([]),
  language: z.string().default("en"),
  status: ContentStatusSchema.default("draft"),
  scheduled_at: z.string().datetime().nullable().optional(),
  estimated_read_mins: z.number().int().positive().nullable().optional(),
  allow_comments: z.boolean().default(false),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  const { error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const includeDrafts = searchParams.get("includeDrafts") === "true";

  const supabase = createServiceRoleClient();

  try {
    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("tenant_id", tenantId);

    if (!includeDrafts) {
      query = query.eq("status", "published");
    }

    const { data: posts, error: dbError } = await query.order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    return NextResponse.json(posts);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const allowedRoles = ["owner", "admin"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();
    const parsed = CreateBlogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const validatedData = parsed.data;

    // Validate scheduled date if status is 'scheduled'
    if (validatedData.status === "scheduled") {
      if (!validatedData.scheduled_at) {
        return NextResponse.json({ message: "Scheduled Date & Time is required for scheduled posts" }, { status: 400 });
      }
      if (new Date(validatedData.scheduled_at) <= new Date()) {
        return NextResponse.json({ message: "Scheduled Date & Time must be in the future" }, { status: 400 });
      }
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const publishDate = validatedData.status === "published" ? new Date().toISOString() : null;
    const scheduledDate =
      validatedData.status === "scheduled" && validatedData.scheduled_at
        ? new Date(validatedData.scheduled_at).toISOString()
        : null;

    const { data: post, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        tenant_id: tenantId,
        author_id: userId,
        title: validatedData.title,
        subtitle: validatedData.subtitle || null,
        slug: validatedData.slug,
        body: validatedData.body,
        excerpt: validatedData.excerpt || null,
        cover_image_url: validatedData.cover_image_url || null,
        category: validatedData.category,
        tags: validatedData.tags,
        language: validatedData.language,
        status: validatedData.status,
        scheduled_at: scheduledDate,
        published_at: publishDate,
        estimated_read_mins: validatedData.estimated_read_mins || null,
        allow_comments: validatedData.allow_comments,
        meta_title: validatedData.meta_title || null,
        meta_description: validatedData.meta_description || null,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ message: "A blog post with this URL slug already exists." }, { status: 409 });
      }
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }

    if (!post) {
      return NextResponse.json({ message: "Failed to create blog post" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "admin",
      action: "blog_post_create",
      entityType: "blog_post",
      entityId: post.id,
      afterData: post,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

