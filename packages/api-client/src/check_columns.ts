import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local manually
const envPath = path.resolve(__dirname, "../../../apps/web/.env.local");
const envContent = fs.readFileSync(envPath, "utf8");

const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Testing insert with banner_image_url...");
  const testDuty = {
    tenant_id: "00000000-0000-0000-0000-000000000000", // Will fail RLS/FK, but let's check validation first
    title: "Test Column",
    duty_type: "other",
    start_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000000",
    banner_image_url: "https://example.com/test.jpg"
  };

  const { data, error } = await supabase
    .from("volunteer_duties")
    .insert(testDuty as any)
    .select();

  if (error) {
    console.log("Error response code:", error.code);
    console.log("Error message:", error.message);
  } else {
    console.log("Success inserting! Data:", data);
  }
}

run();
