"use client";

import React from "react";
import { DollarSign, TrendingUp, Eye, MousePointerClick, Users, ShoppingBag } from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { DashboardData } from "@/lib/db";

interface Props {
  dashboardData: DashboardData;
}

const EmptyMeta = ({ type }: { type: string }) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mt-4">
    <div className="rounded-xl border border-muted bg-muted/20 p-6 text-center">
      <p className="text-muted-foreground text-sm">
        Data {type} belum tersedia. Upload file dari Meta Ads Manager untuk melihat metrik.
      </p>
    </div>
  </div>
);

export function MetaCPAS({ dashboardData }: Props) {
  const metaGmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;
  const metaOrders = dashboardData.overview.find((m) => m.key === "orders")?.value || 0;
  const metaCost = dashboardData.ads.summary.cost;
  const roas = metaCost > 0 ? metaGmv / metaCost : 0;

  if (metaCost === 0 && metaGmv === 0) return <EmptyMeta type="Meta CPAS" />;

  return (
    <div className="space-y-8 mt-4">
      <h2 className="text-lg font-bold text-foreground">Meta CPAS</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Amount Spent (IDR)" value={metaCost} format="currency" icon={DollarSign} />
        <MetricCard label="Purchase" value={metaGmv} format="currency" icon={TrendingUp} />
        <MetricCard label="Purchases Items" value={metaOrders} format="number" icon={ShoppingBag} />
        <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
      </div>
    </div>
  );
}

export function MetaWebsite({ dashboardData }: Props) {
  const metaGmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;
  const metaOrders = dashboardData.overview.find((m) => m.key === "orders")?.value || 0;
  const metaCost = dashboardData.ads.summary.cost;
  const roas = metaCost > 0 ? metaGmv / metaCost : 0;

  if (metaCost === 0 && metaGmv === 0) return <EmptyMeta type="Meta Website" />;

  return (
    <div className="space-y-8 mt-4">
      <h2 className="text-lg font-bold text-foreground">Meta Website</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Amount Spent (IDR)" value={metaCost} format="currency" icon={DollarSign} />
        <MetricCard label="Purchase" value={metaGmv} format="currency" icon={TrendingUp} />
        <MetricCard label="Purchases Items" value={metaOrders} format="number" icon={ShoppingBag} />
        <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
      </div>
    </div>
  );
}

export function MetaTraffic({ dashboardData }: Props) {
  const metaCost = dashboardData.ads.summary.cost;
  const metaGmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;
  const metaClicks = dashboardData.overview.find((m) => m.key === "clicks")?.value || 0;
  const impressions = dashboardData.ads.tiktokLive.reduce((s, a) => s + (a as any).impressions || 0, 0) +
    dashboardData.ads.tiktokProduct.reduce((s, a) => s + (a as any).impressions || 0, 0);

  if (metaCost === 0 && metaGmv === 0) return <EmptyMeta type="Meta Traffic" />;

  const cpm = impressions > 0 ? (metaCost / impressions) * 1000 : 0;
  const cpr = metaClicks > 0 ? metaCost / metaClicks : 0;

  return (
    <div className="space-y-8 mt-4">
      <h2 className="text-lg font-bold text-foreground">Meta Traffic</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Amount Spent (IDR)" value={metaCost} format="currency" icon={DollarSign} />
        <MetricCard label="Impression" value={impressions} format="number" icon={Eye} />
        <MetricCard label="Link Clicks" value={metaClicks} format="number" icon={MousePointerClick} />
        <MetricCard label="CPM" value={cpm} format="currency" icon={TrendingUp} description="(Spend / Impression) × 1.000" />
        <MetricCard label="CPR" value={cpr} format="currency" icon={DollarSign} description="Spend / Link Click" />
        <MetricCard label="Reach" value={0} format="number" icon={Users} description="Menunggu data reach" />
      </div>
    </div>
  );
}
