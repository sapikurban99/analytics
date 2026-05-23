import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const platform = formData.get("platform") as string;
    const category = formData.get("category") as string;
    const month = formData.get("month") as string; // lowercase, e.g. "januari"
    const year = formData.get("year") as string || "2026";

    if (!file || !platform || !category || !month) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Setup folder map & prefix map
    let platformDir = "";
    if (platform.toLowerCase() === "shopee") platformDir = "Shopee";
    else if (platform.toLowerCase() === "tiktok") platformDir = "Tiktok";
    else if (platform.toLowerCase() === "meta") platformDir = "Meta";
    else if (platform.toLowerCase() === "website") platformDir = "Website";
    else {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    let categoryDir = category;
    let filenamePrefix = "";
    let expectedExt = "";

    // Shopee Map
    if (platformDir === "Shopee") {
      if (category === "Shp Ads") {
        categoryDir = "Shp Ads";
        filenamePrefix = "shp ads";
        expectedExt = ".csv";
      } else if (category === "Shp Affiliate") {
        categoryDir = "Shp Affiliate";
        filenamePrefix = "shp affiliate";
        expectedExt = ".xlsx";
      } else if (category === "Shp Overview Metriks") {
        categoryDir = "Shp Overview Metriks "; // Note the space in original folder name
        filenamePrefix = "shp overview metriks";
        expectedExt = ".xlsx";
      } else if (category === "Shp Product Performance") {
        categoryDir = "Shp Product Performance";
        filenamePrefix = "shp product performance";
        expectedExt = ".xlsx";
      } else {
        return NextResponse.json({ error: "Invalid Shopee category" }, { status: 400 });
      }
    }

    // Tiktok Map
    if (platformDir === "Tiktok") {
      if (category === "Tts Gmv Max Live Ads") {
        categoryDir = "Tts Gmv Max Ads";
        filenamePrefix = "tts gmv max live ";
        expectedExt = ".xlsx";
      } else if (category === "Tts Gmv Max Product Ads") {
        categoryDir = "Tts Gmv Max Ads";
        filenamePrefix = "tts gmv max product ";
        expectedExt = ".xlsx";
      } else if (category === "Tts Live Affiliate") {
        categoryDir = "Tts Live Affiliate";
        filenamePrefix = "tts live affiliate";
        expectedExt = ".xlsx";
      } else if (category === "Tts Live Seller") {
        categoryDir = "Tts Live Seller";
        filenamePrefix = "tts live seller";
        expectedExt = ".xlsx";
      } else if (category === "Tts Overview Metriks") {
        categoryDir = "Tts Overview Metriks";
        filenamePrefix = "tts overview";
        expectedExt = ".xlsx";
      } else if (category === "Tts Product Affiliate") {
        categoryDir = "Tts Product Affiliate";
        filenamePrefix = "tts product affiliate ";
        expectedExt = ".xlsx";
      } else if (category === "Tts Product List") {
        categoryDir = "Tts Product List";
        filenamePrefix = "tts product list";
        expectedExt = ".xlsx";
      } else if (category === "Tts Product card Seller") {
        categoryDir = "Tts Product card Seller";
        filenamePrefix = "tts product card";
        expectedExt = ".xlsx";
      } else if (category === "Tts Video Affiliate") {
        categoryDir = "Tts Video Affiliate";
        filenamePrefix = "tts video affiliate";
        expectedExt = ".xlsx";
      } else if (category === "Tts Video Seller") {
        categoryDir = "Tts Video Seller";
        filenamePrefix = "tts video seller";
        expectedExt = ".xlsx";
      } else {
        return NextResponse.json({ error: "Invalid TikTok category" }, { status: 400 });
      }
    }

    // Meta Map
    if (platformDir === "Meta") {
      if (category === "CPAS") {
        categoryDir = "CPAS";
        filenamePrefix = "cpas";
        expectedExt = file.name.endsWith(".csv") ? ".csv" : ".xlsx";
      } else if (category === "Meta Regular") {
        categoryDir = "Meta Regular";
        filenamePrefix = "meta regular";
        expectedExt = file.name.endsWith(".csv") ? ".csv" : ".xlsx";
      } else {
        return NextResponse.json({ error: "Invalid Meta category" }, { status: 400 });
      }
    }

    // Website Map
    if (platformDir === "Website") {
      if (category === "Overview Website") {
        categoryDir = "Overview Website";
        filenamePrefix = "overview website";
        expectedExt = file.name.endsWith(".csv") ? ".csv" : ".xlsx";
      } else {
        return NextResponse.json({ error: "Invalid Website category" }, { status: 400 });
      }
    }

    // File suffix naming logic
    const ext = file.name.endsWith(".csv") ? ".csv" : ".xlsx";
    if (ext !== expectedExt) {
      return NextResponse.json({ error: `Format file tidak sesuai. Kategori ini membutuhkan file ${expectedExt}` }, { status: 400 });
    }

    const monthLower = month.toLowerCase().trim();
    const finalFilename = `${filenamePrefix}_${monthLower} ${year}${ext}`;
    const workspaceRoot = process.cwd();
    const targetDir = path.join(workspaceRoot, "dokumen", platformDir, categoryDir);
    
    // Ensure dir exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFilePath = path.join(targetDir, finalFilename);

    // Save history log helper
    const logUpload = async (status: "Berhasil" | "Gagal", size: number, errorMsg?: string) => {
      const uploadId = `upl_${Date.now()}`;
      const timestamp = new Date().toISOString();
      const monthDisplay = monthLower.charAt(0).toUpperCase() + monthLower.slice(1);

      // Local write (fallback/backup)
      try {
        const historyPath = path.join(workspaceRoot, "lib/data/upload_history.json");
        let historyData = { uploads: [] };
        if (fs.existsSync(historyPath)) {
          const raw = fs.readFileSync(historyPath, "utf-8");
          historyData = JSON.parse(raw);
        }
        
        const newUpload = {
          id: uploadId,
          timestamp,
          platform,
          category,
          month: monthDisplay,
          year,
          filename: finalFilename,
          sizeBytes: size,
          status,
          errorMessage: errorMsg || null
        };
        
        historyData.uploads.unshift(newUpload as never);
        fs.writeFileSync(historyPath, JSON.stringify(historyData, null, 2), "utf-8");
      } catch (err) {
        console.error("Failed to write to local upload history:", err);
      }

      // Supabase write
      if (supabaseAdmin) {
        try {
          const { error } = await supabaseAdmin
            .from("tomeame_upload_history")
            .insert({
              id: uploadId,
              timestamp,
              platform,
              category,
              month: monthDisplay,
              year,
              filename: finalFilename,
              size_bytes: size,
              status,
              error_message: errorMsg || null
            });
          if (error) {
            console.error("Failed to insert upload history to Supabase:", error.message);
          } else {
            console.log("Successfully inserted upload history to Supabase!");
          }
        } catch (err: any) {
          console.error("Error inserting upload history to Supabase:", err.message || err);
        }
      }
    };

    // Keep a backup of the old file if it already exists
    let backupPath = "";
    if (fs.existsSync(targetFilePath)) {
      backupPath = targetFilePath + ".bak";
      fs.copyFileSync(targetFilePath, backupPath);
    }

    // Write file
    fs.writeFileSync(targetFilePath, buffer);

    // Run Python script
    try {
      const scriptPath = path.join(workspaceRoot, "lib/data/consolidate.py");
      const { stdout, stderr } = await execPromise(`python3 "${scriptPath}"`);
      console.log("ETL output:", stdout);
      
      // Cleanup backup if success
      if (backupPath) {
        fs.unlinkSync(backupPath);
      }

      // --- SYNC METRICS JSON TO SUPABASE ---
      if (supabaseAdmin) {
        try {
          const consolidatedPath = path.join(workspaceRoot, "lib/data/consolidated_metrics.json");
          if (fs.existsSync(consolidatedPath)) {
            const rawMetrics = fs.readFileSync(consolidatedPath, "utf-8");
            const parsedMetrics = JSON.parse(rawMetrics);
            
            if (parsedMetrics.months) {
              console.log("Syncing consolidated metrics to Supabase tomeame_metrics...");
              for (const monthKey of Object.keys(parsedMetrics.months)) {
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
                  console.error(`Failed to upsert month ${monthKey} to Supabase:`, error.message);
                } else {
                  console.log(`Successfully synced month ${monthKey} to Supabase!`);
                }
              }
            }
          }
        } catch (syncErr: any) {
          console.error("Failed to sync consolidated metrics to Supabase:", syncErr.message || syncErr);
        }
      }

      await logUpload("Berhasil", buffer.length);
      return NextResponse.json({ success: true, message: "File uploaded and consolidated successfully!" });
    } catch (etlError: any) {
      console.error("ETL execution failed:", etlError);
      
      // Restore backup or delete failed upload
      if (backupPath) {
        fs.copyFileSync(backupPath, targetFilePath);
        fs.unlinkSync(backupPath);
      } else {
        if (fs.existsSync(targetFilePath)) {
          fs.unlinkSync(targetFilePath);
        }
      }

      const errorMsg = etlError.stderr || etlError.message || "Error during data consolidation";
      await logUpload("Gagal", buffer.length, errorMsg);
      return NextResponse.json({ error: "Gagal memproses/mengkonsolidasi data. Pastikan format file Excel/CSV sesuai.", details: errorMsg }, { status: 500 });
    }

  } catch (error: any) {
    console.error("General API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// GET method to fetch upload history
export async function GET() {
  try {
    const workspaceRoot = process.cwd();
    const historyPath = path.join(workspaceRoot, "lib/data/upload_history.json");
    
    // Local fallback
    const getLocalHistory = () => {
      let uploads = [];
      if (fs.existsSync(historyPath)) {
        const raw = fs.readFileSync(historyPath, "utf-8");
        uploads = JSON.parse(raw).uploads || [];
      }
      return uploads;
    };

    // Check if Supabase is configured and query from db
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: rows, error } = await supabase
          .from("tomeame_upload_history")
          .select("id, timestamp, platform, category, month, year, filename, size_bytes, status, error_message")
          .order("timestamp", { ascending: false });

        if (error) {
          console.error("Supabase query error on tomeame_upload_history:", error.message);
          return NextResponse.json({ uploads: getLocalHistory() });
        }

        if (rows && rows.length > 0) {
          const uploads = rows.map((row) => ({
            id: row.id,
            timestamp: row.timestamp,
            platform: row.platform,
            category: row.category,
            month: row.month,
            year: row.year,
            filename: row.filename,
            sizeBytes: Number(row.size_bytes),
            status: row.status,
            errorMessage: row.error_message
          }));
          return NextResponse.json({ uploads });
        }
      } catch (err: any) {
        console.error("Failed to query upload history from Supabase, falling back locally:", err.message || err);
      }
    }

    return NextResponse.json({ uploads: getLocalHistory() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load upload history" }, { status: 500 });
  }
}
