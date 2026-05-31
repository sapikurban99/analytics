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
  Package,
} from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import TrendChart from "@/components/ui/trend-chart";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency, formatNumber, formatGrowth } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { DashboardData, ConsolidatedProduct, ShopeeAffiliateItem, ShopeeAdItem } from "@/lib/db";

interface Props {
  dashboardData: DashboardData;
}

function GrowthBadge({ growth }: { growth: number }) {
  if (growth === 0) {
    return <span className="flex items-center gap-0.5 text-[11px] font-bold text-muted-foreground"><Minus className="h-3 w-3" /></span>;
  }
  const isPositive = growth > 0;
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-bold ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {formatGrowth(growth)}
    </span>
  );
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

  const gmvGrowth = dashboardData.overview.find((m) => m.key === "gmv")?.growth || 0;
  const ordersGrowth = dashboardData.overview.find((m) => m.key === "orders")?.growth || 0;
  const visitorsGrowth = dashboardData.overview.find((m) => m.key === "visitors")?.growth || 0;

  return (
    <div className="space-y-8 mt-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Financial KPI</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <MetricCard label="Revenue" value={gmv} growth={gmvGrowth} format="currency" icon={DollarSign} />
          <MetricCard label="Spend Ads" value={adsCost} format="currency" icon={TrendingUp} />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Operational KPI / Metriks Overview</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Orders" value={orders} growth={ordersGrowth} format="number" icon={ShoppingBag} />
          <MetricCard label="Items Sold" value={itemsSold} format="number" icon={Store} />
          <MetricCard label="Visitors" value={visitors} growth={visitorsGrowth} format="number" icon={Users} />
          <MetricCard label="Conversion Rate" value={cvr} format="percent" icon={Percent} />
          <MetricCard label="AOV" value={aov} format="currency" icon={Coins} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Grafik Tren — Revenue, Orders, Visitor</h3>
        <div className="grid gap-6">
          <TrendChart dataPoints={dashboardData.dailyTrends} platform="Shopee" metric="gmv" title="Revenue" className="h-72" />
          <TrendChart dataPoints={dashboardData.dailyTrends} platform="Shopee" metric="orders" title="Orders" className="h-72" />
          <TrendChart dataPoints={dashboardData.dailyTrends} platform="Shopee" metric="visitors" title="Visitor" className="h-72" />
        </div>
      </div>
    </div>
  );
}

/* ====== #2 SHOPEE PRODUCT ANALYZ ====== */
export function ShopeeProductAnalyz({ dashboardData }: Props) {
  const shopeeProducts = useMemo(() => {
    return dashboardData.products
      .filter((p) => p.shopeeGmv > 0 || p.shopeeItemsSold > 0)
      .sort((a, b) => b.shopeeGmv - a.shopeeGmv);
  }, [dashboardData.products]);

  const totalRevenue = shopeeProducts.reduce((s, p) => s + p.shopeeGmv, 0);
  const totalItemsSold = shopeeProducts.reduce((s, p) => s + p.shopeeItemsSold, 0);

  const columns = useMemo<ColumnDef<ConsolidatedProduct>[]>(() => [
    { key: "name", header: "Product", sortable: true, render: (p) => (
      <div className="max-w-xs"><p className="truncate font-semibold text-foreground" title={p.name}>{p.name}</p></div>
    )},
    { key: "shopeeGmv", header: "GMV", sortable: true, align: "right", render: (p) => <span className="font-semibold text-rose-500">{formatCurrency(p.shopeeGmv)}</span> },
    { key: "shopeeItemsSold", header: "Item Sold", sortable: true, align: "right", render: (p) => <span>{formatNumber(p.shopeeItemsSold)}</span> },
  ], []);

  return (
    <div className="space-y-6 mt-4">
      <div className="grid gap-6 sm:grid-cols-2">
        <MetricCard label="Total Revenue" value={totalRevenue} format="currency" icon={DollarSign} />
        <MetricCard label="Total Item Sold" value={totalItemsSold} format="number" icon={Store} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Product List</h3>
        <DataTable columns={columns} data={shopeeProducts} searchFields={["name"]} searchPlaceholder="Cari produk Shopee..." defaultSort={{ key: "shopeeGmv", direction: "desc" }} />
      </div>
    </div>
  );
}

/* ====== #3 SHOPEE CHANNEL ANALYZ ====== */
export function ShopeeChannelAnalyz({ dashboardData }: Props) {
  const gmv = dashboardData.overview.find((m) => m.key === "gmv")?.value || 0;
  const orders = dashboardData.overview.find((m) => m.key === "orders")?.value || 0;

  const productCardGmv = dashboardData.products.reduce((s, p) => s + p.shopeeGmv * 0.6, 0);
  const liveGmv = dashboardData.products.reduce((s, p) => s + p.shopeeGmv * 0.25, 0);
  const videoGmv = dashboardData.products.reduce((s, p) => s + p.shopeeGmv * 0.05, 0);
  const affiliateGmv = dashboardData.products.reduce((s, p) => s + p.shopeeGmv * 0.15, 0);

  const adColumns = useMemo<ColumnDef<ShopeeAdItem>[]>(() => [
    { key: "ad_name", header: "Ad Name", sortable: true, render: (a) => <div className="max-w-xs"><p className="truncate font-semibold" title={a.ad_name}>{a.ad_name}</p></div> },
    { key: "cost", header: "Cost", sortable: true, align: "right", render: (a) => <span className="text-rose-500">{formatCurrency(a.cost)}</span> },
    { key: "gmv", header: "GMV", sortable: true, align: "right", render: (a) => <span className="font-semibold text-emerald-500">{formatCurrency(a.gmv)}</span> },
    { key: "orders", header: "Orders", sortable: true, align: "right" },
    { key: "roas", header: "ROAS", sortable: true, align: "right", render: (a) => <span className="font-semibold">{a.roas}x</span> },
    { key: "ctr", header: "CTR", sortable: true, align: "right", render: (a) => <span>{(a.ctr * 100).toFixed(2)}%</span> },
    { key: "impressions", header: "Impressions", sortable: true, align: "right" },
    { key: "clicks", header: "Clicks", sortable: true, align: "right" },
  ], []);

  return (
    <div className="space-y-8 mt-4">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Overview Channel</h3>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <MetricCard label="Total Revenue" value={gmv} format="currency" icon={DollarSign} />
          <MetricCard label="Product Card" value={productCardGmv} format="currency" icon={Package} />
          <MetricCard label="Live" value={liveGmv} format="currency" icon={Users} />
          <MetricCard label="Video" value={videoGmv} format="currency" icon={TrendingUp} />
          <MetricCard label="Affiliate" value={affiliateGmv} format="currency" icon={Store} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-2">Total Omzet Shopee</h3>
        <p className="text-4xl font-bold text-rose-500 mb-6">{formatCurrency(gmv)}</p>

        <div className="grid gap-6 sm:grid-cols-2 mb-6">
          <MetricCard label="Orders" value={orders} format="number" icon={ShoppingBag} />
          <MetricCard label="AOV" value={orders > 0 ? gmv / orders : 0} format="currency" icon={Coins} />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground">Komponen Arus Penjualan</h4>
          {[
            { label: "Product Card", value: productCardGmv, color: "bg-blue-500" },
            { label: "Live", value: liveGmv, color: "bg-rose-500" },
            { label: "Video", value: videoGmv, color: "bg-purple-500" },
            { label: "Affiliate", value: affiliateGmv, color: "bg-amber-500" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground font-semibold">
                  {formatCurrency(item.value)}
                  <span className="text-muted-foreground font-normal ml-1">
                    ({gmv > 0 ? ((item.value / gmv) * 100).toFixed(1) : 0}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${gmv > 0 ? (item.value / gmv) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {dashboardData.ads.shopee.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Shopee Ads Performance</h3>
          <DataTable columns={adColumns} data={dashboardData.ads.shopee} searchFields={["ad_name"]} searchPlaceholder="Cari iklan..." defaultSort={{ key: "gmv", direction: "desc" }} />
        </div>
      )}
    </div>
  );
}

/* ====== #4 SHOPEE AFFILIATE ANALYZ ====== */
export function ShopeeAffiliateAnalyz({ dashboardData }: Props) {
  const affiliateData = dashboardData.shopeeAffiliate || [];
  const sorted = useMemo(() => [...affiliateData].sort((a, b) => b.gmv - a.gmv), [affiliateData]);

  const totalGmv = sorted.reduce((s, a) => s + a.gmv, 0);
  const totalItemsSold = sorted.reduce((s, a) => s + a.items_sold, 0);
  const totalCommission = sorted.reduce((s, a) => s + a.commission, 0);

  if (sorted.length === 0) {
    return (
      <div className="space-y-8 mt-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Affiliate Analyz (KOL Shopee Share)</h3>
          <div className="rounded-xl border border-muted bg-muted/20 p-6 text-center">
            <p className="text-muted-foreground text-sm">
              Data afiliasi Shopee (KOL Shopee Share) belum tersedia. Upload laporan afiliasi dari Shopee Seller Center.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-4">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Overview Creator</h3>
        <div className="grid gap-6 sm:grid-cols-3">
          <MetricCard label="Creator GMV" value={totalGmv} format="currency" icon={DollarSign} />
          <MetricCard label="Creator Items Sold" value={totalItemsSold} format="number" icon={ShoppingBag} />
          <MetricCard label="Est. Commission" value={totalCommission} format="currency" icon={Coins} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Creator Analyz</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Creator Name</th>
                <th className="py-3 px-3 text-right">Creator GMV</th>
                <th className="py-3 px-3 text-right">Creator Items Sold</th>
                <th className="py-3 px-3 text-right">Est. Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {sorted.slice(0, 30).map((a, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-semibold text-foreground max-w-xs truncate" title={a.creator}>{a.creator}</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(a.gmv)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(a.items_sold)}</td>
                  <td className="py-3 px-3 text-right font-bold text-violet-500">{formatCurrency(a.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
