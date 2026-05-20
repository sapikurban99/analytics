import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const workspaceRoot = process.cwd();
  const fallbackJsonPath = path.join(workspaceRoot, "lib/data/consolidated_metrics.json");

  // Helper to read local static fallback
  const getLocalFallback = () => {
    try {
      if (fs.existsSync(fallbackJsonPath)) {
        const raw = fs.readFileSync(fallbackJsonPath, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("Failed to read local fallback metrics JSON:", err);
    }
    return { months: {} };
  };

  // If Supabase is not configured, immediately return local fallback
  if (!isSupabaseConfigured() || !supabase) {
    console.log("Supabase is not configured. Serving local static fallback metrics.");
    return NextResponse.json(getLocalFallback());
  }

  try {
    // Fetch all consolidated metrics from tomeame_metrics
    const { data: rows, error } = await supabase
      .from("tomeame_metrics")
      .select("month_key, month_name, data")
      .order("month_key", { ascending: true });

    if (error) {
      console.error("Supabase query error on tomeame_metrics:", error.message);
      // Fallback if table doesn't exist yet or query fails
      console.log("Falling back to local static metrics JSON due to database query failure.");
      return NextResponse.json(getLocalFallback());
    }

    if (!rows || rows.length === 0) {
      console.log("Supabase table tomeame_metrics is empty. Serving local static metrics.");
      return NextResponse.json(getLocalFallback());
    }

    // Format rows back to the standard months dictionary layout
    const formattedData: { months: Record<string, any> } = { months: {} };
    for (const row of rows) {
      formattedData.months[row.month_key] = {
        month_name: row.month_name,
        ...row.data,
      };
    }

    console.log(`Successfully fetched ${rows.length} months from Supabase 'tomeame_metrics'!`);
    return NextResponse.json(formattedData);
  } catch (err: any) {
    console.error("General error in GET /api/metrics:", err.message || err);
    return NextResponse.json(getLocalFallback());
  }
}
