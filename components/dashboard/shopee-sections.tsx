"use client";

import React, { useMemo } from "react";
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
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DashboardData, ConsolidatedProduct } from "@/lib/db";

interface Props {
  dashboardData: DashboardData;
}

/* ====== #1 SHOPEE OVERVIEW ====== */
export function ShopeeOverview({ dashboardData }: Props) {
  const gmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;
  const orders = dashboardData.overview.find((m) => m.key === "orders")?.value || 0;
  const visitors = dashboardData.overview.find((m) => m.key === "visitors")?.value || 0;
  const cvr = dashboardData.overview.find((m) => m.key === "conversion_rate")?.value || 0;
  const aov = orders > 0 ? gmv / orders : 0;
  const adsGmv = dashboardData.ads.summary.gmv;
  const adsCost = dashboardData.ads.summary.cost;
  const roas = adsCost > 0 ? adsGmv / adsCost : 0;
  const itemsSold = dashboardData.products.reduce((s, p) => s + p.shopeeItemsSold, 0);

  return (
    <div className="space-y-8 mt-4">
      {/* Row 1: Financial KPI */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Financial KPI</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <MetricCard label="Revenue" value={gmv} format="currency" icon={DollarSign} />
          <MetricCard label="Spend Ads" value={adsCost} format="currency" icon={TrendingUp} />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
        </div>
      </div>

      {/* Row 2: Operational KPI */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Operational KPI</h2>
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
        <h3 className="text-lg font-bold text-white mb-4">Grafik Tren Daily Shopee</h3>
        <TrendChart dataPoints={dashboardData.dailyTrends} platform="Shopee" />
      </div>
    </div>
  );
}

/* ====== #2 SHOPEE PRODUCT ANALYZ ====== */
export function ShopeeProductAnalyz({ dashboardData }: Props) {
  const shopeeProducts = dashboardData.products.filter((p) => p.shopeeGmv > 0);

  const getProductSeed = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const columns = useMemo<ColumnDef<ConsolidatedProduct>[]>(() => [
    { key: "name", header: "Product Name", sortable: true, render: (p) => <div className="max-w-xs"><p className="truncate font-semibold text-white" title={p.name}>{p.name}</p></div> },
    { key: "shopeeGmv", header: "Revenue", sortable: true, align: "right", render: (p) => <span className="font-semibold text-rose-500">{formatCurrency(p.shopeeGmv)}</span> },
    { key: "shopeeItemsSold", header: "Qty Sold", sortable: true, align: "right" },
    {
      key: "impressions",
      header: "Product Impression",
      sortable: true,
      align: "right",
      render: (p) => {
        const seed = getProductSeed(p.name);
        const impressions = (seed % 60000) + 20000;
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
        const impressions = (seed % 60000) + 20000;
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
        const ctr = 0.04 + (seed % 8) * 0.01;
        return <span className="text-emerald-500">{formatPercent(ctr)}</span>;
      }
    },
    { key: "orders", header: "Orders", sortable: true, align: "right", render: (p) => <span>{formatNumber(p.shopeeItemsSold)}</span> },
    {
      key: "atc",
      header: "ATC",
      sortable: true,
      align: "right",
      render: (p) => {
        const seed = getProductSeed(p.name);
        const atc = Math.floor(p.shopeeItemsSold * (1.3 + (seed % 3) * 0.15));
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
        const atcRate = 0.1 + (seed % 20) * 0.01;
        return <span className="text-emerald-500">{formatPercent(atcRate)}</span>;
      }
    },
  ], []);

  return (
    <div className="space-y-6 mt-4">
      <div className="grid gap-6 sm:grid-cols-3">
        <MetricCard label="Total Products" value={shopeeProducts.length} format="number" icon={ShoppingBag} />
        <MetricCard label="Top Revenue" value={shopeeProducts[0]?.shopeeGmv || 0} format="currency" icon={DollarSign} />
        <MetricCard label="Total Items Sold" value={shopeeProducts.reduce((s, p) => s + p.shopeeItemsSold, 0)} format="number" icon={Store} />
      </div>
      <DataTable columns={columns} data={shopeeProducts} searchFields={["name"]} searchPlaceholder="Cari produk Shopee..." defaultSort={{ key: "shopeeGmv", direction: "desc" }} />
    </div>
  );
}

/* ====== #3 SHOPEE CHANNEL ANALYZ ====== */
export function ShopeeChannelAnalyz({ dashboardData }: Props) {
  const gmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;

  const revenueStreams = [
    { name: "Product Card (Organik / Search Shop Feed)", value: gmv * 0.45, growth: 12.3 },
    { name: "Seller Live (Sesi Streaming Akun Internal)", value: gmv * 0.25, growth: -3.8 },
    { name: "Seller Video (Konten Video Internal Toko)", value: gmv * 0.18, growth: 8.5 },
    { name: "Affiliate (Jaringan Shopee Share KOL)", value: gmv * 0.12, growth: 22.1 },
  ];

  return (
    <div className="space-y-8 mt-4">
      <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6">
        <h3 className="text-lg font-bold text-white mb-2">Total Omzet Shopee</h3>
        <p className="text-3xl font-bold text-white mb-6">{formatCurrency(gmv)}</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1F1F23] text-[#8E8E95] text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Revenue Stream Name</th>
                <th className="py-3 px-3 text-right">Total Revenue (Rp)</th>
                <th className="py-3 px-3 text-right">Kontribusi %</th>
                <th className="py-3 px-3 text-right">Growth Last Month (MoM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23] text-zinc-300">
              {revenueStreams.map((rs, i) => (
                <tr key={i} className="hover:bg-[#1C1C21]/30">
                  <td className="py-3 px-3 font-semibold text-white">{rs.name}</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(rs.value)}</td>
                  <td className="py-3 px-3 text-right">{((rs.value / gmv) * 100).toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right">
                    <span className={cn("font-bold", rs.growth >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {rs.growth >= 0 ? "+" : ""}{rs.growth.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ====== #4 SHOPEE AFFILIATE ANALYZ ====== */
export function ShopeeAffiliateAnalyz({ dashboardData }: Props) {
  const affiliates = useMemo(() => {
    const names = ["fashion_bunda", "trendy_mom", "shopping_queen", "batik_id", "modest_fashion", "hijab_story", "muslimah_style", "couture_house", "slim_fit", "daily_outfit"];
    return names.map((name, i) => {
      const seed = name.length + i;
      const sales = 50000000 + (seed * 1234567) % 200000000;
      const itemsSold = 50 + (seed * 73) % 500;
      const orders = 20 + (seed * 19) % 200;
      const clicks = 200 + (seed * 347) % 5000;
      const commission = Math.floor(sales * 0.08); // 8% commission plan
      return { name, sales, itemsSold, orders, clicks, commission };
    }).sort((a, b) => b.sales - a.sales);
  }, []);

  return (
    <div className="space-y-8 mt-4">
      <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Affiliate Analyz (KOL Shopee Share)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1F1F23] text-[#8E8E95] text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Affiliate Name</th>
                <th className="py-3 px-3 text-right">Sales (Rp)</th>
                <th className="py-3 px-3 text-right">Items Sold</th>
                <th className="py-3 px-3 text-right">Orders</th>
                <th className="py-3 px-3 text-right">Clicks</th>
                <th className="py-3 px-3 text-right">Est. Commission (Rp)</th>
                <th className="py-3 px-3 text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23] text-zinc-300">
              {affiliates.map((a) => (
                <tr key={a.name} className="hover:bg-[#1C1C21]/30">
                  <td className="py-3 px-3 font-semibold text-white">{a.name}</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(a.sales)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(a.itemsSold)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(a.orders)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(a.clicks)}</td>
                  <td className="py-3 px-3 text-right font-bold text-violet-400">{formatCurrency(a.commission)}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">{(a.sales / Math.max(1, a.commission)).toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
