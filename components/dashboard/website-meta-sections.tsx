"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
} from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { DashboardData } from "@/lib/db";

/* ====== WEBSITE OVERVIEW ====== */
export function WebsiteOverview({ dashboardData }: { dashboardData: DashboardData }) {
  const gmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;
  const orders = dashboardData.overview.find((m) => m.key === "orders")?.value || 0;
  const visitors = dashboardData.overview.find((m) => m.key === "visitors")?.value || 0;
  const cvr = visitors > 0 ? orders / visitors : 0;

  return (
    <div className="space-y-8 mt-4">
      <h2 className="text-lg font-bold text-foreground">Website Overview (D2C)</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Revenue" value={gmv} format="currency" icon={DollarSign} />
        <MetricCard label="Total Orders" value={orders} format="number" icon={TrendingUp} />
        <MetricCard label="Visitors" value={visitors} format="number" icon={Users} />
        <MetricCard label="Conversion Rate" value={cvr} format="percent" icon={TrendingUp} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Daily Website Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Revenue</th>
                <th className="py-3 px-3 text-right">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {dashboardData.dailyTrends.filter((d) => d.gmv > 0 || d.orders > 0).slice(0, 31).map((d) => (
                <tr key={d.date} className="hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 font-medium">{d.date}</td>
                  <td className="py-2 px-3 text-right font-semibold text-rose-500">{formatCurrency(d.gmv)}</td>
                  <td className="py-2 px-3 text-right">{formatNumber(d.orders)}</td>
                </tr>
              ))}
              {dashboardData.dailyTrends.filter((d) => d.gmv > 0 || d.orders > 0).length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No website data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ====== META ADS PERFORMANCE ====== */
export function MetaAdsPerformance({ dashboardData }: { dashboardData: DashboardData }) {
  const metaGmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;
  const metaOrders = dashboardData.overview.find((m) => m.key === "orders")?.value || 0;
  const metaClicks = dashboardData.overview.find((m) => m.key === "clicks")?.value || 0;
  const metaCost = dashboardData.ads.summary.cost;
  const metaRoi = dashboardData.ads.summary.roi;

  const metaImpressions = dashboardData.ads.tiktokLive.reduce((s, a) => s + (a as any).impressions || 0, 0);

  const hasData = metaCost > 0 || metaGmv > 0;

  return (
    <div className="space-y-8 mt-4">
      <h2 className="text-lg font-bold text-foreground">Meta Ads Performance</h2>

      {!hasData ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="rounded-xl border border-muted bg-muted/20 p-6 text-center">
            <p className="text-muted-foreground text-sm">
              Data Meta Ads belum tersedia. Upload laporan iklan dari Meta Ads Manager untuk melihat performa kampanye.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Spend Meta Ads" value={metaCost} format="currency" icon={DollarSign} />
            <MetricCard label="Meta Revenue" value={metaGmv} format="currency" icon={TrendingUp} />
            <MetricCard label="Orders" value={metaOrders} format="number" icon={TrendingUp} />
            <MetricCard label="ROI" value={metaRoi} format="number" icon={TrendingUp} renderValue={() => `${metaRoi.toFixed(2)}x`} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="Link Clicks" value={metaClicks} format="number" icon={MousePointerClick} />
            <MetricCard label="Impression" value={metaImpressions} format="number" icon={Eye} />
            <MetricCard label="CPR" value={metaOrders > 0 ? metaCost / metaOrders : 0} format="currency" icon={DollarSign} description="Cost per Result" />
          </div>
        </>
      )}
    </div>
  );
}
