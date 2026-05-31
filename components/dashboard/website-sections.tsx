"use client";

import React, { useMemo } from "react";
import { DollarSign, TrendingUp, ShoppingBag, Store } from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
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
  const adsCost = dashboardData.ads.summary.cost;
  const roas = adsCost > 0 ? gmv / adsCost : 0;

  const gmvGrowth = dashboardData.overview.find((m) => m.key === "gmv")?.growth || 0;
  const ordersGrowth = dashboardData.overview.find((m) => m.key === "orders")?.growth || 0;

  return (
    <div className="space-y-8 mt-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Sales Overview</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Revenue" value={gmv} growth={gmvGrowth} format="currency" icon={DollarSign} />
          <MetricCard label="Orders" value={orders} growth={ordersGrowth} format="number" icon={ShoppingBag} />
          <MetricCard label="Spent Ads" value={adsCost} format="currency" icon={TrendingUp} description="Dari Meta Website" />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} description="Revenue / Spent Ads" />
        </div>
      </div>
    </div>
  );
}

/* ====== #2 WEBSITE PRODUCT ANALYZ ====== */
export function WebsiteProductAnalyz({ dashboardData }: Props) {
  const products = useMemo(() => {
    return dashboardData.products
      .filter((p) => p.websiteGmv > 0 || p.websiteItemsSold > 0)
      .map((p) => ({ name: p.name, gmv: p.websiteGmv, itemsSold: p.websiteItemsSold }))
      .sort((a, b) => b.gmv - a.gmv);
  }, [dashboardData.products]);

  const totalRevenue = products.reduce((s, p) => s + p.gmv, 0);
  const totalItemsSold = products.reduce((s, p) => s + p.itemsSold, 0);

  const columns = useMemo<ColumnDef<WebsiteProductRow>[]>(() => [
    { key: "name", header: "Product", sortable: true, render: (p) => (
      <div className="max-w-xs"><p className="truncate font-semibold" title={p.name}>{p.name}</p></div>
    )},
    { key: "gmv", header: "GMV", sortable: true, align: "right", render: (p) => <span className="font-semibold text-rose-500">{formatCurrency(p.gmv)}</span> },
    { key: "itemsSold", header: "Item Sold", sortable: true, align: "right", render: (p) => <span>{formatNumber(p.itemsSold)}</span> },
  ], []);

  return (
    <div className="space-y-6 mt-4">
      <div className="grid gap-6 sm:grid-cols-2">
        <MetricCard label="Total Revenue" value={totalRevenue} format="currency" icon={DollarSign} />
        <MetricCard label="Total Item Sold" value={totalItemsSold} format="number" icon={Store} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Product List</h3>
        <DataTable columns={columns} data={products} searchFields={["name"]} searchPlaceholder="Cari produk..." defaultSort={{ key: "gmv", direction: "desc" }} />
      </div>
    </div>
  );
}
