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
import { formatCurrency, formatNumber } from "@/lib/format";
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
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Financial KPI</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <MetricCard label="Revenue" value={gmv} format="currency" icon={DollarSign} />
          <MetricCard label="Spend Ads" value={adsCost} format="currency" icon={TrendingUp} />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Operational KPI</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Orders" value={orders} format="number" icon={ShoppingBag} />
          <MetricCard label="Items Sold" value={itemsSold} format="number" icon={Store} />
          <MetricCard label="Visitors" value={visitors} format="number" icon={Users} />
          <MetricCard label="Conversion Rate" value={cvr} format="percent" icon={Percent} />
          <MetricCard label="AOV" value={aov} format="currency" icon={Coins} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Grafik Tren Daily Shopee</h3>
        <TrendChart dataPoints={dashboardData.dailyTrends} platform="Shopee" />
      </div>
    </div>
  );
}

/* ====== #2 SHOPEE PRODUCT ANALYZ ====== */
export function ShopeeProductAnalyz({ dashboardData }: Props) {
  const shopeeProducts = dashboardData.products.filter((p) => p.shopeeGmv > 0);

  const columns = useMemo<ColumnDef<ConsolidatedProduct>[]>(() => [
    { key: "name", header: "Product Name", sortable: true, render: (p) => <div className="max-w-xs"><p className="truncate font-semibold text-foreground" title={p.name}>{p.name}</p></div> },
    { key: "shopeeGmv", header: "Revenue", sortable: true, align: "right", render: (p) => <span className="font-semibold text-rose-500">{formatCurrency(p.shopeeGmv)}</span> },
    { key: "shopeeItemsSold", header: "Items Sold", sortable: true, align: "right", render: (p) => <span>{formatNumber(p.shopeeItemsSold)}</span> },
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
  const orders = dashboardData.overview.find((m) => m.key === "orders")?.value || 0;
  const visitors = dashboardData.overview.find((m) => m.key === "visitors")?.value || 0;

  return (
    <div className="space-y-8 mt-4">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-2">Total Omzet Shopee</h3>
        <p className="text-3xl font-bold text-foreground mb-6">{formatCurrency(gmv)}</p>

        <div className="grid gap-6 sm:grid-cols-3 mb-6">
          <MetricCard label="Orders" value={orders} format="number" icon={ShoppingBag} />
          <MetricCard label="Visitors" value={visitors} format="number" icon={Users} />
          <MetricCard label="AOV" value={orders > 0 ? gmv / orders : 0} format="currency" icon={Coins} />
        </div>

        <div className="rounded-xl border border-muted bg-muted/20 p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Breakdown revenue per channel (Product Card, Seller Live, Seller Video, Affiliate) membutuhkan data channel-level dari Shopee Seller Center.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ====== #4 SHOPEE AFFILIATE ANALYZ ====== */
export function ShopeeAffiliateAnalyz({ dashboardData: _dashboardData }: Props) {
  return (
    <div className="space-y-8 mt-4">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Affiliate Analyz (KOL Shopee Share)</h3>
        <div className="rounded-xl border border-muted bg-muted/20 p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Data afiliasi Shopee (KOL Shopee Share) belum tersedia. Upload laporan afiliasi dari Shopee Seller Center untuk melihat performa jaringan KOL.
          </p>
        </div>
      </div>
    </div>
  );
}
