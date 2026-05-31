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

  const shopeeTotal = products.reduce((s, p) => s + p.shopeeGmv, 0);
  const tiktokTotal = products.reduce((s, p) => s + p.tiktokGmv, 0);
  const websiteTotal = products.reduce((s, p) => s + p.websiteGmv, 0);
  const totalGmv = shopeeTotal + tiktokTotal + websiteTotal;

  return (
    <div className="space-y-6 mt-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Performance Product</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <MetricCard label="Total Products" value={totalProducts} format="number" icon={ShoppingBag} />
          <MetricCard label="Top Revenue" value={topGmv} format="currency" icon={DollarSign} />
          <MetricCard label="Total Qty Sold" value={totalQtyAll} format="number" icon={Store} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Revenue Composition</h3>
          <div className="flex flex-wrap items-center gap-6">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
                {[
                  { label: "Shopee", value: shopeeTotal, color: "#EE4D2D" },
                  { label: "TikTok", value: tiktokTotal, color: "var(--foreground)" },
                  { label: "Website", value: websiteTotal, color: "#10B981" },
                ].map((seg, i, arr) => {
                  const pct = totalGmv > 0 ? (seg.value / totalGmv) * 100 : 0;
                  const offset = arr.slice(0, i).reduce((s, prev) => s + (totalGmv > 0 ? (prev.value / totalGmv) * 100 : 0), 0);
                  return (
                    <circle
                      key={seg.label}
                      cx="18" cy="18" r="15.5"
                      fill="none" stroke={seg.color} strokeWidth="3"
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeDashoffset={`${-offset}`}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="space-y-3 flex-1">
              {[
                { label: "Shopee GMV", value: shopeeTotal, color: "#EE4D2D" },
                { label: "TikTok GMV", value: tiktokTotal, color: "var(--foreground)" },
                { label: "Web GMV", value: websiteTotal, color: "#10B981" },
              ].map((item) => {
                const pct = totalGmv > 0 ? (item.value / totalGmv) * 100 : 0;
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm font-bold ml-auto">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Channel GMV</h3>
          <div className="space-y-4">
            {[
              { label: "Shopee", value: shopeeTotal, color: "#EE4D2D" },
              { label: "TikTok", value: tiktokTotal, color: "var(--foreground)" },
              { label: "Website", value: websiteTotal, color: "#10B981" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground font-semibold">
                    {formatCurrency(item.value)}
                    <span className="text-muted-foreground font-normal ml-1">
                      ({totalGmv > 0 ? ((item.value / totalGmv) * 100).toFixed(1) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${totalGmv > 0 ? (item.value / totalGmv) * 100 : 0}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Product Performance — Tabel Pertumbuhan Produk</h3>
        <DataTable columns={columns} data={products} searchFields={["name"]} searchPlaceholder="Cari produk..." defaultSort={{ key: "totalGmv", direction: "desc" }} />
      </div>
    </div>
  );
}
