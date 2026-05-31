"use client";

import React, { useMemo } from "react";
import { ShoppingBag, DollarSign, Store } from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency, formatNumber } from "@/lib/format";
import { DashboardData, ConsolidatedProduct } from "@/lib/db";

interface Props {
  dashboardData: DashboardData;
}

interface ProductRow {
  name: string;
  totalGmv: number;
  totalQty: number;
  shopeeGmv: number;
  tiktokGmv: number;
  websiteGmv: number;
  shopeePct: number;
  tiktokPct: number;
  websitePct: number;
}

export default function OverviewProduct({ dashboardData }: Props) {
  const products = useMemo(() => {
    const map = new Map<string, ProductRow>();
    dashboardData.products.forEach((p) => {
      if (!map.has(p.name)) {
        map.set(p.name, {
          name: p.name,
          totalGmv: 0, totalQty: 0,
          shopeeGmv: 0, tiktokGmv: 0, websiteGmv: 0,
          shopeePct: 0, tiktokPct: 0, websitePct: 0,
        });
      }
      const r = map.get(p.name)!;
      r.shopeeGmv += p.shopeeGmv;
      r.tiktokGmv += p.tiktokGmv;
      r.websiteGmv += p.websiteGmv;
      r.totalGmv = r.shopeeGmv + r.tiktokGmv + r.websiteGmv;
      r.totalQty += p.combinedItemsSold;
      r.shopeePct = r.totalGmv > 0 ? (r.shopeeGmv / r.totalGmv) * 100 : 0;
      r.tiktokPct = r.totalGmv > 0 ? (r.tiktokGmv / r.totalGmv) * 100 : 0;
      r.websitePct = r.totalGmv > 0 ? (r.websiteGmv / r.totalGmv) * 100 : 0;
    });
    return Array.from(map.values()).sort((a, b) => b.totalGmv - a.totalGmv);
  }, [dashboardData.products]);

  const columns = useMemo<ColumnDef<ProductRow>[]>(() => [
    { key: "name", header: "Product Name", sortable: true, render: (p) => <div className="max-w-xs"><p className="truncate font-semibold" title={p.name}>{p.name}</p></div> },
    { key: "totalGmv", header: "Total GMV", sortable: true, align: "right", render: (p) => <span className="font-semibold text-rose-500">{formatCurrency(p.totalGmv)}</span> },
    { key: "totalQty", header: "Total Qty", sortable: true, align: "right", render: (p) => <span>{formatNumber(p.totalQty)}</span> },
    { key: "shopeeGmv", header: "Shopee GMV", sortable: true, align: "right", render: (p) => <div className="text-right"><span className="text-muted-foreground">{formatCurrency(p.shopeeGmv)}</span><span className="text-[10px] text-[#EE4D2D] ml-1">{p.shopeePct.toFixed(1)}%</span></div> },
    { key: "tiktokGmv", header: "TikTok GMV", sortable: true, align: "right", render: (p) => <div className="text-right"><span className="text-muted-foreground">{formatCurrency(p.tiktokGmv)}</span><span className="text-[10px] text-foreground ml-1">{p.tiktokPct.toFixed(1)}%</span></div> },
    { key: "websiteGmv", header: "Website GMV", sortable: true, align: "right", render: (p) => <div className="text-right"><span className="text-muted-foreground">{formatCurrency(p.websiteGmv)}</span><span className="text-[10px] text-emerald-500 ml-1">{p.websitePct.toFixed(1)}%</span></div> },
  ], []);

  const totalProducts = products.length;
  const topGmv = products[0]?.totalGmv || 0;
  const totalQtyAll = products.reduce((s, p) => s + p.totalQty, 0);

  return (
    <div className="space-y-6 mt-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Scorecard Performance Product</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <MetricCard label="Total Products" value={totalProducts} format="number" icon={ShoppingBag} />
          <MetricCard label="Top Revenue" value={topGmv} format="currency" icon={DollarSign} />
          <MetricCard label="Total Qty Sold" value={totalQtyAll} format="number" icon={Store} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Product Performance — Tabel Pertumbuhan Produk</h3>
        <DataTable columns={columns} data={products} searchFields={["name"]} searchPlaceholder="Cari produk..." defaultSort={{ key: "totalGmv", direction: "desc" }} />
      </div>
    </div>
  );
}
