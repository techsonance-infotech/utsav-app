import { NextResponse } from "next/server";
import { checkRole, createServiceRoleClient } from "../../utils";

export async function POST(req: Request) {
  const { hasAccess, userId, errorResponse } = await checkRole(req, ["owner", "admin", "treasurer", "committee_member"]);
  if (!hasAccess) return errorResponse!;

  const tenantId = req.headers.get("x-tenant-id")!;

  try {
    const body = await req.json();
    const { filename, content_type, bucket = "receipts" } = body;

    if (!filename || !content_type) {
      return NextResponse.json({ message: "filename and content_type are required" }, { status: 400 });
    }

    // Validate allowed buckets
    const allowedBuckets = ["receipts", "gallery", "avatars", "vendor-docs"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ message: "Invalid bucket" }, { status: 400 });
    }

    // Validate file extensions and content-types to prevent unsafe uploads
    const extension = filename.split(".").pop()?.toLowerCase();
    const allowedExtensions: Record<string, string[]> = {
      avatars: ["jpg", "jpeg", "png", "webp"],
      gallery: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov"],
      receipts: ["jpg", "jpeg", "png", "pdf"],
      "vendor-docs": ["jpg", "jpeg", "png", "pdf", "docx", "xlsx"],
    };

    const allowedContentTypes: Record<string, string[]> = {
      avatars: ["image/jpeg", "image/png", "image/webp"],
      gallery: ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime"],
      receipts: ["image/jpeg", "image/png", "application/pdf"],
      "vendor-docs": [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    };

    if (!extension || !allowedExtensions[bucket]?.includes(extension)) {
      return NextResponse.json({ message: `File extension .${extension} not allowed for bucket ${bucket}` }, { status: 400 });
    }

    if (!allowedContentTypes[bucket]?.includes(content_type)) {
      return NextResponse.json({ message: `Content-type ${content_type} not allowed for bucket ${bucket}` }, { status: 400 });
    }

    // Generate a unique path
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${tenantId}/${userId}/${timestamp}_${safeName}`;

    const supabase = createServiceRoleClient();

    // Create a signed upload URL using Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);

    if (uploadError || !data) {
      return NextResponse.json({ message: uploadError?.message || "Failed to create upload URL" }, { status: 500 });
    }

    // Also create a signed download URL (7-day expiry for private buckets)
    const { data: downloadData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 7 * 24 * 60 * 60); // 7 days in seconds

    return NextResponse.json({
      upload_url: data.signedUrl,
      token: data.token,
      file_path: filePath,
      download_url: downloadData?.signedUrl || null,
      bucket,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
