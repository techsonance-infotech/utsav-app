import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create user-scoped client that enforces RLS
export function createRouteHandlerClient(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const tenantId = req.headers.get("x-tenant-id") || "";

  const headers: Record<string, string> = {};
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }
  if (tenantId) {
    headers["x-tenant-id"] = tenantId;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers },
    auth: { persistSession: false },
  });
}

// Create service role client for privileged bypass tasks
export function createServiceRoleClient() {
  if (!supabaseServiceKey) {
    console.warn("WARNING: SUPABASE_SERVICE_ROLE_KEY is missing in environment variables!");
  }
  return createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

// Verify Session and extract User ID from token
export async function verifySession(req: Request): Promise<{ userId: string; error?: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { userId: "", error: "Missing or invalid authorization token" };
  }

  const token = authHeader.split(" ")[1];
  const supabase = createServiceRoleClient(); // Use service role to verify token correctly
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { userId: "", error: error?.message || "Invalid session or expired token" };
  }

  return { userId: user.id };
}

// Check membership role in tenant
export async function checkRole(
  req: Request,
  allowedRoles: string[]
): Promise<{ hasAccess: boolean; userId: string; errorResponse?: NextResponse }> {
  const { userId, error } = await verifySession(req);
  if (error) {
    return {
      hasAccess: false,
      userId: "",
      errorResponse: NextResponse.json({ message: error }, { status: 401 }),
    };
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return {
      hasAccess: false,
      userId,
      errorResponse: NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 }),
    };
  }

  const supabase = createServiceRoleClient();
  const { data: member, error: dbError } = await supabase
    .from("tenant_members")
    .select("role, status")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .single();

  if (dbError || !member || member.status !== "active") {
    return {
      hasAccess: false,
      userId,
      errorResponse: NextResponse.json(
        { message: "Access denied. Inactive or non-member user." },
        { status: 403 }
      ),
    };
  }

  if (!allowedRoles.includes(member.role)) {
    return {
      hasAccess: false,
      userId,
      errorResponse: NextResponse.json(
        { message: "Permission denied. Insufficient role permissions." },
        { status: 403 }
      ),
    };
  }

  return { hasAccess: true, userId };
}

// Standard audit logger helper
export async function logAuditEvent(data: {
  tenantId: string | null;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeData?: any;
  afterData?: any;
}) {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("audit_logs").insert({
      tenant_id: data.tenantId,
      actor_id: data.actorId,
      actor_role: data.actorRole,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      before_data: data.beforeData || null,
      after_data: data.afterData || null,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

const ENCRYPTION_KEY = process.env.VENDOR_BANK_ENCRYPTION_KEY || "a_default_secret_key_of_32_bytes_len!"; // Must be 32 bytes

export function encryptText(text: string): string {
  if (!text) return "";
  const crypto = require("crypto");
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptText(encryptedText: string): string {
  if (!encryptedText) return "";
  try {
    const crypto = require("crypto");
    const parts = encryptedText.split(":");
    const iv = Buffer.from(parts.shift() || "", "hex");
    const encrypted = parts.join(":");
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err);
    return "";
  }
}export async function checkSuperAdmin(
  req: Request
): Promise<{ hasAccess: boolean; userId: string; errorResponse?: NextResponse }> {
  const { userId, error } = await verifySession(req);
  if (error) {
    return {
      hasAccess: false,
      userId: "",
      errorResponse: NextResponse.json({ message: error }, { status: 401 }),
    };
  }

  const supabase = createServiceRoleClient();
  const { data: adminTenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", "admin")
    .single();

  if (!adminTenant) {
    return {
      hasAccess: false,
      userId,
      errorResponse: NextResponse.json({ message: "Super-admin tenant not initialized" }, { status: 403 }),
    };
  }

  const { data: member } = await supabase
    .from("tenant_members")
    .select("role, status")
    .eq("tenant_id", adminTenant.id)
    .eq("user_id", userId)
    .single();

  if (!member || member.status !== "active" || !["owner", "admin"].includes(member.role)) {
    return {
      hasAccess: false,
      userId,
      errorResponse: NextResponse.json({ message: "Access denied. Super-admin role required." }, { status: 403 }),
    };
  }

  return { hasAccess: true, userId };
}
