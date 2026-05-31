"use client";

import React, { useMemo } from "react";
import { DollarSign, ShoppingBag, Users, Percent, TrendingUp, Coins } from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import TrendChart from "@/components/ui/trend-chart";
import { formatCurrency, formatNumber } from "@/lib/format";
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

  return (
    <div className="space-y-8 mt-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Scorecard Performance Sales</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Total Revenue" value={gmv} growth={gmvGrowth} format="currency" icon={DollarSign} />
          <MetricCard label="Total Orders" value={orders} growth={ordersGrowth} format="number" icon={ShoppingBag} />
          <MetricCard label="Total Visitor" value={visitors} growth={visitorsGrowth} format="number" icon={Users} />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
          <MetricCard label="Cr%" value={cvr} format="percent" icon={Percent} description="Conversion Rate lintas channel" />
          <MetricCard label="AOV" value={aov} format="currency" icon={Coins} description="Average Order Value" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Scorecard Performance Ads</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Revenue" value={gmv} format="currency" icon={DollarSign} description="Mirroring dari baris kesatu" />
          <MetricCard label="Total Ads Spend" value={adsCost} format="currency" icon={TrendingUp} description="Akumulasi biaya iklan gabungan" />
          <MetricCard label="Total Orders" value={orders} format="number" icon={ShoppingBag} description="Mirroring dari baris kesatu" />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} description="Revenue / Spend" />
        </div>
      </div>

      <RevenueDonut dashboardData={dashboardData} />

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Grafik Tren Daily — Revenue, Orders, Visitor</h3>
        <TrendChart dataPoints={dashboardData.dailyTrends} platform="All" />
      </div>
    </div>
  );
}

function RevenueDonut({ dashboardData }: { dashboardData: DashboardData }) {
  const shopeeVal = dashboardData.products.reduce((s, p) => s + p.shopeeGmv, 0);
  const tiktokVal = dashboardData.products.reduce((s, p) => s + p.tiktokGmv, 0);
  const websiteVal = dashboardData.products.reduce((s, p) => s + p.websiteGmv, 0);
  const total = shopeeVal + tiktokVal + websiteVal;
  const sPct = total > 0 ? (shopeeVal / total) * 100 : 0;
  const tPct = total > 0 ? (tiktokVal / total) * 100 : 0;
  const wPct = total > 0 ? (websiteVal / total) * 100 : 0;

  const totalAd = dashboardData.ads.summary.cost;
  const shpAd = dashboardData.ads.shopee.reduce((s, a) => s + a.cost, 0);
  const ttsAd = dashboardData.ads.tiktokLive.reduce((s, a) => s + a.cost, 0) + dashboardData.ads.tiktokProduct.reduce((s, a) => s + a.cost, 0);
  const metaAd = Math.max(0, totalAd - shpAd - ttsAd);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Revenue per Channel</h3>
        <div className="flex items-center gap-8">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EE4D2D" strokeWidth="3" strokeDasharray={`${sPct} ${100 - sPct}`} strokeDashoffset="0" strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--foreground)" strokeWidth="3" strokeDasharray={`${tPct} ${100 - tPct}`} strokeDashoffset={`${-sPct}`} strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${wPct} ${100 - wPct}`} strokeDashoffset={`${-(sPct + tPct)}`} strokeLinecap="round" />
            </svg>
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#EE4D2D]" /><span className="text-sm">Shopee</span><span className="text-sm font-bold ml-auto">{sPct.toFixed(1)}%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-foreground" /><span className="text-sm">TikTok</span><span className="text-sm font-bold ml-auto">{tPct.toFixed(1)}%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-sm">Website</span><span className="text-sm font-bold ml-auto">{wPct.toFixed(1)}%</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Ads per Channel</h3>
        <div className="flex items-center gap-8">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EE4D2D" strokeWidth="3" strokeDasharray={`${totalAd > 0 ? (shpAd / totalAd) * 100 : 0} ${100}`} strokeDashoffset="0" strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--foreground)" strokeWidth="3" strokeDasharray={`${totalAd > 0 ? (ttsAd / totalAd) * 100 : 0} ${100}`} strokeDashoffset={`${totalAd > 0 ? -(shpAd / totalAd) * 100 : 0}`} strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1877F2" strokeWidth="3" strokeDasharray={`${totalAd > 0 ? (metaAd / totalAd) * 100 : 0} ${100}`} strokeDashoffset={`${totalAd > 0 ? -((shpAd + ttsAd) / totalAd) * 100 : 0}`} strokeLinecap="round" />
            </svg>
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#EE4D2D]" /><span className="text-sm">Shopee Ads</span><span className="text-sm font-bold ml-auto">{totalAd > 0 ? ((shpAd / totalAd) * 100).toFixed(1) : 0}%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-foreground" /><span className="text-sm">TikTok Ads</span><span className="text-sm font-bold ml-auto">{totalAd > 0 ? ((ttsAd / totalAd) * 100).toFixed(1) : 0}%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1877F2]" /><span className="text-sm">Meta Ads</span><span className="text-sm font-bold ml-auto">{totalAd > 0 ? ((metaAd / totalAd) * 100).toFixed(1) : 0}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
