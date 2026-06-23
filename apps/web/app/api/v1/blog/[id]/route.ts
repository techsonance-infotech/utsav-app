import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient, logAuditEvent, checkRole } from "../../utils";
import { z } from "zod";
import { BlogCategorySchema, ContentStatusSchema } from "@utsav/types";

const UpdateBlogSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  subtitle: z.string().nullable().optional(),
  slug: z
    .string()
    .min(1, "Slug cannot be empty")
    .regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, dashes, and underscores")
    .optional(),
  body: z.string().min(1, "Body cannot be empty").optional(),
  excerpt: z.string().nullable().optional(),
  cover_image_url: z.string().url("Must be a valid URL").nullable().or(z.literal("")).optional(),
  category: BlogCategorySchema.optional(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
  status: ContentStatusSchema.optional(),
  scheduled_at: z.string().datetime().nullable().optional(),
  estimated_read_mins: z.number().int().positive().nullable().optional(),
  allow_comments: z.boolean().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const postId = params.id;
  if (!postId) {
    return NextResponse.json({ message: "Missing blog post ID" }, { status: 400 });
  }

  const { error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    const { data: post, error: dbError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .single();

    if (dbError || !post) {
      return NextResponse.json({ message: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const postId = params.id;
  if (!postId) {
    return NextResponse.json({ message: "Missing blog post ID" }, { status: 400 });
  }

  const allowedRoles = ["owner", "admin"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const body = await req.json();
    const parsed = UpdateBlogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const validatedData = parsed.data as any;

    const { data: existing, error: fetchError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Blog post not found" }, { status: 404 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    const allowedFields = [
      "title", "subtitle", "slug", "body", "excerpt", "cover_image_url",
      "category", "tags", "language", "status", "estimated_read_mins",
      "allow_comments", "meta_title", "meta_description", "scheduled_at"
    ];

    for (const field of allowedFields) {
      if (validatedData[field] !== undefined) {
        updatePayload[field] = validatedData[field];
      }
    }

    if (updatePayload.cover_image_url === "") {
      updatePayload.cover_image_url = null;
    }

    // Handle status & date transitions
    const finalStatus = validatedData.status || existing.status;

    if (finalStatus === "published") {
      if (existing.status !== "published") {
        updatePayload.published_at = new Date().toISOString();
      }
      updatePayload.scheduled_at = null;
    } else if (finalStatus === "scheduled") {
      const targetScheduledAt = validatedData.scheduled_at !== undefined ? validatedData.scheduled_at : existing.scheduled_at;
      if (!targetScheduledAt) {
        return NextResponse.json({ message: "Scheduled Date & Time is required for scheduled posts" }, { status: 400 });
      }
      if (new Date(targetScheduledAt) <= new Date()) {
        return NextResponse.json({ message: "Scheduled Date & Time must be in the future" }, { status: 400 });
      }
      updatePayload.scheduled_at = new Date(targetScheduledAt).toISOString();
      updatePayload.published_at = null;
    } else if (finalStatus === "draft" || finalStatus === "archived") {
      updatePayload.scheduled_at = null;
      updatePayload.published_at = null;
    }

    const { data: updated, error: updateError } = await supabase
      .from("blog_posts")
      .update(updatePayload)
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "23505") {
        return NextResponse.json({ message: "A blog post with this URL slug already exists." }, { status: 409 });
      }
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json({ message: "Failed to update blog post" }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "admin",
      action: "blog_post_update",
      entityType: "blog_post",
      entityId: postId,
      beforeData: existing,
      afterData: updated,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const postId = params.id;
  if (!postId) {
    return NextResponse.json({ message: "Missing blog post ID" }, { status: 400 });
  }

  const allowedRoles = ["owner", "admin"];
  const { hasAccess, userId, errorResponse } = await checkRole(req, allowedRoles);
  if (!hasAccess && errorResponse) {
    return errorResponse;
  }

  const tenantId = req.headers.get("x-tenant-id")!;
  const supabase = createServiceRoleClient();

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Blog post not found" }, { status: 404 });
    }

    const { data: actorMember } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", postId)
      .eq("tenant_id", tenantId);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 500 });
    }

    await logAuditEvent({
      tenantId,
      actorId: userId,
      actorRole: actorMember?.role || "admin",
      action: "blog_post_delete",
      entityType: "blog_post",
      entityId: postId,
      beforeData: existing,
    });

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}


