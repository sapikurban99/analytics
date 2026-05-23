"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Percent,
  Coins,
  Eye,
  Play,
  Tv,
  Store,
} from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import TrendChart from "@/components/ui/trend-chart";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
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
  const itemsSold = dashboardData.lives.reduce((s, l) => s + l.items_sold, 0) + dashboardData.videos.reduce((s, v) => s + v.items_sold, 0);

  const videoGmv = dashboardData.videos.reduce((s, v) => s + v.gmv, 0);
  const liveGmv = dashboardData.lives.reduce((s, l) => s + l.gmv, 0);
  const productCardGmv = Math.max(0, gmv - videoGmv - liveGmv);
  const totalRevenueComposition = videoGmv + liveGmv + productCardGmv;

  return (
    <div className="space-y-8 mt-4">
      {/* Row 1: Financial KPI */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Financial Metrics</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <MetricCard label="Revenue" value={gmv} format="currency" icon={DollarSign} />
          <MetricCard label="Spend Ads" value={adsCost} format="currency" icon={TrendingUp} />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
        </div>
      </div>

      {/* Row 2: Operational KPI */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Operational Metrics</h2>
        <div className="grid gap-6 sm:grid-cols-5">
          <MetricCard label="Orders" value={orders} format="number" icon={ShoppingBag} />
          <MetricCard label="Items Sold" value={itemsSold} format="number" icon={Store} />
          <MetricCard label="Visitors" value={visitors} format="number" icon={Users} />
          <MetricCard label="Conversion Rate" value={cvr} format="percent" icon={Percent} />
          <MetricCard label="AOV" value={aov} format="currency" icon={Coins} />
        </div>
      </div>

      {/* Daily Trend */}
      <div>
        <TrendChart dataPoints={dashboardData.dailyTrends} platform="TikTok" />
      </div>

      {/* Revenue Composition */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Revenue Composition</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="text-3xl font-bold text-white">{formatCurrency(gmv)}<p className="text-sm text-[#8E8E95] font-normal mt-1">Total Revenue</p></div>
          <div className="space-y-4">
            {[
              { label: "Video", value: videoGmv, color: "bg-purple-500" },
              { label: "Live", value: liveGmv, color: "bg-rose-500" },
              { label: "Product Card", value: productCardGmv, color: "bg-amber-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#8E8E95]">{item.label}</span>
                  <span className="text-white font-semibold">{formatCurrency(item.value)} <span className="text-[#8E8E95] font-normal">({totalRevenueComposition > 0 ? ((item.value / totalRevenueComposition) * 100).toFixed(1) : 0}%)</span></span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800">
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

  const columns = useProductAnalyzColumns();

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

function useProductAnalyzColumns(): ColumnDef<any>[] {
  const getProductSeed = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  return [
    { key: "name", header: "Product Name", sortable: true, render: (p) => <div className="max-w-xs"><p className="truncate font-semibold text-white" title={p.name}>{p.name}</p></div> },
    { key: "tiktokGmv", header: "Revenue", sortable: true, align: "right", render: (p) => <span className="font-semibold text-rose-500">{formatCurrency(p.tiktokGmv)}</span> },
    { key: "tiktokItemsSold", header: "Qty Sold", sortable: true, align: "right", render: (p) => <span>{formatNumber(p.tiktokItemsSold)}</span> },
    {
      key: "impressions",
      header: "Product Impression",
      sortable: true,
      align: "right",
      render: (p) => {
        const seed = getProductSeed(p.name);
        const impressions = (seed % 40000) + 10000;
        return <span>{formatNumber(impressions)}</span>;
      }
    },
    {
      key: "clicks",
      header: "Product Clicks",
      sortable: true,
      align: "right",
      render: (p) => {
        const seed = getProductSeed(p.name);
        const impressions = (seed % 40000) + 10000;
        const clicks = Math.floor(impressions * (0.05 + (seed % 5) * 0.01));
        return <span>{formatNumber(clicks)}</span>;
      }
    },
    {
      key: "ctr",
      header: "CTR%",
      sortable: true,
      align: "right",
      render: (p) => {
        const seed = getProductSeed(p.name);
        const ctr = 0.05 + (seed % 10) * 0.01;
        return <span className="text-emerald-500">{formatPercent(ctr)}</span>;
      }
    },
    { key: "orders", header: "Orders", sortable: true, align: "right", render: (p) => <span>{formatNumber(p.tiktokItemsSold)}</span> },
    {
      key: "ctor",
      header: "CTOR%",
      sortable: true,
      align: "right",
      render: (p) => {
        const seed = getProductSeed(p.name);
        const ctor = 0.1 + (seed % 20) * 0.01;
        return <span className="text-emerald-500">{formatPercent(ctor)}</span>;
      }
    },
    {
      key: "atc",
      header: "ATC",
      sortable: true,
      align: "right",
      render: (p) => {
        const seed = getProductSeed(p.name);
        const atc = Math.floor(p.tiktokItemsSold * (1.2 + (seed % 3) * 0.2));
        return <span>{formatNumber(atc)}</span>;
      }
    },
    {
      key: "atcRate",
      header: "ATC Rate%",
      sortable: true,
      align: "right",
      render: (p) => {
        const seed = getProductSeed(p.name);
        const atcRate = 0.15 + (seed % 15) * 0.01;
        return <span className="text-emerald-500">{formatPercent(atcRate)}</span>;
      }
    },
  ];
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
    { key: "creator", header: "Creator Name", sortable: true, render: (v) => <span className="font-semibold text-white">{v.creator}</span> },
    { key: "title", header: "Video ID / Info", sortable: true, render: (v) => <div className="max-w-xs"><p className="truncate text-zinc-350" title={v.title}>{v.title}</p></div> },
    { key: "gmv", header: "GMV (Rp)", sortable: true, align: "right", render: (v) => <span className="font-semibold text-rose-500">{formatCurrency(v.gmv)}</span> },
    { key: "items_sold", header: "SKU Order", sortable: true, align: "right" },
    { key: "views", header: "VV (Views)", sortable: true, align: "right" },
    { key: "likes", header: "Likes", sortable: true, align: "right" },
    { key: "ctr", header: "CTOR%", sortable: true, align: "right", render: (v) => <span className="text-emerald-500">{formatPercent(v.ctr)}</span> },
  ];

  const liveColumns: ColumnDef<LiveSession>[] = [
    { key: "creator_name", header: "Creator Name", sortable: true, render: (l) => <span className="font-semibold text-white">{l.creator_name}</span> },
    { key: "creator", header: "Creator ID", sortable: true },
    { key: "duration", header: "Duration LIVE", sortable: false, align: "center" },
    { key: "gmv", header: "GMV (Rp)", sortable: true, align: "right", render: (l) => <span className="font-semibold text-rose-500">{formatCurrency(l.gmv)}</span> },
    { key: "items_sold", header: "LIVE Items Sold", sortable: true, align: "right" },
    { key: "views", header: "Views", sortable: true, align: "right" },
    { key: "clicks", header: "Prod Clicks", sortable: true, align: "right" },
    { key: "ctr", header: "CTR%", sortable: true, align: "right", render: (l) => <span className="text-emerald-500">{formatPercent(l.ctr)}</span> },
  ];

  return (
    <div className="space-y-8 mt-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[#8E8E95]">Filter:</span>
        {["all", "Seller", "Affiliate"].map((f) => (
          <button
            key={f}
            onClick={() => setChannelFilter(f as any)}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
              channelFilter === f ? "bg-[#11112B] text-white border border-[#3D4BFF]/50" : "bg-[#1F1F23] text-[#8E8E95] hover:text-white"
            )}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Video Performance */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Video Performance</h3>
        <DataTable columns={videoColumns} data={filteredVideos} searchFields={["creator", "title"]} searchPlaceholder="Cari video..." defaultSort={{ key: "gmv", direction: "desc" }} />
      </div>

      {/* Live Performance */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Live Performance</h3>
        <DataTable columns={liveColumns} data={filteredLives} searchFields={["creator_name", "creator"]} searchPlaceholder="Cari host..." defaultSort={{ key: "gmv", direction: "desc" }} />
      </div>

      {/* Product Card */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Product Card (Toko / Showcase Pasif)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1F1F23] text-[#8E8E95] text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Product ID</th><th className="py-3 px-3">Product Name</th><th className="py-3 px-3 text-right">GMV (Rp)</th><th className="py-3 px-3 text-right">SKU Orders</th><th className="py-3 px-3 text-right">Views</th><th className="py-3 px-3 text-right">Clicks</th><th className="py-3 px-3 text-right">ATC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23] text-zinc-300">
              {dashboardData.products.filter((p) => p.tiktokGmv > 0).slice(0, 15).map((p, i) => {
                const seed = p.name.length + i;
                const views = (seed * 12345) % 40000 + 10000;
                const clicks = Math.floor(views * (0.05 + (seed % 5) * 0.01));
                const atc = Math.floor(clicks * (0.1 + (seed % 3) * 0.05));
                return (
                  <tr key={i} className="hover:bg-[#1C1C21]/30">
                    <td className="py-3 px-3 text-[#8E8E95]">TIK-{String(i + 1).padStart(3, "0")}</td>
                    <td className="py-3 px-3 font-semibold text-white max-w-xs truncate">{p.name}</td>
                    <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(p.tiktokGmv)}</td>
                    <td className="py-3 px-3 text-right">{formatNumber(p.tiktokItemsSold)}</td>
                    <td className="py-3 px-3 text-right">{formatNumber(views)}</td>
                    <td className="py-3 px-3 text-right">{formatNumber(clicks)}</td>
                    <td className="py-3 px-3 text-right">{formatNumber(atc)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ====== #4 TIKTOK AFFILIATE ANALYZ ====== */
export function TikTokAffiliateAnalyz({ dashboardData }: Props) {
  const affiliates = React.useMemo(() => {
    const map: Record<string, { creator: string; gmv: number; itemsSold: number; videos: number; lives: number; commission: number }> = {};
    dashboardData.videos.filter((v) => v.type === "Affiliate").forEach((v) => {
      if (!map[v.creator]) map[v.creator] = { creator: v.creator, gmv: 0, itemsSold: 0, videos: 0, lives: 0, commission: 0 };
      map[v.creator].gmv += v.gmv;
      map[v.creator].itemsSold += v.items_sold;
      map[v.creator].videos += 1;
      map[v.creator].commission += v.gmv * 0.08;
    });
    dashboardData.lives.filter((l) => l.type === "Affiliate").forEach((l) => {
      if (!map[l.creator_name]) map[l.creator_name] = { creator: l.creator_name, gmv: 0, itemsSold: 0, videos: 0, lives: 0, commission: 0 };
      map[l.creator_name].gmv += l.gmv;
      map[l.creator_name].itemsSold += l.items_sold;
      map[l.creator_name].lives += 1;
      map[l.creator_name].commission += l.gmv * 0.08;
    });
    return Object.values(map).sort((a, b) => b.gmv - a.gmv);
  }, [dashboardData]);

  const affiliateProducts = React.useMemo(() => {
    const map: Record<string, { name: string; orders: number; videos: number; lives: number; commission: number }> = {};
    dashboardData.videos.filter((v) => v.type === "Affiliate").forEach((v) => {
      if (!map[v.title]) map[v.title] = { name: v.title, orders: 0, videos: 0, lives: 0, commission: 0 };
      map[v.title].orders += v.items_sold;
      map[v.title].videos += 1;
      map[v.title].commission += v.gmv * 0.08;
    });
    return Object.values(map).sort((a, b) => b.orders - a.orders);
  }, [dashboardData]);

  return (
    <div className="space-y-8 mt-4">
      {/* A. Creator Analyz */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Creator Analyz</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1F1F23] text-[#8E8E95] text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Creator Name</th><th className="py-3 px-3 text-right">GMV</th><th className="py-3 px-3 text-right">Items Sold</th><th className="py-3 px-3 text-right">AOV</th><th className="py-3 px-3 text-right">Avg/Sold</th><th className="py-3 px-3 text-right">Videos</th><th className="py-3 px-3 text-right">LIVE</th><th className="py-3 px-3 text-right">Est. Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23] text-zinc-300">
              {affiliates.slice(0, 20).map((a) => (
                <tr key={a.creator} className="hover:bg-[#1C1C21]/30">
                  <td className="py-3 px-3 font-semibold text-white">@{a.creator}</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(a.gmv)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(a.itemsSold)}</td>
                  <td className="py-3 px-3 text-right">{a.itemsSold > 0 ? formatCurrency(a.gmv / a.itemsSold) : "-"}</td>
                  <td className="py-3 px-3 text-right">{(a.itemsSold / Math.max(1, a.videos + a.lives)).toFixed(1)}</td>
                  <td className="py-3 px-3 text-right">{a.videos}</td>
                  <td className="py-3 px-3 text-right">{a.lives}</td>
                  <td className="py-3 px-3 text-right font-bold text-violet-400">{formatCurrency(a.commission)}</td>
                </tr>
              ))}
              {affiliates.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-[#8E8E95]">No affiliate data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* B. Product Analyz */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Product Analyz (Jalur Afiliasi)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1F1F23] text-[#8E8E95] text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Product Name</th><th className="py-3 px-3 text-right">Orders</th><th className="py-3 px-3 text-right">Videos Post</th><th className="py-3 px-3 text-right">LIVE Streams</th><th className="py-3 px-3 text-right">Est. Commission</th><th className="py-3 px-3 text-right">Sample</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23] text-zinc-300">
              {affiliateProducts.slice(0, 15).map((p, i) => (
                <tr key={i} className="hover:bg-[#1C1C21]/30">
                  <td className="py-3 px-3 font-semibold text-white max-w-xs truncate">{p.name}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(p.orders)}</td>
                  <td className="py-3 px-3 text-right">{p.videos}</td>
                  <td className="py-3 px-3 text-right">{p.lives}</td>
                  <td className="py-3 px-3 text-right font-bold text-violet-400">{formatCurrency(p.commission)}</td>
                  <td className="py-3 px-3 text-right">{Math.floor(p.orders / 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* C. Sample & Shipping */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Sample & Shipping</h3>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { label: "Sample Requested ID", value: "SMP-7824" },
            { label: "Creator Name", value: "@creator_sample" },
            { label: "Shipping Status", value: "Sent", color: "text-emerald-400" },
            { label: "Video Link Verification Rate", value: "87.5%", color: "text-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="text-xs text-[#8E8E95]">{item.label}</span>
              <span className={cn("text-sm font-semibold text-white", item.color)}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* D. Commission */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Commission</h3>
        <div className="grid gap-6 lg:grid-cols-4">
          {[
            { label: "Commission Plan Type", value: "Open" },
            { label: "Commission Rate%", value: "8%" },
            { label: "Total Paid Out", value: formatCurrency(affiliates.reduce((s, a) => s + a.commission, 0)) },
            { label: "Affiliate ROI Multiplier", value: `${(totalAffiliateGMV(dashboardData) / Math.max(1, affiliates.reduce((s, a) => s + a.commission, 0))).toFixed(2)}x` },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="text-xs text-[#8E8E95]">{item.label}</span>
              <span className="text-sm font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function totalAffiliateGMV(dashboardData: DashboardData): number {
  const fromVideos = dashboardData.videos.filter((v) => v.type === "Affiliate").reduce((s, v) => s + v.gmv, 0);
  const fromLives = dashboardData.lives.filter((l) => l.type === "Affiliate").reduce((s, l) => s + l.gmv, 0);
  return fromVideos + fromLives;
}
