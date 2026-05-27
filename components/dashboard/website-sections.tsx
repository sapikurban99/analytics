"use client";

import React, { useMemo } from "react";
import { DollarSign, TrendingUp, ShoppingBag, Store, Users, Percent } from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import TrendChart from "@/components/ui/trend-chart";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency, formatNumber } from "@/lib/format";
import { DashboardData } from "@/lib/db";

interface Props {
  dashboardData: DashboardData;
}

interface WebsiteProductRow {
  name: string;
  gmv: number;
  itemsSold: number;
}

/* ====== #1 WEBSITE OVERVIEW ====== */
export function WebsiteOverview({ dashboardData }: Props) {
  const gmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;
  const orders = dashboardData.overview.find((m) => m.key === "orders")?.value || 0;
  const visitors = dashboardData.overview.find((m) => m.key === "visitors")?.value || 0;
  const adsCost = dashboardData.ads.summary.cost;
  const roas = adsCost > 0 ? gmv / adsCost : 0;
  const cvr = visitors > 0 ? orders / visitors : 0;
  const aov = orders > 0 ? gmv / orders : 0;

  const gmvGrowth = dashboardData.overview.find((m) => m.key === "gmv")?.growth || 0;
  const ordersGrowth = dashboardData.overview.find((m) => m.key === "orders")?.growth || 0;

  return (
    <div className="space-y-8 mt-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Sales Overview</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Revenue" value={gmv} growth={gmvGrowth} format="currency" icon={DollarSign} />
          <MetricCard label="Orders" value={orders} growth={ordersGrowth} format="number" icon={ShoppingBag} />
          <MetricCard label="Spent Ads" value={adsCost} format="currency" icon={TrendingUp} />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Metriks Overview</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Conversion Rate" value={cvr} format="percent" icon={Percent} />
          <MetricCard label="AOV" value={aov} format="currency" icon={DollarSign} />
          <MetricCard label="Visitors" value={visitors} format="number" icon={Users} />
        </div>
      </div>

      <TrendChart dataPoints={dashboardData.dailyTrends} platform="Website" />
    </div>
  );
}

/* ====== #2 WEBSITE PRODUCT ANALYZ ====== */
export function WebsiteProductAnalyz({ dashboardData }: Props) {
  const products = useMemo(() => {
    return dashboardData.products
      .filter((p) => p.shopeeGmv === 0 && p.tiktokGmv === 0 && p.platformGmv > 0)
      .map((p) => ({ name: p.name, gmv: p.platformGmv, itemsSold: p.platformItemsSold }))
      .sort((a, b) => b.gmv - a.gmv);
  }, [dashboardData.products]);

  const columns = useMemo<ColumnDef<WebsiteProductRow>[]>(() => [
    { key: "name", header: "Product", sortable: true, render: (p) => <div className="max-w-xs"><p className="truncate font-semibold" title={p.name}>{p.name}</p></div> },
    { key: "gmv", header: "GMV", sortable: true, align: "right", render: (p) => <span className="font-semibold text-rose-500">{formatCurrency(p.gmv)}</span> },
    { key: "itemsSold", header: "Item Sold", sortable: true, align: "right", render: (p) => <span>{formatNumber(p.itemsSold)}</span> },
  ], []);

  return (
    <div className="space-y-6 mt-4">
      <div className="grid gap-6 sm:grid-cols-3">
        <MetricCard label="Total Products" value={products.length} format="number" icon={ShoppingBag} />
        <MetricCard label="Top Revenue" value={products[0]?.gmv || 0} format="currency" icon={DollarSign} />
        <MetricCard label="Total Items Sold" value={products.reduce((s, p) => s + p.itemsSold, 0)} format="number" icon={Store} />
      </div>
      <DataTable columns={columns} data={products} searchFields={["name"]} searchPlaceholder="Cari produk..." defaultSort={{ key: "gmv", direction: "desc" }} />
    </div>
  );
}
