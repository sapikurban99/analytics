import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";

interface MonthlyMetrics {
  month_name: string;
  shopee_overview: Record<string, unknown>;
  tiktok_overview: Record<string, unknown>;
  website_overview_utm: Record<string, unknown>;
  combined_overview: Record<string, unknown>;
  meta_ads_performance: Record<string, number>[];
  daily_trends: Record<string, unknown>[];
  products: Record<string, unknown>[];
  products_consolidated: Record<string, unknown>[];
  lives: Record<string, unknown>[];
  videos: Record<string, unknown>[];
  ads: {
    shopee: Record<string, unknown>[];
    tiktok: {
      live: Record<string, unknown>[];
      product: Record<string, unknown>[];
      summary: Record<string, unknown>;
    };
    summary: Record<string, unknown>;
    shopee_summary: Record<string, unknown>;
  };
  source_files: string[];
}

function newMonthData(monthName: string): MonthlyMetrics {
  return {
    month_name: monthName,
    shopee_overview: {},
    tiktok_overview: {},
    website_overview_utm: {},
    combined_overview: {},
    meta_ads_performance: [],
    daily_trends: [],
    products: [],
    products_consolidated: [],
    lives: [],
    videos: [],
    ads: {
      shopee: [],
      tiktok: { live: [], product: [], summary: {} },
      summary: {},
      shopee_summary: {},
    },
    source_files: [],
  };
}

// ── Aggregation Core ──

export async function aggregateMonth(monthKey: string): Promise<MonthlyMetrics | null> {
  const result = await aggregateAllMonths();
  return result?.[monthKey] ?? null;
}

export async function aggregateAllMonths(): Promise<Record<string, MonthlyMetrics> | null> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return null;

  const { data: rows, error } = await supabaseAdmin
    .from("tomeame_file_data")
    .select("*")
    .eq("status", "berhasil");

  if (error || !rows) {
    console.error("Failed to fetch file_data:", error?.message);
    return null;
  }

  const months: Record<string, MonthlyMetrics> = {};

  for (const row of rows) {
    const mk = row.month_key;
    if (!months[mk]) {
      months[mk] = newMonthData(row.month_name);
    }
    const m = months[mk];

    if (!m.source_files.includes(row.filename)) {
      m.source_files.push(row.filename);
    }

    const d = row.data as Record<string, unknown>;
    const cat = row.category as string;
    const dt = row.data_type as string;

    if (dt === "overview") {
      const overview = (d.overview || {}) as Record<string, number>;
      const daily = (d.daily || []) as Record<string, number>[];

      if (cat === "shp_overview") {
        m.shopee_overview = { ...overview };
        addDailyTrends(m, daily, "shopee");
      } else if (cat === "tts_overview") {
        m.tiktok_overview = { ...overview };
        addDailyTrends(m, daily, "tiktok");
      } else if (cat === "web_overview") {
        m.website_overview_utm = { ...overview };
        addDailyTrends(m, daily, "website");
      }
    } else if (dt === "products") {
      m.products.push(...(d.products || []) as Record<string, unknown>[]);
    } else if (dt === "lives") {
      m.lives.push(...(d.lives || []) as Record<string, unknown>[]);
    } else if (dt === "videos") {
      m.videos.push(...(d.videos || []) as Record<string, unknown>[]);
    } else if (dt === "ads_shopee") {
      m.ads.shopee.push(...(d.ads_shopee || []) as Record<string, unknown>[]);
    } else if (dt === "ads_tiktok_live") {
      m.ads.tiktok.live.push(...(d.ads_tiktok_live || []) as Record<string, unknown>[]);
    } else if (dt === "ads_tiktok_product") {
      m.ads.tiktok.product.push(...(d.ads_tiktok_product || []) as Record<string, unknown>[]);

      // Compute ROI for each item
      for (const item of m.ads.tiktok.product) {
        const cost = (item.cost as number) || 0;
        const gmv = (item.gmv as number) || 0;
        if (cost > 0 && !item.roi) {
          item.roi = Math.round((gmv / cost) * 100) / 100;
        }
      }
    } else if (dt === "ads_meta") {
      m.meta_ads_performance.push(...(d.ads_meta || []) as Record<string, number>[]);
    }
  }

  // Post-process each month
  for (const mk of Object.keys(months)) {
    const m = months[mk];
    postProcessMonth(m);
  }

  // Growth rates (MoM)
  const sortedKeys = Object.keys(months).sort();
  for (let i = 0; i < sortedKeys.length; i++) {
    const mk = sortedKeys[i];
    const m = months[mk];

    if (i === 0) {
      m.combined_overview.growth = { gmv: 0, orders: 0, visitors: 0, conversion_rate: 0 };
      if (Object.keys(m.shopee_overview).length > 0) {
        m.shopee_overview.growth = { gmv: 0, orders: 0, visitors: 0, conversion_rate: 0 };
      }
      if (Object.keys(m.tiktok_overview).length > 0) {
        m.tiktok_overview.growth = { gmv: 0, orders: 0, visitors: 0, conversion_rate: 0 };
      }
    } else {
      const prev = months[sortedKeys[i - 1]];
      computeMoMGrowth(m.shopee_overview, prev.shopee_overview);
      computeMoMGrowth(m.tiktok_overview, prev.tiktok_overview);
      computeMoMGrowth(m.combined_overview, prev.combined_overview);
    }
  }

  return months;
}

// ── Daily Trend Merging ──

function addDailyTrends(
  m: MonthlyMetrics,
  daily: Record<string, number>[],
  platform: "shopee" | "tiktok" | "website"
) {
  const prefix = platform === "shopee" ? "shopee" : platform === "tiktok" ? "tiktok" : "website";
  const gmKey = `${prefix}_gmv`;
  const ordKey = `${prefix}_orders`;
  const visKey = `${prefix}_visitors`;
  const clkKey = `${prefix}_clicks`;

  const existing = new Map<string, number>();
  m.daily_trends.forEach((t, i) => {
    if (typeof t.date === "string") {
      existing.set(t.date, i);
    }
  });

  for (const d of daily) {
    const date = String(d.date);
    const idx = existing.get(date);
    if (idx !== undefined) {
      const t = m.daily_trends[idx];
      t[gmKey] = (d[gmKey] || 0) as number;
      t[ordKey] = (d[ordKey] || 0) as number;
      t[visKey] = (d[visKey] || 0) as number;
      t[clkKey] = (d[clkKey] || 0) as number;

      const combGmv = ((t.shopee_gmv as number) || 0) + ((t.tiktok_gmv as number) || 0) + ((t.website_gmv as number) || 0);
      const combOrd = ((t.shopee_orders as number) || 0) + ((t.tiktok_orders as number) || 0) + ((t.website_orders as number) || 0);
      const combVis = ((t.shopee_visitors as number) || 0) + ((t.tiktok_visitors as number) || 0);
      t.combined_gmv = combGmv;
      t.combined_orders = combOrd;
      t.combined_visitors = combVis;
    } else {
      const entry: Record<string, unknown> = {
        date,
        shopee_gmv: 0, shopee_orders: 0, shopee_visitors: 0, shopee_clicks: 0,
        tiktok_gmv: 0, tiktok_orders: 0, tiktok_visitors: 0, tiktok_clicks: 0,
        website_gmv: 0, website_orders: 0,
        meta_gmv: 0, meta_orders: 0,
        combined_gmv: 0, combined_orders: 0, combined_visitors: 0,
      };
      entry[gmKey] = d[gmKey] || 0;
      entry[ordKey] = d[ordKey] || 0;
      if (visKey) entry[visKey] = d[visKey] || 0;
      if (clkKey) entry[clkKey] = d[clkKey] || 0;
      entry.combined_gmv = d[gmKey] || 0;
      entry.combined_orders = d[ordKey] || 0;
      entry.combined_visitors = d[visKey] || 0;

      m.daily_trends.push(entry);
    }
  }

  m.daily_trends.sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

// ── Post-process Month ──

function postProcessMonth(m: MonthlyMetrics) {
  // Combined overview
  const shpO = m.shopee_overview;
  const ttsO = m.tiktok_overview;
  const webO = m.website_overview_utm;
  const metaGmv = m.meta_ads_performance.reduce((s, x) => s + ((x.gmv || 0) as number), 0);
  const metaOrd = m.meta_ads_performance.reduce((s, x) => s + ((x.orders || 0) as number), 0);

  const combGmv = ((shpO.gmv as number) || 0) + ((ttsO.gmv as number) || 0) + ((webO.gmv as number) || 0) + metaGmv;
  const combOrd = ((shpO.orders as number) || 0) + ((ttsO.orders as number) || 0) + ((webO.orders as number) || 0) + metaOrd;
  const combVis = ((shpO.visitors as number) || 0) + ((ttsO.visitors as number) || 0) + ((webO.visitors as number) || 0);

  m.combined_overview = {
    gmv: combGmv,
    orders: combOrd,
    visitors: combVis,
    conversion_rate: combVis > 0 ? Math.round((combOrd / combVis) * 1e6) / 1e6 : 0,
  };

  // Products consolidation
  const mergedProducts: Record<string, Record<string, unknown>> = {};
  for (const p of m.products) {
    const name = p.name as string;
    if (!mergedProducts[name]) {
      mergedProducts[name] = {
        name,
        status: p.status || "Active",
        shopee_gmv: 0, shopee_items_sold: 0,
        tiktok_gmv: 0, tiktok_items_sold: 0,
        website_gmv: 0, website_items_sold: 0,
        combined_gmv: 0, combined_items_sold: 0,
      };
    }
    const mp = mergedProducts[name];
    const pf = p.platform as string;
    const gmv = (p.gmv || 0) as number;
    const sold = (p.items_sold || 0) as number;

    if (pf === "Shopee") {
      mp.shopee_gmv = ((mp.shopee_gmv || 0) as number) + gmv;
      mp.shopee_items_sold = ((mp.shopee_items_sold || 0) as number) + sold;
      mp.status = p.status || mp.status;
    } else if (pf === "TikTok") {
      mp.tiktok_gmv = ((mp.tiktok_gmv || 0) as number) + gmv;
      mp.tiktok_items_sold = ((mp.tiktok_items_sold || 0) as number) + sold;
    } else if (pf === "Website") {
      mp.website_gmv = ((mp.website_gmv || 0) as number) + gmv;
      mp.website_items_sold = ((mp.website_items_sold || 0) as number) + sold;
    }

    mp.combined_gmv = ((mp.shopee_gmv || 0) as number) + ((mp.tiktok_gmv || 0) as number) + ((mp.website_gmv || 0) as number);
    mp.combined_items_sold = ((mp.shopee_items_sold || 0) as number) + ((mp.tiktok_items_sold || 0) as number) + ((mp.website_items_sold || 0) as number);
  }

  m.products_consolidated = Object.values(mergedProducts).sort(
    (a, b) => ((b.combined_gmv || 0) as number) - ((a.combined_gmv || 0) as number)
  );

  // Sort lives and videos
  m.lives = m.lives.sort((a, b) => ((b.gmv || 0) as number) - ((a.gmv || 0) as number));
  m.videos = m.videos.sort((a, b) => ((b.gmv || 0) as number) - ((a.gmv || 0) as number));

  // Ads summaries
  const shpCost = m.ads.shopee.reduce((s, x) => s + ((x.cost || 0) as number), 0);
  const shpGmv = m.ads.shopee.reduce((s, x) => s + ((x.gmv || 0) as number), 0);
  const shpOrd = m.ads.shopee.reduce((s, x) => s + ((x.orders || 0) as number), 0);
  m.ads.shopee_summary = {
    cost: shpCost,
    gmv: shpGmv,
    orders: shpOrd,
    roas: Math.round((shpGmv / (shpCost || 1)) * 100) / 100,
  };

  const ttsCostL = m.ads.tiktok.live.reduce((s, x) => s + ((x.cost || 0) as number), 0);
  const ttsCostP = m.ads.tiktok.product.reduce((s, x) => s + ((x.cost || 0) as number), 0);
  const ttsCost = ttsCostL + ttsCostP;
  const ttsGmvL = m.ads.tiktok.live.reduce((s, x) => s + ((x.gmv || 0) as number), 0);
  const ttsGmvP = m.ads.tiktok.product.reduce((s, x) => s + ((x.gmv || 0) as number), 0);
  const ttsGmv = ttsGmvL + ttsGmvP;
  const ttsOrdL = m.ads.tiktok.live.reduce((s, x) => s + ((x.orders || 0) as number), 0);
  const ttsOrdP = m.ads.tiktok.product.reduce((s, x) => s + ((x.orders || 0) as number), 0);
  const ttsOrd = ttsOrdL + ttsOrdP;
  m.ads.tiktok.summary = {
    cost: ttsCost,
    gmv: ttsGmv,
    orders: ttsOrd,
    roi: Math.round((ttsGmv / (ttsCost || 1)) * 100) / 100,
  };

  const combCost = shpCost + ttsCost;
  const combAGmv = shpGmv + ttsGmv;
  const combAOrd = shpOrd + ttsOrd;
  m.ads.summary = {
    cost: combCost,
    gmv: combAGmv,
    orders: combAOrd,
    roi: Math.round((combAGmv / (combCost || 1)) * 100) / 100,
  };
}

// ── MoM Growth ──

function computeMoMGrowth(curr: Record<string, unknown>, prev: Record<string, unknown>) {
  if (Object.keys(curr).length === 0 || Object.keys(prev).length === 0) {
    curr.growth = { gmv: 0, orders: 0, visitors: 0, conversion_rate: 0 };
    return;
  }
  const round = (n: number) => Math.round(n * 1e6) / 1e6;
  const cGmv = (curr.gmv as number) || 0;
  const pGmv = (prev.gmv as number) || 0;
  const cOrd = (curr.orders as number) || 0;
  const pOrd = (prev.orders as number) || 0;
  const cVis = (curr.visitors as number) || 0;
  const pVis = (prev.visitors as number) || 0;
  const cCR = (curr.conversion_rate as number) || 0;
  const pCR = (prev.conversion_rate as number) || 0;
  curr.growth = {
    gmv: pGmv > 0 ? round((cGmv - pGmv) / pGmv) : 0,
    orders: pOrd > 0 ? round((cOrd - pOrd) / pOrd) : 0,
    visitors: pVis > 0 ? round((cVis - pVis) / pVis) : 0,
    conversion_rate: pCR > 0 ? round((cCR - pCR) / pCR) : 0,
  };
}

// ── Upsert to Supabase ──

export async function upsertMetricsToSupabase(months: Record<string, MonthlyMetrics>) {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return;

  for (const [monthKey, monthData] of Object.entries(months)) {
    const { month_name, ...otherData } = monthData;
    const { error } = await supabaseAdmin.from("tomeame_metrics").upsert({
      month_key: monthKey,
      month_name,
      data: otherData,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error(`Failed to upsert metrics for ${monthKey}:`, error.message);
    }
  }
}
