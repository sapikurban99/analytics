import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { aggregateAllMonths, upsertMetricsToSupabase } from "@/lib/data/aggregate";

const execPromise = promisify(exec);

const MONTH_NAMES_ID = [
  "januari", "februari", "maret", "april", "mei", "juni",
  "juli", "agustus", "september", "oktober", "november", "desember",
];

async function processFile(filePath: string, workspaceRoot: string) {
  const scriptPath = path.join(workspaceRoot, "lib/data/process_file.py");
  const { stdout } = await execPromise(`python3 "${scriptPath}" "${filePath}"`, {
    maxBuffer: 10 * 1024 * 1024,
    timeout: 30000,
  });
  return JSON.parse(stdout);
}

function detectMonthFromFilename(filename: string): { month: string; year: string } | null {
  const lower = filename.toLowerCase();

  for (const m of MONTH_NAMES_ID) {
    const re = new RegExp(`${m}\\s*(202\\d)`);
    const match = lower.match(re);
    if (match) {
      return { month: m, year: match[1] };
    }
  }
  for (const m of MONTH_NAMES_ID) {
    const re = new RegExp(`${m}(202\\d)`);
    const match = lower.match(re);
    if (match) {
      return { month: m, year: match[1] };
    }
  }

  const rangeMatch = lower.match(/\((\d{4})-(\d{2})\d*-\d+\s*-\s*\d{4}-\d{2}\d*-\d+\)/);
  if (rangeMatch) {
    const year = rangeMatch[1];
    const monthNum = rangeMatch[2];
    const monthsMapRev: Record<string, string> = {
      "01": "januari", "02": "februari", "03": "maret", "04": "april",
      "05": "mei", "06": "juni", "07": "juli", "08": "agustus",
      "09": "september", "10": "oktober", "11": "november", "12": "desember"
    };
    const month = monthsMapRev[monthNum];
    if (month) {
      return { month, year };
    }
  }

  return null;
}

async function logUploadHistory(
  platform: string,
  category: string,
  month: string,
  year: string,
  filename: string,
  size: number,
  status: "Berhasil" | "Gagal",
  errorMsg?: string
) {
  const uploadId = `upl_${Date.now()}`;
  const timestamp = new Date().toISOString();
  const monthDisplay = month.charAt(0).toUpperCase() + month.slice(1);

  try {
    const workspaceRoot = process.cwd();
    const historyPath = path.join(workspaceRoot, "lib/data/upload_history.json");
    let historyData: any = { uploads: [] };
    if (fs.existsSync(historyPath)) {
      historyData = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
    }
    historyData.uploads.unshift({
      id: uploadId, timestamp, platform, category, month: monthDisplay,
      year, filename, sizeBytes: size, status,
      errorMessage: errorMsg || null
    });
    fs.writeFileSync(historyPath, JSON.stringify(historyData, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local upload history:", err);
  }

  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from("tomeame_upload_history").insert({
        id: uploadId, timestamp, platform, category, month: monthDisplay,
        year, filename, size_bytes: size, status,
        error_message: errorMsg || null
      });
    } catch (err: any) {
      console.error("Error inserting to Supabase:", err.message || err);
    }
  }
}

export async function POST(req: NextRequest) {
  let tmpPath = "";

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workspaceRoot = process.cwd();

    const tmpDir = path.join(workspaceRoot, "dokumen", "_tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    tmpPath = path.join(tmpDir, file.name);
    fs.writeFileSync(tmpPath, buffer);

    let results: any[];
    try {
      const raw = await processFile(tmpPath, workspaceRoot);
      // process_file.py now returns an array (multi-month split) or single-object array
      results = Array.isArray(raw) ? raw : [raw];
    } catch (procErr: any) {
      console.error("process_file.py failed:", procErr.stderr || procErr.message);
      const errorMsg = procErr.stderr || procErr.message || "Gagal memproses file";
      await logUploadHistory("", "", "", "", file.name, buffer.length, "Gagal", errorMsg);
      return NextResponse.json({
        error: "Gagal memproses file. Pastikan format file sesuai.",
        details: errorMsg
      }, { status: 500 });
    }

    if (results.length === 0 || results[0].error) {
      const errMsg = results[0]?.error || "Unknown error";
      await logUploadHistory("", "", "", "", file.name, buffer.length, "Gagal", errMsg);
      return NextResponse.json({
        error: "Gagal mendeteksi dokumen. Pastikan nama file sesuai format.",
        details: errMsg
      }, { status: 400 });
    }

    let insertedCount = 0;
    for (const result of results) {
      const { platform, category, data_type, month_key, month_name, filename, size_bytes, data } = result;

      if (supabaseAdmin) {
        const { error: insertErr } = await supabaseAdmin.from("tomeame_file_data").insert({
          platform,
          category,
          data_type,
          month_key,
          month_name,
          filename,
          data,
          size_bytes,
          uploaded_at: new Date().toISOString(),
          status: "berhasil",
        });

        if (insertErr) {
          console.error(`Failed to insert file_data for ${month_key}:`, insertErr.message);
          continue;
        }
      }
      insertedCount++;
    }

    if (insertedCount === 0) {
      return NextResponse.json({
        error: "Gagal menyimpan data ke database.",
        details: "No rows inserted"
      }, { status: 500 });
    }

    if (supabaseAdmin) {
      try {
        const months = await aggregateAllMonths();
        if (months) {
          await upsertMetricsToSupabase(months);
        }
      } catch (aggErr: any) {
        console.error("Aggregation failed:", aggErr.message || aggErr);
      }
    }

    const firstResult = results[0];
    try {
      const monthYear = detectMonthFromFilename(firstResult.filename) ||
        { month: firstResult.month_name.toLowerCase(), year: firstResult.month_key.split("-")[0] };
      await logUploadHistory(
        firstResult.platform, firstResult.category,
        monthYear.month, monthYear.year,
        firstResult.filename, firstResult.size_bytes, "Berhasil"
      );
    } catch (logErr) {
      console.error("Upload history logging failed:", logErr);
    }

    return NextResponse.json({
      success: true,
      detected: {
        platform: firstResult.platform,
        category: firstResult.category,
        data_type: firstResult.data_type,
      },
      months: results.map(r => ({ month_key: r.month_key, month_name: r.month_name })),
      message: insertedCount > 1
        ? `File di-split ke ${insertedCount} bulan dan disimpan ke database!`
        : "File processed and synced to database!",
    });
  } catch (error: any) {
    console.error("General API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  } finally {
    if (tmpPath && fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath); } catch (_) {}
    }
  }
}

export async function GET() {
  try {
    const workspaceroot = process.cwd();
    const historyPath = path.join(workspaceroot, "lib/data/upload_history.json");

    const getLocalHistory = () => {
      let uploads: any[] = [];
      if (fs.existsSync(historyPath)) {
        uploads = JSON.parse(fs.readFileSync(historyPath, "utf-8")).uploads || [];
      }
      return uploads;
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: rows, error } = await supabase
          .from("tomeame_upload_history")
          .select("id, timestamp, platform, category, month, year, filename, size_bytes, status, error_message")
          .order("timestamp", { ascending: false });

        if (!error && rows && rows.length > 0) {
          return NextResponse.json({
            uploads: rows.map((row: any) => ({
              id: row.id, timestamp: row.timestamp, platform: row.platform,
              category: row.category, month: row.month, year: row.year,
              filename: row.filename, sizeBytes: Number(row.size_bytes),
              status: row.status, errorMessage: row.error_message
            }))
          });
        }
      } catch (err: any) {
        console.error("Supabase query error:", err.message || err);
      }
    }

    return NextResponse.json({ uploads: getLocalHistory() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load upload history" }, { status: 500 });
  }
}
