import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

async function main() {
  console.log("🚀 Starting Supabase Database Seeding...");

  // Load .env.local manually
  const workspaceRoot = process.cwd();
  const envLocalPath = path.join(workspaceRoot, ".env.local");

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (fs.existsSync(envLocalPath)) {
    console.log("Reading environment variables from .env.local...");
    const envContent = fs.readFileSync(envLocalPath, "utf-8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const parts = trimmed.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, ""); // remove outer quotes
        if (key === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = val;
        if (key === "SUPABASE_SERVICE_ROLE_KEY") supabaseServiceKey = val;
      }
    }
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found!");
    console.log("Please ensure you have created a '.env.local' file in the project root with the following fields:");
    console.log("NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co");
    console.log("SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
    process.exit(1);
  }

  console.log(`Connecting to Supabase at: ${supabaseUrl}`);
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // --- 1. Seed Metrics Data ---
  const metricsPath = path.join(workspaceRoot, "lib/data/consolidated_metrics.json");
  if (fs.existsSync(metricsPath)) {
    try {
      const rawMetrics = fs.readFileSync(metricsPath, "utf-8");
      const parsedMetrics = JSON.parse(rawMetrics);
      
      if (parsedMetrics.months) {
        console.log("\nSyncing consolidated metrics to table 'tomeame_metrics'...");
        const monthKeys = Object.keys(parsedMetrics.months);
        for (const monthKey of monthKeys) {
          const monthData = parsedMetrics.months[monthKey];
          const { month_name, ...otherData } = monthData;
          
          const { error } = await supabaseAdmin
            .from("tomeame_metrics")
            .upsert({
              month_key: monthKey,
              month_name: month_name,
              data: otherData,
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            console.error(`❌ Failed to seed month ${monthKey}:`, error.message);
          } else {
            console.log(`✅ Seeded month: ${monthKey} (${month_name})`);
          }
        }
      }
    } catch (err: any) {
      console.error("❌ Failed to parse or seed consolidated metrics:", err.message || err);
    }
  } else {
    console.log("⚠️ consolidated_metrics.json not found. Skipping metrics seeding.");
  }

  // --- 2. Seed Upload History Logs ---
  const historyPath = path.join(workspaceRoot, "lib/data/upload_history.json");
  if (fs.existsSync(historyPath)) {
    try {
      const rawHistory = fs.readFileSync(historyPath, "utf-8");
      const parsedHistory = JSON.parse(rawHistory);
      
      if (parsedHistory.uploads && parsedHistory.uploads.length > 0) {
        console.log(`\nFound ${parsedHistory.uploads.length} upload history logs. Syncing to table 'tomeame_upload_history'...`);
        // Seed logs in chronological order (oldest first) so they display correctly
        const sortedUploads = [...parsedHistory.uploads].reverse();
        for (const upload of sortedUploads) {
          const { error } = await supabaseAdmin
            .from("tomeame_upload_history")
            .upsert({
              id: upload.id,
              timestamp: upload.timestamp,
              platform: upload.platform,
              category: upload.category,
              month: upload.month,
              year: upload.year,
              filename: upload.filename,
              size_bytes: upload.sizeBytes,
              status: upload.status,
              error_message: upload.errorMessage || null,
              uploaded_at: upload.timestamp
            });
          
          if (error) {
            console.error(`❌ Failed to seed upload history row ${upload.id}:`, error.message);
          } else {
            console.log(`✅ Seeded upload history: ${upload.filename} (${upload.status})`);
          }
        }
      }
    } catch (err: any) {
      console.error("❌ Failed to parse or seed upload history:", err.message || err);
    }
  } else {
    console.log("⚠️ upload_history.json not found. Skipping upload history seeding.");
  }

  console.log("\n🎉 Database Seeding completed successfully!");
}

main().catch((err) => {
  console.error("❌ Fatal seeding error:", err);
  process.exit(1);
});
