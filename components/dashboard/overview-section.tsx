"use client";

import React, { useMemo } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Percent,
  TrendingUp,
  Coins,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import TrendChart from "@/components/ui/trend-chart";
import RoasGauge from "@/components/ui/roas-gauge";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DashboardData, ConsolidatedProduct } from "@/lib/db";

interface Props {
  dashboardData: DashboardData;
  selectedPlatform: string;
  filteredProducts: ConsolidatedProduct[];
  setFilteredProducts: (data: ConsolidatedProduct[]) => void;
}

export default function OverviewSection({ dashboardData, selectedPlatform, filteredProducts, setFilteredProducts }: Props) {
  const salesMetrics = useMemo(() => {
    const rev = dashboardData.overview.find((m) => m.key === "gmv");
    const ord = dashboardData.overview.find((m) => m.key === "orders");
    const vis = dashboardData.overview.find((m) => m.key === "visitors");
    const cvr = dashboardData.overview.find((m) => m.key === "conversion_rate");
    return { revenue: rev, orders: ord, visitors: vis, conversionRate: cvr };
  }, [dashboardData.overview]);

  const adsMetrics = useMemo(() => ({
    revenueAds: dashboardData.ads.summary.gmv,
    totalAdSpend: dashboardData.ads.summary.cost,
    roas: dashboardData.ads.summary.roi,
  }), [dashboardData.ads.summary]);

  const productColumns = useMemo<ColumnDef<ConsolidatedProduct>[]>(() => [
    { key: "name", header: "Product Name", sortable: true, render: (p: ConsolidatedProduct) => <div className="max-w-xs"><p className="truncate font-semibold text-foreground" title={p.name}>{p.name}</p></div> },
    { key: "status", header: "Status", sortable: true, align: "center" as const, render: (p: ConsolidatedProduct) => (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", p.status === "Active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>{p.status}</span>
    )},
    ...(selectedPlatform === "All" ? [
      { key: "shopeeGmv", header: "Shopee GMV", sortable: true, align: "right" as const, render: (p: ConsolidatedProduct) => <span className="text-muted-foreground">{formatCurrency(p.shopeeGmv)}</span> },
      { key: "tiktokGmv", header: "TikTok GMV", sortable: true, align: "right" as const, render: (p: ConsolidatedProduct) => <span className="text-muted-foreground">{formatCurrency(p.tiktokGmv)}</span> },
    ] : []),
    { key: "platformGmv", header: "Total Revenue", sortable: true, align: "right" as const, render: (p: ConsolidatedProduct) => <span className="font-semibold text-rose-500">{formatCurrency(p.platformGmv)}</span> },
    { key: "platformItemsSold", header: "Qty Sold", sortable: true, align: "right" as const, render: (p: ConsolidatedProduct) => <span>{formatNumber(p.platformItemsSold)}</span> },
  ], [selectedPlatform]);

  return (
    <div className="space-y-8 mt-4">
      {/* Section 2A: Scorecard Performance Sales */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Scorecard Performance Sales</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {salesMetrics.revenue && (
            <MetricCard label={salesMetrics.revenue.label} value={salesMetrics.revenue.value} growth={salesMetrics.revenue.growth} format="currency" icon={DollarSign} />
          )}
          {salesMetrics.orders && (
            <MetricCard label={salesMetrics.orders.label} value={salesMetrics.orders.value} growth={salesMetrics.orders.growth} format="number" icon={ShoppingBag} />
          )}
          {salesMetrics.visitors && (
            <MetricCard label={salesMetrics.visitors.label} value={salesMetrics.visitors.value} growth={salesMetrics.visitors.growth} format="number" icon={Users} />
          )}
          {salesMetrics.conversionRate && (
            <MetricCard label={salesMetrics.conversionRate.label} value={salesMetrics.conversionRate.value} growth={salesMetrics.conversionRate.growth} format="percent" icon={Percent} />
          )}
        </div>
      </div>

      {/* Section 2B: Scorecard Performance Ads */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Scorecard Performance Ads</h2>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
          <MetricCard label="Revenue Ads" value={adsMetrics.revenueAds} format="currency" icon={Coins} description="Revenue from paid traffic" />
          <MetricCard label="Total Ads Spend" value={adsMetrics.totalAdSpend} format="currency" icon={TrendingUp} description="Total advertising expenditure" />
          <MetricCard
            label="ROAS"
            value={adsMetrics.roas}
            format="number"
            icon={TrendingUp}
            description="Revenue / Spend efficiency"
            renderValue={() => `${adsMetrics.roas.toFixed(2)}x`}
          />
        </div>
      </div>

      {/* Performance Rating Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="rounded-full bg-emerald-500/20 p-2"><CheckCircle2 className="h-6 w-6 text-emerald-500" /></div>
          <div><h3 className="text-xl font-bold text-foreground">18 Produk</h3><p className="text-sm font-semibold text-emerald-500">Performa Bagus</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5">
          <div className="rounded-full bg-yellow-500/20 p-2"><AlertTriangle className="h-6 w-6 text-yellow-500" /></div>
          <div><h3 className="text-xl font-bold text-foreground">24 Produk</h3><p className="text-sm font-semibold text-yellow-500">Performa Sedang</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-5">
          <div className="rounded-full bg-red-500/20 p-2"><XCircle className="h-6 w-6 text-red-500" /></div>
          <div><h3 className="text-xl font-bold text-foreground">5 Produk</h3><p className="text-sm font-semibold text-red-500">Performa Buruk</p></div>
        </div>
      </div>

      {/* Section 2C: Daily Trend + Donuts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart dataPoints={dashboardData.dailyTrends} platform={selectedPlatform as "Shopee" | "TikTok" | "All" | "Meta"} />
        </div>
        <div className="flex flex-col gap-6">
          <RoasGauge value={dashboardData.ads.summary.roi || 5.4} target={10} className="h-full rounded-2xl" />
        </div>
      </div>

      {/* Donut Charts: Revenue Share & Ad Spend Share */}
      {selectedPlatform === "All" && <RevenueDonutChart dashboardData={dashboardData} />}

      {/* Product Performance Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground">Product Performance Tabel Pertumbuhan Produk</h3>
          <p className="text-sm text-muted-foreground mt-1">Audit pertumbuhan penjualan semua produk fashion wanita</p>
        </div>
        <DataTable
          columns={productColumns}
          data={dashboardData.products}
          searchFields={["name"]}
          searchPlaceholder="Cari nama produk (Regex)..."
          defaultSort={{ key: "platformGmv", direction: "desc" }}
          onFilteredDataChange={setFilteredProducts}
        />
      </div>
    </div>
  );
}

function RevenueDonutChart({ dashboardData }: { dashboardData: DashboardData }) {
  const allData = dashboardData;
  const tiktokGmv = allData.products.reduce((sum, p) => sum + p.tiktokGmv, 0);
  const shopeeVal = allData.products.reduce((sum, p) => sum + p.shopeeGmv, 0);
  const totalGmv = shopeeVal + tiktokGmv;
  const shopeePct = totalGmv > 0 ? (shopeeVal / totalGmv) * 100 : 0;
  const tiktokPct = totalGmv > 0 ? (tiktokGmv / totalGmv) * 100 : 0;
  const websitePct = Math.max(0, 100 - shopeePct - tiktokPct);

  const totalAdSpend = allData.ads.summary.cost;
  const shopeeAd = allData.ads.shopee.reduce((s, a) => s + a.cost, 0);
  const tiktokAd = (allData.ads.tiktokLive.reduce((s, a) => s + a.cost, 0) + allData.ads.tiktokProduct.reduce((s, a) => s + a.cost, 0));
  const adOther = Math.max(0, totalAdSpend - shopeeAd - tiktokAd);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Donut 1: Revenue Share */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Pangsa Pasar Revenue</h3>
        <div className="flex items-center gap-8">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EE4D2D" strokeWidth="3" strokeDasharray={`${shopeePct} ${100 - shopeePct}`} strokeDashoffset="0" strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--foreground)" strokeWidth="3" strokeDasharray={`${tiktokPct} ${100 - tiktokPct}`} strokeDashoffset={`${-shopeePct}`} strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${websitePct} ${100 - websitePct}`} strokeDashoffset={`${-(shopeePct + tiktokPct)}`} strokeLinecap="round" />
            </svg>
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#EE4D2D]" /><span className="text-sm text-foreground">Shopee</span><span className="text-sm font-bold text-foreground ml-auto">{shopeePct.toFixed(1)}%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-foreground" /><span className="text-sm text-foreground">TikTok</span><span className="text-sm font-bold text-foreground ml-auto">{tiktokPct.toFixed(1)}%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-sm text-foreground">Website</span><span className="text-sm font-bold text-foreground ml-auto">{websitePct.toFixed(1)}%</span></div>
          </div>
        </div>
      </div>

      {/* Donut 2: Ad Spend Share */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Alokasi Spend Ads</h3>
        <div className="flex items-center gap-8">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EE4D2D" strokeWidth="3" strokeDasharray={`${totalAdSpend > 0 ? (shopeeAd / totalAdSpend) * 100 : 0} ${100}`} strokeDashoffset="0" strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--foreground)" strokeWidth="3" strokeDasharray={`${totalAdSpend > 0 ? (tiktokAd / totalAdSpend) * 100 : 0} ${100}`} strokeDashoffset={`${totalAdSpend > 0 ? -(shopeeAd / totalAdSpend) * 100 : 0}`} strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1877F2" strokeWidth="3" strokeDasharray={`${totalAdSpend > 0 ? (adOther / totalAdSpend) * 100 : 0} ${100}`} strokeDashoffset={`${totalAdSpend > 0 ? -((shopeeAd + tiktokAd) / totalAdSpend) * 100 : 0}`} strokeLinecap="round" />
            </svg>
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#EE4D2D]" /><span className="text-sm text-foreground">Shopee Ads</span><span className="text-sm font-bold text-foreground ml-auto">{totalAdSpend > 0 ? ((shopeeAd / totalAdSpend) * 100).toFixed(1) : 0}%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-foreground" /><span className="text-sm text-foreground">TikTok Ads</span><span className="text-sm font-bold text-foreground ml-auto">{totalAdSpend > 0 ? ((tiktokAd / totalAdSpend) * 100).toFixed(1) : 0}%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1877F2]" /><span className="text-sm text-foreground">Meta Ads</span><span className="text-sm font-bold text-foreground ml-auto">{totalAdSpend > 0 ? ((adOther / totalAdSpend) * 100).toFixed(1) : 0}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
