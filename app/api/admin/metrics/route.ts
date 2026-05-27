import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { aggregateAllMonths, upsertMetricsToSupabase } from "@/lib/data/aggregate";

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

    if (isSupabaseAdminConfigured() && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("tomeame_metrics")
        .update({ month_name: newMonthName, updated_at: new Date().toISOString() })
        .eq("month_key", monthKey);

      if (error) {
        console.error(`[Admin API] Failed to update month name in Supabase for key ${monthKey}:`, error.message);
        return NextResponse.json({ error: "Gagal memperbarui di database Supabase: " + error.message }, { status: 500 });
      }

      const { error: fUpdateErr } = await supabaseAdmin
        .from("tomeame_file_data")
        .update({ month_name: newMonthName })
        .eq("month_key", monthKey);

      if (fUpdateErr) {
        console.error(`[Admin API] Failed to update file_data month name:`, fUpdateErr.message);
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

async function rebuildMetrics(workspaceRoot: string) {
  try {
    const months = await aggregateAllMonths();
    if (months) {
      await upsertMetricsToSupabase(months);
    }

    const consolidatedPath = path.join(workspaceRoot, "lib/data/consolidated_metrics.json");
    try {
      if (months) {
        const data = { months: {} as Record<string, unknown> };
        for (const [mk, md] of Object.entries(months)) {
          data.months[mk] = md;
        }
        fs.writeFileSync(consolidatedPath, JSON.stringify(data, null, 2), "utf-8");
      }
    } catch (localErr: any) {
      console.error("[Admin API] Failed to update local consolidated_metrics.json:", localErr.message);
    }
  } catch (err: any) {
    console.error("[Admin API] Rebuild metrics failed:", err.message || err);
  }
}

// DELETE: Delete a month record or specific file/segment, and rebuild metrics
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthKey = searchParams.get("monthKey");
    const filename = searchParams.get("filename");

    if (!monthKey && !filename) {
      return NextResponse.json({ error: "Missing monthKey or filename query parameter" }, { status: 400 });
    }

    const workspaceRoot = process.cwd();

    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
    }

    let deletedCount = 0;

    if (filename) {
      console.log(`[Admin API] Requesting delete for specific file: ${filename}`);

      const { data: matchedRows, error: findErr } = await supabaseAdmin
        .from("tomeame_file_data")
        .select("id, filename")
        .eq("filename", filename);

      if (findErr) {
        console.error("[Admin API] Failed to find file_data:", findErr.message);
        return NextResponse.json({ error: "Gagal mencari file: " + findErr.message }, { status: 500 });
      }

      if (!matchedRows || matchedRows.length === 0) {
        return NextResponse.json({ error: `File "${filename}" tidak ditemukan di database.` }, { status: 404 });
      }

      const { error: delErr, count } = await supabaseAdmin
        .from("tomeame_file_data")
        .delete()
        .eq("filename", filename);

      if (delErr) {
        console.error("[Admin API] Failed to delete file_data:", delErr.message);
        return NextResponse.json({ error: "Gagal menghapus file: " + delErr.message }, { status: 500 });
      }

      deletedCount = count || matchedRows.length;
      console.log(`[Admin API] Deleted ${deletedCount} file_data row(s) for filename: ${filename}`);

      await supabaseAdmin
        .from("tomeame_upload_history")
        .delete()
        .eq("filename", filename);
    } 
    else if (monthKey) {
      console.log(`[Admin API] Requesting delete for entire month: ${monthKey}`);

      const { error: fDelErr, count: fCount } = await supabaseAdmin
        .from("tomeame_file_data")
        .delete()
        .eq("month_key", monthKey);

      if (fDelErr) {
        console.error("[Admin API] Failed to delete file_data for month:", fDelErr.message);
      } else {
        console.log(`[Admin API] Deleted ${fCount || 0} file_data rows for month ${monthKey}`);
      }

      const { error: mDelErr } = await supabaseAdmin
        .from("tomeame_metrics")
        .delete()
        .eq("month_key", monthKey);

      if (mDelErr) {
        console.error(`[Admin API] Failed to delete month key ${monthKey} from Supabase:`, mDelErr.message);
        return NextResponse.json({ error: "Gagal menghapus dari Supabase: " + mDelErr.message }, { status: 500 });
      }
    }

    await rebuildMetrics(workspaceRoot);

    return NextResponse.json({
      success: true,
      message: filename
        ? `File "${filename}" berhasil dihapus! ${deletedCount} data segment telah diremove. Metrik telah dihitung ulang.`
        : "Seluruh data bulan berhasil dihapus dari database!",
    });
  } catch (err: any) {
    console.error("[Admin API] DELETE error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH: Update a specific section of a month's JSON data directly in metrics
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { monthKey, sectionKey, sectionData } = body;

    if (!monthKey || !sectionKey || sectionData === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: monthKey, sectionKey, sectionData" },
        { status: 400 }
      );
    }

    const workspaceRoot = process.cwd();
    const consolidatedPath = path.join(workspaceRoot, "lib/data/consolidated_metrics.json");

    try {
      if (fs.existsSync(consolidatedPath)) {
        const raw = fs.readFileSync(consolidatedPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.months && parsed.months[monthKey]) {
          parsed.months[monthKey][sectionKey] = sectionData;
          fs.writeFileSync(consolidatedPath, JSON.stringify(parsed, null, 2), "utf-8");
          console.log(`[Admin API PATCH] Updated local ${sectionKey} for ${monthKey}`);
        }
      }
    } catch (localErr: any) {
      console.error("[Admin API PATCH] Failed to update local file:", localErr.message);
    }

    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      return NextResponse.json({
        success: true,
        message: `Section "${sectionKey}" berhasil diperbarui di file lokal (Supabase tidak dikonfigurasi).`,
      });
    }

    const { data: existingRows, error: fetchError } = await supabaseAdmin
      .from("tomeame_metrics")
      .select("data")
      .eq("month_key", monthKey)
      .single();

    if (fetchError || !existingRows) {
      return NextResponse.json(
        { error: `Bulan ${monthKey} tidak ditemukan di database: ${fetchError?.message}` },
        { status: 404 }
      );
    }

    const existingData = existingRows.data || {};
    const updatedData = {
      ...existingData,
      [sectionKey]: sectionData,
    };

    const { error: updateError } = await supabaseAdmin
      .from("tomeame_metrics")
      .update({
        data: updatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("month_key", monthKey);

    if (updateError) {
      console.error(`[Admin API PATCH] Supabase update error for ${monthKey}/${sectionKey}:`, updateError.message);
      return NextResponse.json(
        { error: "Gagal memperbarui data di Supabase: " + updateError.message },
        { status: 500 }
      );
    }

    console.log(`[Admin API PATCH] Successfully updated ${sectionKey} for ${monthKey} in Supabase`);
    return NextResponse.json({
      success: true,
      message: `Section "${sectionKey}" untuk bulan ${monthKey} berhasil diperbarui!`,
    });
  } catch (err: any) {
    console.error("[Admin API PATCH] Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
