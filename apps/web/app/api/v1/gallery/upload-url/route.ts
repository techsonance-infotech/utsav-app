import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../utils";

export async function POST(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

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
