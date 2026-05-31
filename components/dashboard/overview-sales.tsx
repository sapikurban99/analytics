"use client";

import React from "react";
import { DollarSign, ShoppingBag, Users, Percent, TrendingUp, Coins } from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import TrendChart from "@/components/ui/trend-chart";
import { formatCurrency } from "@/lib/format";
import { DashboardData } from "@/lib/db";

interface Props {
  dashboardData: DashboardData;
}

export default function OverviewSales({ dashboardData }: Props) {
  const gmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;
  const orders = dashboardData.overview.find((m) => m.key === "orders")?.value || 0;
  const visitors = dashboardData.overview.find((m) => m.key === "visitors")?.value || 0;
  const cvr = visitors > 0 ? orders / visitors : 0;
  const aov = orders > 0 ? gmv / orders : 0;
  const adsCost = dashboardData.ads.summary.cost;
  const roas = adsCost > 0 ? gmv / adsCost : 0;

  const gmvGrowth = dashboardData.overview.find((m) => m.key === "gmv")?.growth || 0;
  const ordersGrowth = dashboardData.overview.find((m) => m.key === "orders")?.growth || 0;
  const visitorsGrowth = dashboardData.overview.find((m) => m.key === "visitors")?.growth || 0;

  const shopeeVal = dashboardData.products.reduce((s, p) => s + p.shopeeGmv, 0);
  const tiktokVal = dashboardData.products.reduce((s, p) => s + p.tiktokGmv, 0);
  const websiteVal = dashboardData.products.reduce((s, p) => s + p.websiteGmv, 0);

  return (
    <div className="space-y-8 mt-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Performance Sales</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <MetricCard label="Total Revenue" value={gmv} growth={gmvGrowth} format="currency" icon={DollarSign} />
          <MetricCard label="Total Orders" value={orders} growth={ordersGrowth} format="number" icon={ShoppingBag} />
          <MetricCard label="Total Visitor" value={visitors} growth={visitorsGrowth} format="number" icon={Users} />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
          <MetricCard label="Cr%" value={cvr} format="percent" icon={Percent} description="Conversion Rate lintas channel" />
          <MetricCard label="AOV" value={aov} format="currency" icon={Coins} description="Average Order Value" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueDonut label="Revenue per Channel" segments={[
          { label: "Shopee", value: shopeeVal, color: "#EE4D2D" },
          { label: "TikTok", value: tiktokVal, color: "var(--foreground)" },
          { label: "Website", value: websiteVal, color: "#10B981" },
        ]} />
        <RevenueDonut label="Ads per Channel" segments={[
          { label: "Shopee Ads", value: dashboardData.ads.shopee.reduce((s, a) => s + a.cost, 0), color: "#EE4D2D" },
          { label: "TikTok Ads", value: dashboardData.ads.tiktokLive.reduce((s, a) => s + a.cost, 0) + dashboardData.ads.tiktokProduct.reduce((s, a) => s + a.cost, 0), color: "var(--foreground)" },
          { label: "Meta Ads", value: Math.max(0, adsCost - dashboardData.ads.shopee.reduce((s, a) => s + a.cost, 0) - (dashboardData.ads.tiktokLive.reduce((s, a) => s + a.cost, 0) + dashboardData.ads.tiktokProduct.reduce((s, a) => s + a.cost, 0))), color: "#1877F2" },
        ]} />
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Grafik Tren — Revenue, Orders, Visitor</h3>
        <div className="grid gap-6">
          <TrendChart dataPoints={dashboardData.dailyTrends} platform="All" metric="gmv" title="Revenue" className="h-72" />
          <TrendChart dataPoints={dashboardData.dailyTrends} platform="All" metric="orders" title="Orders" className="h-72" />
          <TrendChart dataPoints={dashboardData.dailyTrends} platform="All" metric="visitors" title="Visitor" className="h-72" />
        </div>
      </div>
    </div>
  );
}

function RevenueDonut({ label, segments }: { label: string; segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">{label}</h3>
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
            {segments.map((seg, i) => {
              const pct = total > 0 ? (seg.value / total) * 100 : 0;
              const offset = segments.slice(0, i).reduce((s, prev) => s + (total > 0 ? (prev.value / total) * 100 : 0), 0);
              return (
                <circle
                  key={seg.label}
                  cx="18" cy="18" r="15.5"
                  fill="none" stroke={seg.color} strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeDashoffset={`${-offset}`}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-3 flex-1">
          {segments.map((seg) => {
            const pct = total > 0 ? (seg.value / total) * 100 : 0;
            return (
              <div key={seg.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-sm">{seg.label}</span>
                <span className="text-sm font-bold ml-auto">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
