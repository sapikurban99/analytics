"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Percent,
  Coins,
  Store,
} from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import TrendChart from "@/components/ui/trend-chart";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DashboardData, VideoMetric, LiveSession } from "@/lib/db";

interface Props {
  dashboardData: DashboardData;
}

/* ====== #1 TIKTOK OVERVIEW ====== */
export function TikTokOverview({ dashboardData }: Props) {
  const gmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;
  const orders = dashboardData.overview.find((m) => m.key === "orders")?.value || 0;
  const visitors = dashboardData.overview.find((m) => m.key === "visitors")?.value || 0;
  const cvr = dashboardData.overview.find((m) => m.key === "conversion_rate")?.value || 0;
  const aov = orders > 0 ? gmv / orders : 0;
  const adsGmv = dashboardData.ads.summary.gmv;
  const adsCost = dashboardData.ads.summary.cost;
  const roas = adsCost > 0 ? adsGmv / adsCost : 0;
  // Use products as single source of truth for items sold (from tts_product_list)
  // Lives + videos items_sold overlap with product data → would triple-count
  const itemsSold = dashboardData.products.reduce((s, p) => s + p.tiktokItemsSold, 0);

  const videoGmv = dashboardData.videos.reduce((s, v) => s + v.gmv, 0);
  const liveGmv = dashboardData.lives.reduce((s, l) => s + l.gmv, 0);
  const productCardGmv = Math.max(0, gmv - videoGmv - liveGmv);
  const totalRevenueComposition = videoGmv + liveGmv + productCardGmv;

  return (
    <div className="space-y-8 mt-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Financial Metrics</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <MetricCard label="Revenue" value={gmv} format="currency" icon={DollarSign} />
          <MetricCard label="Spend Ads" value={adsCost} format="currency" icon={TrendingUp} />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Operational Metrics</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Orders" value={orders} format="number" icon={ShoppingBag} />
          <MetricCard label="Items Sold" value={itemsSold} format="number" icon={Store} />
          <MetricCard label="Visitors" value={visitors} format="number" icon={Users} />
          <MetricCard label="Conversion Rate" value={cvr} format="percent" icon={Percent} />
          <MetricCard label="AOV" value={aov} format="currency" icon={Coins} />
        </div>
      </div>

      <div>
        <TrendChart dataPoints={dashboardData.dailyTrends} platform="TikTok" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Revenue Composition</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="text-3xl font-bold text-foreground">{formatCurrency(gmv)}<p className="text-sm text-muted-foreground font-normal mt-1">Total Revenue</p></div>
          <div className="space-y-4">
            {[
              { label: "Video", value: videoGmv, color: "bg-purple-500" },
              { label: "Live", value: liveGmv, color: "bg-rose-500" },
              { label: "Product Card", value: productCardGmv, color: "bg-amber-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground font-semibold">{formatCurrency(item.value)} <span className="text-muted-foreground font-normal">({totalRevenueComposition > 0 ? ((item.value / totalRevenueComposition) * 100).toFixed(1) : 0}%)</span></span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${totalRevenueComposition > 0 ? (item.value / totalRevenueComposition) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== #2 TIKTOK PRODUCT ANALYZ ====== */
export function TikTokProductAnalyz({ dashboardData }: Props) {
  const tiktokProducts = dashboardData.products.filter((p) => p.tiktokGmv > 0);

  const columns: ColumnDef<any>[] = [
    { key: "name", header: "Product Name", sortable: true, render: (p) => <div className="max-w-xs"><p className="truncate font-semibold text-foreground" title={p.name}>{p.name}</p></div> },
    { key: "tiktokGmv", header: "Revenue", sortable: true, align: "right", render: (p) => <span className="font-semibold text-rose-500">{formatCurrency(p.tiktokGmv)}</span> },
    { key: "tiktokItemsSold", header: "Items Sold", sortable: true, align: "right", render: (p) => <span>{formatNumber(p.tiktokItemsSold)}</span> },
  ];

  return (
    <div className="space-y-6 mt-4">
      <div className="grid gap-6 sm:grid-cols-3">
        <MetricCard label="Total Products" value={tiktokProducts.length} format="number" icon={ShoppingBag} />
        <MetricCard label="Top Revenue" value={tiktokProducts[0]?.tiktokGmv || 0} format="currency" icon={DollarSign} />
        <MetricCard label="Total Items Sold" value={tiktokProducts.reduce((s, p) => s + p.tiktokItemsSold, 0)} format="number" icon={Store} />
      </div>
      <DataTable columns={columns} data={tiktokProducts} searchFields={["name"]} searchPlaceholder="Cari produk TikTok..." defaultSort={{ key: "tiktokGmv", direction: "desc" }} />
    </div>
  );
}

/* ====== #3 TIKTOK CHANNEL ANALYZ ====== */
export function TikTokChannelAnalyz({ dashboardData }: Props) {
  const [channelFilter, setChannelFilter] = React.useState<"all" | "Seller" | "Affiliate">("all");

  const filteredVideos = React.useMemo(() => {
    if (channelFilter === "all") return dashboardData.videos;
    return dashboardData.videos.filter((v) => v.type === channelFilter);
  }, [dashboardData.videos, channelFilter]);

  const filteredLives = React.useMemo(() => {
    if (channelFilter === "all") return dashboardData.lives;
    return dashboardData.lives.filter((l) => l.type === channelFilter);
  }, [dashboardData.lives, channelFilter]);

  const videoColumns: ColumnDef<VideoMetric>[] = [
    { key: "creator", header: "Creator Name", sortable: true, render: (v) => <span className="font-semibold text-foreground">@{v.creator}</span> },
    { key: "title", header: "Video ID / Info", sortable: true, render: (v) => <div className="max-w-xs"><p className="truncate text-muted-foreground" title={v.title}>{v.title}</p></div> },
    { key: "gmv", header: "GMV (Rp)", sortable: true, align: "right", render: (v) => <span className="font-semibold text-rose-500">{formatCurrency(v.gmv)}</span> },
    { key: "items_sold", header: "SKU Order", sortable: true, align: "right" },
    { key: "views", header: "VV (Views)", sortable: true, align: "right" },
    { key: "likes", header: "Likes", sortable: true, align: "right" },
    { key: "ctr", header: "CTOR%", sortable: true, align: "right", render: (v) => <span className="text-emerald-500 font-semibold">{(v.ctr * 100).toFixed(2)}%</span> },
  ];

  const liveColumns: ColumnDef<LiveSession>[] = [
    { key: "creator_name", header: "Creator Name", sortable: true, render: (l) => <span className="font-semibold text-foreground">{l.creator_name}</span> },
    { key: "creator", header: "Creator ID", sortable: true },
    { key: "duration", header: "Duration LIVE", sortable: false, align: "center" },
    { key: "gmv", header: "GMV (Rp)", sortable: true, align: "right", render: (l) => <span className="font-semibold text-rose-500">{formatCurrency(l.gmv)}</span> },
    { key: "items_sold", header: "LIVE Items Sold", sortable: true, align: "right" },
    { key: "views", header: "Views", sortable: true, align: "right" },
    { key: "clicks", header: "Prod Clicks", sortable: true, align: "right" },
    { key: "ctr", header: "CTR%", sortable: true, align: "right", render: (l) => <span className="text-emerald-500 font-semibold">{(l.ctr * 100).toFixed(2)}%</span> },
  ];

  const productCardProducts = dashboardData.products.filter((p) => p.tiktokGmv > 0);

  return (
    <div className="space-y-8 mt-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        {(["all", "Seller", "Affiliate"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setChannelFilter(f)}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-lg transition-all border cursor-pointer",
              channelFilter === f
                ? "bg-[#3D4BFF]/10 text-[#3D4BFF] border-[#3D4BFF]/30 dark:bg-[#3D4BFF]/20 dark:text-white"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/30"
            )}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Video Performance</h3>
        <DataTable columns={videoColumns} data={filteredVideos} searchFields={["creator", "title"]} searchPlaceholder="Cari video..." defaultSort={{ key: "gmv", direction: "desc" }} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Live Performance</h3>
        <DataTable columns={liveColumns} data={filteredLives} searchFields={["creator_name", "creator"]} searchPlaceholder="Cari host..." defaultSort={{ key: "gmv", direction: "desc" }} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Product Card (Toko / Showcase Pasif)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Product Name</th><th className="py-3 px-3 text-right">GMV (Rp)</th><th className="py-3 px-3 text-right">Items Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {productCardProducts.slice(0, 20).map((p, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-semibold text-foreground max-w-xs truncate">{p.name}</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(p.tiktokGmv)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(p.tiktokItemsSold)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ====== #4 TIKTOK AFFILIATE ANALYZ ====== */
export function TikTokAffiliateAnalyz({ dashboardData }: Props) {
  const affiliateVideos = React.useMemo(
    () => dashboardData.videos.filter((v) => v.type === "Affiliate"),
    [dashboardData]
  );
  const affiliateLives = React.useMemo(
    () => dashboardData.lives.filter((l) => l.type === "Affiliate"),
    [dashboardData]
  );

  const creators = React.useMemo(() => {
    const map: Record<string, { creator: string; gmv: number; itemsSold: number; videos: number; lives: number; commission: number }> = {};
    affiliateVideos.forEach((v) => {
      if (!map[v.creator]) map[v.creator] = { creator: v.creator, gmv: 0, itemsSold: 0, videos: 0, lives: 0, commission: 0 };
      map[v.creator].gmv += v.gmv;
      map[v.creator].itemsSold += v.items_sold;
      map[v.creator].videos += 1;
      map[v.creator].commission += v.gmv * 0.08;
    });
    affiliateLives.forEach((l) => {
      if (!map[l.creator_name]) map[l.creator_name] = { creator: l.creator_name, gmv: 0, itemsSold: 0, videos: 0, lives: 0, commission: 0 };
      map[l.creator_name].gmv += l.gmv;
      map[l.creator_name].itemsSold += l.items_sold;
      map[l.creator_name].lives += 1;
      map[l.creator_name].commission += l.gmv * 0.08;
    });
    return Object.values(map).sort((a, b) => b.gmv - a.gmv);
  }, [affiliateVideos, affiliateLives]);

  const affiliateProducts = React.useMemo(() => {
    const products = dashboardData.products.filter((p) => p.tiktokGmv > 0);
    const productMap = new Map<string, { name: string; gmv: number; itemsSold: number }>();
    products.forEach((p) => {
      productMap.set(p.name, { name: p.name, gmv: p.tiktokGmv, itemsSold: p.tiktokItemsSold });
    });
    return Array.from(productMap.values()).sort((a, b) => b.gmv - a.gmv);
  }, [dashboardData]);

  const totalAffiliateGmv = creators.reduce((s, c) => s + c.gmv, 0);
  const totalCommission = creators.reduce((s, c) => s + c.commission, 0);

  return (
    <div className="space-y-8 mt-4">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Creator Analyz</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Creator Name</th><th className="py-3 px-3 text-right">GMV</th><th className="py-3 px-3 text-right">Items Sold</th><th className="py-3 px-3 text-right">AOV</th><th className="py-3 px-3 text-right">Avg/Sold</th><th className="py-3 px-3 text-right">Videos</th><th className="py-3 px-3 text-right">LIVE</th><th className="py-3 px-3 text-right">Est. Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {creators.slice(0, 20).map((a) => (
                <tr key={a.creator} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-semibold text-foreground">@{a.creator}</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(a.gmv)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(a.itemsSold)}</td>
                  <td className="py-3 px-3 text-right">{a.itemsSold > 0 ? formatCurrency(a.gmv / a.itemsSold) : "-"}</td>
                  <td className="py-3 px-3 text-right">{(a.itemsSold / Math.max(1, a.videos + a.lives)).toFixed(1)}</td>
                  <td className="py-3 px-3 text-right">{a.videos}</td>
                  <td className="py-3 px-3 text-right">{a.lives}</td>
                  <td className="py-3 px-3 text-right font-bold text-violet-500 dark:text-violet-400">{formatCurrency(a.commission)}</td>
                </tr>
              ))}
              {creators.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No affiliate data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Product Analyz (Jalur Afiliasi)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Product Name</th><th className="py-3 px-3 text-right">Revenue</th><th className="py-3 px-3 text-right">Items Sold</th><th className="py-3 px-3 text-right">Est. Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {affiliateProducts.slice(0, 15).map((p, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-semibold text-foreground max-w-xs truncate">{p.name}</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(p.gmv)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(p.itemsSold)}</td>
                  <td className="py-3 px-3 text-right font-bold text-violet-500 dark:text-violet-400">{formatCurrency(p.gmv * 0.08)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Commission</h3>
        <div className="grid gap-6 lg:grid-cols-4">
          {[
            { label: "Commission Plan Type", value: "Open" },
            { label: "Commission Rate%", value: "8%" },
            { label: "Total Paid Out", value: formatCurrency(totalCommission) },
            { label: "Affiliate ROI Multiplier", value: `${(totalAffiliateGmv / Math.max(1, totalCommission)).toFixed(2)}x` },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-sm font-bold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
