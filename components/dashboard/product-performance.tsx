"use client";

import React from "react";
import { ShoppingBag, Award, Store } from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency, formatNumber } from "@/lib/format";
import { DashboardData, ConsolidatedProduct } from "@/lib/db";
import { cn } from "@/lib/utils";

interface Props {
  dashboardData: DashboardData;
  selectedPlatform: string;
  filteredProducts: ConsolidatedProduct[];
  setFilteredProducts: (data: ConsolidatedProduct[]) => void;
}

export default function ProductPerformance({ dashboardData, selectedPlatform, filteredProducts, setFilteredProducts }: Props) {
  const productColumns: ColumnDef<ConsolidatedProduct>[] = [
    { key: "name", header: "Product Name", sortable: true, render: (p: ConsolidatedProduct) => (
      <div className="max-w-xs sm:max-w-sm"><p className="truncate font-semibold text-foreground" title={p.name}>{p.name}</p></div>
    )},
    { key: "status", header: "Status", sortable: true, align: "center", render: (p: ConsolidatedProduct) => (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", p.status === "Active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>{p.status}</span>
    )},
    ...(selectedPlatform === "All" ? [
      { key: "shopeeGmv", header: "Shopee GMV", sortable: true, align: "right" as const, render: (p: ConsolidatedProduct) => <span className="text-muted-foreground">{formatCurrency(p.shopeeGmv)}</span> },
      { key: "tiktokGmv", header: "TikTok GMV", sortable: true, align: "right" as const, render: (p: ConsolidatedProduct) => <span className="text-muted-foreground">{formatCurrency(p.tiktokGmv)}</span> },
      { key: "combinedGmv", header: "Total GMV", sortable: true, align: "right" as const, render: (p: ConsolidatedProduct) => <span className="font-semibold text-rose-500">{formatCurrency(p.combinedGmv)}</span> },
      { key: "combinedItemsSold", header: "Items Sold", sortable: true, align: "right" as const, render: (p: ConsolidatedProduct) => <span>{formatNumber(p.combinedItemsSold)}</span> },
    ] : [
      { key: "platformGmv", header: `${selectedPlatform} GMV`, sortable: true, align: "right" as const, render: (p: ConsolidatedProduct) => <span className="font-semibold text-rose-500">{formatCurrency(p.platformGmv)}</span> },
      { key: "platformItemsSold", header: "Items Sold", sortable: true, align: "right" as const, render: (p: ConsolidatedProduct) => <span>{formatNumber(p.platformItemsSold)}</span> },
    ]),
  ];

  return (
    <div className="space-y-6 mt-4">
      <div className="grid gap-6 sm:grid-cols-3">
        <MetricCard label="Unique Products" value={dashboardData.products.length} format="number" icon={ShoppingBag} description="Active catalog" />
        <MetricCard label="Top Revenue" value={dashboardData.products[0]?.platformGmv || 0} format="currency" icon={Award} description={dashboardData.products[0]?.name ? `"${dashboardData.products[0].name.substring(0, 15)}..."` : "-"} />
        <MetricCard label="Total Sold" value={dashboardData.products.reduce((a, p) => a + p.platformItemsSold, 0)} format="number" icon={Store} description="Consolidated items" />
      </div>
      <DataTable columns={productColumns} data={dashboardData.products} searchFields={["name"]} searchPlaceholder="Cari nama produk..." defaultSort={{ key: "platformGmv", direction: "desc" }} onFilteredDataChange={setFilteredProducts} />
    </div>
  );
}
