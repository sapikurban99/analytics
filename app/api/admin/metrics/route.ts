import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";

const execPromise = promisify(exec);

// Helper function to recursively find and delete spreadsheets matching month and year
function deleteMonthFiles(dirPath: string, monthNameLower: string, year: string) {
  if (!fs.existsSync(dirPath)) return;
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      deleteMonthFiles(fullPath, monthNameLower, year);
    } else {
      const nameLower = item.toLowerCase();
      // Match both the month name (e.g. "januari") and the year (e.g. "2026")
      if (nameLower.includes(monthNameLower) && nameLower.includes(year)) {
        console.log(`[Admin API] Deleting matching spreadsheet: ${fullPath}`);
        fs.unlinkSync(fullPath);
      }
    }
  }
}

// GET: Retrieve a list of all consolidated months (from Supabase or local fallback)
export async function GET() {
  const workspaceRoot = process.cwd();
  const fallbackJsonPath = path.join(workspaceRoot, "lib/data/consolidated_metrics.json");

  const getLocalFallback = () => {
    try {
      if (fs.existsSync(fallbackJsonPath)) {
        const raw = fs.readFileSync(fallbackJsonPath, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("[Admin API] Failed to read local fallback metrics JSON:", err);
    }
    return { months: {} };
  };

  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    console.log("[Admin API] Supabase Admin is not configured. Serving local static months.");
    return NextResponse.json(getLocalFallback());
  }

  try {
    const { data: rows, error } = await supabaseAdmin
      .from("tomeame_metrics")
      .select("month_key, month_name, data, updated_at")
      .order("month_key", { ascending: true });

    if (error) {
      console.error("[Admin API] Supabase query error on tomeame_metrics:", error.message);
      return NextResponse.json(getLocalFallback());
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json(getLocalFallback());
    }

    const formattedData: { months: Record<string, any> } = { months: {} };
    for (const row of rows) {
      formattedData.months[row.month_key] = {
        month_name: row.month_name,
        ...row.data,
      };
    }
    return NextResponse.json(formattedData);
  } catch (err: any) {
    console.error("[Admin API] General error in GET /api/admin/metrics:", err.message || err);
    return NextResponse.json(getLocalFallback());
  }
}

// PUT: Rename a month
export async function PUT(req: NextRequest) {
  try {
    const { monthKey, newMonthName } = await req.json();

    if (!monthKey || !newMonthName) {
      return NextResponse.json({ error: "Missing monthKey or newMonthName" }, { status: 400 });
    }

    const workspaceRoot = process.cwd();
    const consolidatedPath = path.join(workspaceRoot, "lib/data/consolidated_metrics.json");

    // 1. Update the local consolidated_metrics.json fallback file
    let updatedLocal = false;
    try {
      if (fs.existsSync(consolidatedPath)) {
        const raw = fs.readFileSync(consolidatedPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.months && parsed.months[monthKey]) {
          parsed.months[monthKey].month_name = newMonthName;
          fs.writeFileSync(consolidatedPath, JSON.stringify(parsed, null, 2), "utf-8");
          updatedLocal = true;
          console.log(`[Admin API] Updated local month name for key ${monthKey} to ${newMonthName}`);
        }
      }
    } catch (localErr: any) {
      console.error("[Admin API] Failed to update local month name fallback:", localErr.message);
    }

    // 2. Update Supabase
    if (isSupabaseAdminConfigured() && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("tomeame_metrics")
        .update({ month_name: newMonthName, updated_at: new Date().toISOString() })
        .eq("month_key", monthKey);

      if (error) {
        console.error(`[Admin API] Failed to update month name in Supabase for key ${monthKey}:`, error.message);
        return NextResponse.json({ error: "Gagal memperbarui di database Supabase: " + error.message }, { status: 500 });
      }
      console.log(`[Admin API] Successfully updated Supabase month name for key ${monthKey} to ${newMonthName}`);
      return NextResponse.json({ success: true, message: `Bulan berhasil diubah namanya menjadi ${newMonthName}!` });
    }

    if (updatedLocal) {
      return NextResponse.json({ success: true, message: `Bulan berhasil diubah namanya di file lokal menjadi ${newMonthName}!` });
    }

    return NextResponse.json({ error: "Month not found" }, { status: 404 });
  } catch (err: any) {
    console.error("[Admin API] PUT error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a month record, physical spreadsheets, and rebuild metrics
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthKey = searchParams.get("monthKey");

    if (!monthKey) {
      return NextResponse.json({ error: "Missing monthKey query parameter" }, { status: 400 });
    }

    const workspaceRoot = process.cwd();
    const consolidatedPath = path.join(workspaceRoot, "lib/data/consolidated_metrics.json");

    // 1. Identify the month name in lowercase (e.g. "januari") and year (e.g. "2026")
    let monthNameLower = "";
    const year = monthKey.split("-")[0] || "2026";

    // Try reading from local file first to resolve month name
    try {
      if (fs.existsSync(consolidatedPath)) {
        const raw = fs.readFileSync(consolidatedPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.months && parsed.months[monthKey]) {
          monthNameLower = String(parsed.months[monthKey].month_name).toLowerCase().trim();
        }
      }
    } catch (err) {
      console.error("[Admin API] Failed to parse month name from local file:", err);
    }

    // If local check failed, build from key suffix mapping
    if (!monthNameLower) {
      const suffix = monthKey.split("-")[1]; // e.g. "01"
      const monthsMapRev: Record<string, string> = {
        "01": "januari", "02": "februari", "03": "maret", "04": "april",
        "05": "mei", "06": "juni", "07": "juli", "08": "agustus",
        "09": "september", "10": "oktober", "11": "november", "12": "desember"
      };
      monthNameLower = monthsMapRev[suffix] || "";
    }

    if (!monthNameLower) {
      return NextResponse.json({ error: "Could not resolve month name from monthKey" }, { status: 400 });
    }

    console.log(`[Admin API] Requesting delete for month: ${monthNameLower} (${year}), key: ${monthKey}`);

    // 2. Delete the physical spreadsheets corresponding to the month
    const documentsDir = path.join(workspaceRoot, "dokumen");
    try {
      deleteMonthFiles(documentsDir, monthNameLower, year);
    } catch (fileErr: any) {
      console.error("[Admin API] Error deleting physical spreadsheet files:", fileErr.message);
    }

    // 3. Delete from Supabase
    let deletedFromDb = false;
    if (isSupabaseAdminConfigured() && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("tomeame_metrics")
        .delete()
        .eq("month_key", monthKey);

      if (error) {
        console.error(`[Admin API] Failed to delete month key ${monthKey} from Supabase:`, error.message);
        return NextResponse.json({ error: "Gagal menghapus dari Supabase: " + error.message }, { status: 500 });
      }
      deletedFromDb = true;
      console.log(`[Admin API] Successfully deleted month key ${monthKey} from Supabase!`);
    }

    // 4. Delete the key from the local fallback json file
    try {
      if (fs.existsSync(consolidatedPath)) {
        const raw = fs.readFileSync(consolidatedPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.months && parsed.months[monthKey]) {
          delete parsed.months[monthKey];
          fs.writeFileSync(consolidatedPath, JSON.stringify(parsed, null, 2), "utf-8");
          console.log(`[Admin API] Deleted month key ${monthKey} from local file.`);
        }
      }
    } catch (localErr: any) {
      console.error("[Admin API] Failed to delete month key from local consolidated json:", localErr.message);
    }

    // 5. Run python3 lib/data/consolidate.py to re-compile the local file and re-sync any remaining months
    try {
      const scriptPath = path.join(workspaceRoot, "lib/data/consolidate.py");
      console.log("[Admin API] Running ETL consolidation script to rebuild integrity...");
      const { stdout } = await execPromise(`python3 "${scriptPath}"`);
      console.log("[Admin API] ETL script rebuild complete. Output:", stdout);
      
      // Re-sync all remaining months in consolidated_metrics.json back to Supabase to keep them absolutely in sync
      if (isSupabaseAdminConfigured() && supabaseAdmin && fs.existsSync(consolidatedPath)) {
        const rawMetrics = fs.readFileSync(consolidatedPath, "utf-8");
        const parsedMetrics = JSON.parse(rawMetrics);
        if (parsedMetrics.months) {
          console.log("[Admin API] Syncing consolidated metrics back to Supabase tomeame_metrics...");
          for (const key of Object.keys(parsedMetrics.months)) {
            const monthData = parsedMetrics.months[key];
            const { month_name, ...otherData } = monthData;
            
            await supabaseAdmin
              .from("tomeame_metrics")
              .upsert({
                month_key: key,
                month_name: month_name,
                data: otherData,
                updated_at: new Date().toISOString()
              });
          }
        }
      }
    } catch (scriptErr: any) {
      console.error("[Admin API] Failed to re-consolidate data after delete:", scriptErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Data untuk bulan ${monthNameLower.charAt(0).toUpperCase() + monthNameLower.slice(1)} ${year} berhasil dihapus beserta file dokumen aslinya! Dashboard telah diperbarui.`
    });
  } catch (err: any) {
    console.error("[Admin API] DELETE error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
