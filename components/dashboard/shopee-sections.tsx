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
import { DashboardData, ConsolidatedProduct, ShopeeAffiliateItem, ShopeeAdItem } from "@/lib/db";

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
  const adsCost = dashboardData.ads.summary.cost;
  const adsGmv = dashboardData.ads.summary.gmv;
  const adsOrders = dashboardData.ads.summary.orders;
  const roas = adsCost > 0 ? adsGmv / adsCost : 0;
  const organicGmv = Math.max(0, gmv - adsGmv);
  const organicOrders = Math.max(0, orders - adsOrders);

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
        <h3 className="text-lg font-bold text-foreground mb-2">Total Omzet Shopee</h3>
        <p className="text-3xl font-bold text-foreground mb-6">{formatCurrency(gmv)}</p>

        <div className="grid gap-6 sm:grid-cols-3 mb-6">
          <MetricCard label="Orders" value={orders} format="number" icon={ShoppingBag} />
          <MetricCard label="Visitors" value={visitors} format="number" icon={Users} />
          <MetricCard label="AOV" value={orders > 0 ? gmv / orders : 0} format="currency" icon={Coins} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <MetricCard label="GMV Organic" value={organicGmv} format="currency" icon={Store} description="Omzet non-ads" />
          <MetricCard label="GMV Ads" value={adsGmv} format="currency" icon={TrendingUp} description="Omzet dari iklan" />
          <MetricCard label="Spend Ads" value={adsCost} format="currency" icon={DollarSign} />
          <MetricCard label="ROAS" value={roas} format="number" icon={TrendingUp} renderValue={() => `${roas.toFixed(2)}x`} />
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
  const totalCommission = sorted.reduce((s, a) => s + a.commission, 0);
  const totalOrders = sorted.reduce((s, a) => s + a.orders, 0);

  if (sorted.length === 0) {
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

  return (
    <div className="space-y-8 mt-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Affiliate Analyz (KOL Shopee Share)</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Affiliates" value={sorted.length} format="number" icon={Users} />
          <MetricCard label="Total GMV" value={totalGmv} format="currency" icon={DollarSign} />
          <MetricCard label="Total Orders" value={totalOrders} format="number" icon={ShoppingBag} />
          <MetricCard label="Est. Commission" value={totalCommission} format="currency" icon={Coins} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Creator List</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Nama Affiliate</th>
                <th className="py-3 px-3 text-right">GMV</th>
                <th className="py-3 px-3 text-right">Items Sold</th>
                <th className="py-3 px-3 text-right">Orders</th>
                <th className="py-3 px-3 text-right">Clicks</th>
                <th className="py-3 px-3 text-right">Commission</th>
                <th className="py-3 px-3 text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {sorted.slice(0, 30).map((a, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-semibold text-foreground max-w-xs truncate" title={a.creator}>{a.creator}</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(a.gmv)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(a.items_sold)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(a.orders)}</td>
                  <td className="py-3 px-3 text-right">{formatNumber(a.clicks)}</td>
                  <td className="py-3 px-3 text-right font-bold text-violet-500">{formatCurrency(a.commission)}</td>
                  <td className="py-3 px-3 text-right">{typeof a.roi === 'number' ? a.roi.toFixed(2) : a.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
