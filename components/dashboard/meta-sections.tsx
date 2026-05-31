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
        Data {type} belum tersedia. Upload file dari Meta Ads Manager.
      </p>
    </div>
  </div>
);

export function MetaCPAS({ dashboardData }: Props) {
  const { cost, purchase, items } = dashboardData.ads.meta.cpas;
  const roas = cost > 0 ? purchase / cost : 0;

  if (cost === 0 && purchase === 0) return <EmptyMeta type="Meta CPAS" />;

  return (
    <div className="space-y-8 mt-4">
      <h2 className="text-lg font-bold text-foreground">Meta CPAS</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Amount Spent (IDR)" value={cost} format="currency" icon={DollarSign} />
        <MetricCard label="Purchase" value={purchase} format="currency" icon={TrendingUp} />
        <MetricCard label="Purchases Items" value={items} format="number" icon={ShoppingBag} />
        <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
      </div>
    </div>
  );
}

export function MetaWebsite({ dashboardData }: Props) {
  const { cost, purchase, items } = dashboardData.ads.meta.website;
  const roas = cost > 0 ? purchase / cost : 0;

  if (cost === 0 && purchase === 0) return <EmptyMeta type="Meta Website" />;

  return (
    <div className="space-y-8 mt-4">
      <h2 className="text-lg font-bold text-foreground">Meta Website</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Amount Spent (IDR)" value={cost} format="currency" icon={DollarSign} />
        <MetricCard label="Purchase" value={purchase} format="currency" icon={TrendingUp} />
        <MetricCard label="Purchases Items" value={items} format="number" icon={ShoppingBag} />
        <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
      </div>
    </div>
  );
}

export function MetaTraffic({ dashboardData }: Props) {
  const { cost, reach, impressions, link_clicks, cpm, cpr } = dashboardData.ads.meta.traffic;

  if (cost === 0) return <EmptyMeta type="Meta Traffic" />;

  return (
    <div className="space-y-8 mt-4">
      <h2 className="text-lg font-bold text-foreground">Meta Traffic</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Amount Spent (IDR)" value={cost} format="currency" icon={DollarSign} />
        <MetricCard label="Reach" value={reach} format="number" icon={Users} />
        <MetricCard label="Impression" value={impressions} format="number" icon={Eye} />
        <MetricCard label="CPM" value={cpm} format="currency" icon={TrendingUp} description="(Spent / Impression) × 1.000" />
        <MetricCard label="Link Clicks" value={link_clicks} format="number" icon={MousePointerClick} />
        <MetricCard label="Cpr" value={cpr} format="currency" icon={DollarSign} description="Spent / Link Click" />
      </div>
    </div>
  );
}
