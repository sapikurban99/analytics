"use client";

import React from "react";
import {
  Globe,
  Users,
  Mail,
  MessageCircle,
  ExternalLink,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import { formatCurrency, formatNumber } from "@/lib/format";

/* ====== WEBSITE OVERVIEW ====== */
export function WebsiteOverview() {
  const utmSources = [
    { source: "Direct", visitors: 12500, orders: 420, revenue: 187500000, conversion: 3.36 },
    { source: "Google SEO", visitors: 34200, orders: 890, revenue: 425000000, conversion: 2.60 },
    { source: "Email", visitors: 5800, orders: 310, revenue: 156000000, conversion: 5.34 },
    { source: "CRM WhatsApp", visitors: 2100, orders: 185, revenue: 98700000, conversion: 8.81 },
  ];

  return (
    <div className="space-y-8 mt-4">
      <h2 className="text-lg font-bold text-foreground">Website Overview (D2C)</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Visitors" value={utmSources.reduce((s, u) => s + u.visitors, 0)} format="number" icon={Users} />
        <MetricCard label="Total Orders" value={utmSources.reduce((s, u) => s + u.orders, 0)} format="number" icon={TrendingUp} />
        <MetricCard label="Total Revenue" value={utmSources.reduce((s, u) => s + u.revenue, 0)} format="currency" icon={DollarSign} />
        <MetricCard label="Avg CVR" value={5.03} format="percent" icon={TrendingUp} description="Weighted average" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">UTM Source Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3 text-right">Visitors</th>
                <th className="py-3 px-3 text-right">Orders</th>
                <th className="py-3 px-3 text-right">Revenue</th>
                <th className="py-3 px-3 text-right">CVR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {utmSources.map((s) => (
                <tr key={s.source} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {s.source === "Direct" && <Globe className="h-4 w-4 text-muted-foreground" />}
                      {s.source === "Google SEO" && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
                      {s.source === "Email" && <Mail className="h-4 w-4 text-muted-foreground" />}
                      {s.source === "CRM WhatsApp" && <MessageCircle className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-semibold text-foreground">{s.source}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">{formatNumber(s.visitors)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(s.orders)}</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(s.revenue)}</td>
                  <td className="py-3 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">{s.conversion.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ====== META ADS PERFORMANCE ====== */
export function MetaAdsPerformance() {
  const metrics = [
    { label: "Spend Meta Ads", value: 9200000, format: "currency" as const },
    { label: "Impression", value: 245000, format: "number" as const },
    { label: "Reach", value: 182000, format: "number" as const },
    { label: "Link Clicks", value: 8900, format: "number" as const },
    { label: "CPR", value: 28750, format: "currency" as const, description: "Cost per Result" },
    { label: "Landing Page Views", value: 7200, format: "number" as const },
    { label: "Attributed Sales via Pixel", value: 48250000, format: "currency" as const },
  ];

  return (
    <div className="space-y-8 mt-4">
      <h2 className="text-lg font-bold text-foreground">Meta Ads Performance</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.slice(0, 4).map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} format={m.format} />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.slice(4).map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} format={m.format} description={(m as any).description} />
        ))}
      </div>
    </div>
  );
}
