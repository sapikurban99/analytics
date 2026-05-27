"use client";

import React, { useState } from "react";
import {
  ShoppingBag, Video, Globe, TrendingUp, Package, Megaphone,
  Radio, BarChart3, Users, ChevronDown, ChevronRight,
  ArrowUpRight, ArrowDownRight, Search, Trash2, Loader2,
} from "lucide-react";
import { formatCurrency, formatCompactCurrency, formatNumber, formatPercent, formatGrowth } from "@/lib/format";

interface OverviewMetric {
  gmv?: number;
  orders?: number;
  visitors?: number;
  clicks?: number;
  conversion_rate?: number;
  repeat_purchase_rate?: number;
  aov?: number;
  growth?: {
    gmv?: number;
    orders?: number;
    visitors?: number;
    conversion_rate?: number;
  };
}

interface DataExplorerProps {
  monthData: Record<string, any>;
  monthKey: string;
  monthName: string;
  activeChannel: "all" | "shopee" | "tiktok" | "meta" | "website";
  onRefresh?: () => void;
}

// ===== Helper Components =====

function MetricCard({
  label, value, growth, sublabel, icon: Icon, color = "cyan",
}: {
  label: string;
  value: string;
  growth?: number;
  sublabel?: string;
  icon?: any;
  color?: "cyan" | "orange" | "white" | "emerald" | "blue";
}) {
  const colorMap = {
    cyan: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
    orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-400",
    white: "from-white/10 to-white/5 border-white/20 text-white",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-4`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-bold text-[#8E8E95] uppercase tracking-wider">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${colorMap[color].split(" ")[2]}`} />}
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
      {sublabel && <div className="text-[10px] text-[#8E8E95] mt-0.5">{sublabel}</div>}
      {growth !== undefined && growth !== 0 && (
        <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${growth > 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {formatGrowth(growth)}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children, badge, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#0B0B0C] border border-[#1F1F23] rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#131316]/50 transition-colors">
        <div className="flex items-center gap-3">
          {Icon && <div className="p-2 bg-[#131316] rounded-lg"><Icon className="w-4 h-4 text-cyan-400" /></div>}
          <div className="text-left">
            <h3 className="text-sm font-bold text-white">{title}</h3>
            {badge && <p className="text-[10px] text-[#8E8E95] mt-0.5">{badge}</p>}
          </div>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-[#8E8E95]" /> : <ChevronRight className="w-4 h-4 text-[#8E8E95]" />}
      </button>
      {open && <div className="border-t border-[#1F1F23] p-5">{children}</div>}
    </div>
  );
}

function DataTable({ columns, rows, maxRows = 50, emptyText = "Tidak ada data", onDeleteRow }: {
  columns: { key: string; label: string; format?: (v: any) => string; align?: "left" | "right" }[];
  rows: any[];
  maxRows?: number;
  emptyText?: string;
  onDeleteRow?: (row: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  if (!rows || rows.length === 0) {
    return <div className="text-center py-8 text-[#8E8E95] text-sm">{emptyText}</div>;
  }

  const filtered = search
    ? rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(search.toLowerCase())))
    : rows;

  const displayed = showAll ? filtered : filtered.slice(0, maxRows);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E95]" />
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131316] border border-[#1F1F23] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div className="text-[10px] text-[#8E8E95]">
          {filtered.length} rows {search && `(filtered from ${rows.length})`}
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[#1F1F23]">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#131316] border-b border-[#1F1F23]">
              {columns.map((col) => (
                <th key={col.key} className={`px-3 py-2.5 font-bold text-[10px] text-[#8E8E95] uppercase tracking-wider ${col.align === "right" ? "text-right" : "text-left"}`}>
                  {col.label}
                </th>
              ))}
              {onDeleteRow && (
                <th className="px-3 py-2.5 font-bold text-[10px] text-[#8E8E95] uppercase tracking-wider text-right w-16">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F23]">
            {displayed.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#131316]/40 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 py-2.5 text-white ${col.align === "right" ? "text-right font-mono" : ""}`}>
                    {col.format ? col.format(row[col.key]) : (row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : "-")}
                  </td>
                ))}
                {onDeleteRow && (
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm("Apakah Anda yakin ingin menghapus data baris ini saja?")) {
                          onDeleteRow(row);
                        }
                      }}
                      className="p-1 text-[#8E8E95] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!showAll && filtered.length > maxRows && (
        <button onClick={() => setShowAll(true)}
          className="w-full py-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-[#131316] rounded-lg transition-colors border border-[#1F1F23]">
          Tampilkan semua {filtered.length} baris ↓
        </button>
      )}
    </div>
  );
}

// ===== Main Component =====

export default function DataExplorer({ monthData, monthKey, monthName, activeChannel, onRefresh }: DataExplorerProps) {
  const shopee: OverviewMetric = monthData?.shopee_overview || {};
  const tiktok: OverviewMetric = monthData?.tiktok_overview || {};
  const website: OverviewMetric = monthData?.website_overview_utm || {};
  const combined: OverviewMetric = monthData?.combined_overview || {};

  const meta_ads: any[] = monthData?.meta_ads_performance || [];
  const daily_trends: any[] = monthData?.daily_trends || [];
  const products: any[] = monthData?.products || [];
  const products_consolidated: any[] = monthData?.products_consolidated || [];
  const lives: any[] = monthData?.lives || [];
  const videos: any[] = monthData?.videos || [];
  const ads = monthData?.ads || { shopee: [], tiktok: { live: [], product: [], summary: {} }, summary: {} };

  const showShopee = activeChannel === "all" || activeChannel === "shopee";
  const showTiktok = activeChannel === "all" || activeChannel === "tiktok";
  const showMeta = activeChannel === "all" || activeChannel === "meta";
  const showWebsite = activeChannel === "all" || activeChannel === "website";

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteItem = async (sectionKey: string, sectionData: any) => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/metrics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthKey,
          sectionKey,
          sectionData,
        }),
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        const errData = await res.json();
        alert("Gagal menghapus: " + (errData.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Koneksi bermasalah: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus segmen file "${filename}"?\nTindakan ini akan menghapus file spreadsheet fisik secara permanen dan menghitung ulang seluruh metrik bulan ${monthName}.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/metrics?filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert(`Segmen file "${filename}" berhasil dihapus dan metrik telah dihitung ulang.`);
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert("Gagal menghapus: " + (err.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Koneksi bermasalah: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteMonth = async () => {
    if (!confirm(`PERINGATAN KRITIS!\nApakah Anda yakin ingin menghapus SELURUH data bulan "${monthName}" (${monthKey}) beserta SEMUA file sumbernya?\nTindakan ini akan menghapus semua data secara permanen di server & database. Tindakan tidak dapat dibatalkan.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/metrics?monthKey=${encodeURIComponent(monthKey)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert(`Bulan "${monthName}" berhasil dihapus sepenuhnya.`);
        window.location.reload();
      } else {
        const err = await res.json();
        alert("Gagal menghapus bulan: " + (err.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Koneksi bermasalah: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameMonth = async () => {
    const name = prompt("Masukkan nama baru untuk bulan ini:", monthName);
    if (!name || name.trim() === "" || name.trim() === monthName) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/metrics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthKey,
          newMonthName: name.trim()
        }),
      });
      if (res.ok) {
        alert("Nama bulan berhasil diubah.");
        window.location.reload();
      } else {
        const err = await res.json();
        alert("Gagal mengubah nama: " + (err.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Koneksi bermasalah: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const meta_summary = meta_ads.reduce(
    (acc, x) => {
      acc.cost += x.cost || 0;
      acc.gmv += x.gmv || 0;
      acc.orders += x.orders || 0;
      acc.impressions += x.impressions || 0;
      acc.clicks += x.clicks || 0;
      return acc;
    },
    { cost: 0, gmv: 0, orders: 0, impressions: 0, clicks: 0 }
  );
  const meta_roas = meta_summary.cost > 0 ? meta_summary.gmv / meta_summary.cost : 0;

  return (
    <div className="space-y-6 relative">
      {isDeleting && (
        <div className="absolute inset-0 bg-[#060608]/60 backdrop-blur-sm z-50 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-sm font-medium text-white">Memproses data...</span>
        </div>
      )}

      {/* ====== HEADER BANNER ====== */}
      <div className="bg-gradient-to-r from-[#0B0B0C] to-[#131316] border border-[#1F1F23] rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-bold text-[#8E8E95] uppercase tracking-wider mb-1">Sedang Dilihat</p>
            <h2 className="text-2xl font-bold text-white">
              {monthName} <span className="text-cyan-400 font-mono text-base">({monthKey})</span>
            </h2>
            <p className="text-xs text-[#8E8E95] mt-1">
              Data telah dipetakan otomatis dari dokumen sumber. Anda dapat mengelola file segmen bulanan & data baris di bawah.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
              {activeChannel === "all" ? "Semua Channel" : activeChannel}
            </span>
          </div>
        </div>
      </div>

      {/* ====== BULAN & SEGMEN MANAGEMENT ====== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Source Files (Segments) */}
        <div className="md:col-span-2 bg-[#0B0B0C] border border-[#1F1F23] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              Segmen File / Dokumen Sumber Bulanan
            </h3>
            {monthData?.source_files && monthData.source_files.length > 0 ? (
              <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                {monthData.source_files.map((file: string, index: number) => (
                  <div key={index} className="flex items-center justify-between px-3 py-2 bg-[#131316] border border-[#1F1F23] rounded-xl text-xs">
                    <span className="text-white font-mono truncate max-w-[85%]" title={file}>{file}</span>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className="p-1 text-[#8E8E95] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all shrink-0"
                      title="Hapus segmen file ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8E8E95]">Tidak ada file sumber yang terdeteksi.</p>
            )}
          </div>
          <p className="text-[10px] text-[#8E8E95] mt-3">
            * Menghapus segmen file akan menghapus file fisik asli dan menghitung ulang total metrik bulan ini.
          </p>
        </div>

        {/* Month Actions */}
        <div className="bg-[#0B0B0C] border border-[#1F1F23] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              Kelola Bulan Ini
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleRenameMonth}
                className="w-full bg-[#131316] border border-[#1F1F23] hover:bg-[#1f1f23] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                Ubah Nama Tampilan Bulan
              </button>
              <button
                onClick={handleDeleteMonth}
                className="w-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                Hapus Seluruh Data Bulan
              </button>
            </div>
          </div>
          <p className="text-[10px] text-[#8E8E95] mt-3">
            Tindakan kritis. Penghapusan bulan akan menghapus seluruh file dokumen sumber yang terasosiasi.
          </p>
        </div>
      </div>

      {/* ====== COMBINED OVERVIEW ====== */}
      {activeChannel === "all" && (
        <Section title="Combined Overview" icon={BarChart3} badge="Total semua channel" defaultOpen={true}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Total GMV"
              value={formatCompactCurrency(combined.gmv || 0)}
              growth={combined.growth?.gmv}
              color="cyan"
              icon={TrendingUp}
            />
            <MetricCard
              label="Total Orders"
              value={formatNumber(combined.orders || 0)}
              growth={combined.growth?.orders}
              color="blue"
              icon={Package}
            />
            <MetricCard
              label="Total Visitors"
              value={formatNumber(combined.visitors || 0)}
              growth={combined.growth?.visitors}
              color="emerald"
              icon={Users}
            />
            <MetricCard
              label="Conversion Rate"
              value={formatPercent(combined.conversion_rate || 0)}
              growth={combined.growth?.conversion_rate}
              color="white"
            />
          </div>
        </Section>
      )}

      {/* ====== SHOPEE ====== */}
      {showShopee && Object.keys(shopee).length > 0 && (
        <Section title="Shopee Overview" icon={ShoppingBag} badge="Data resmi dari shp overview metriks" defaultOpen={true}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="GMV" value={formatCompactCurrency(shopee.gmv || 0)} growth={shopee.growth?.gmv} color="orange" />
            <MetricCard label="Orders" value={formatNumber(shopee.orders || 0)} growth={shopee.growth?.orders} color="orange" />
            <MetricCard label="Visitors" value={formatNumber(shopee.visitors || 0)} growth={shopee.growth?.visitors} color="orange" />
            <MetricCard label="Conv. Rate" value={formatPercent(shopee.conversion_rate || 0)} growth={shopee.growth?.conversion_rate} color="orange" />
            <MetricCard label="Product Clicks" value={formatNumber(shopee.clicks || 0)} color="orange" />
            <MetricCard label="Repeat Purchase" value={formatPercent(shopee.repeat_purchase_rate || 0)} color="orange" />
          </div>
        </Section>
      )}

      {/* ====== TIKTOK ====== */}
      {showTiktok && Object.keys(tiktok).length > 0 && (
        <Section title="TikTok Shop Overview" icon={Video} badge="Data resmi dari tts overview" defaultOpen={true}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="GMV" value={formatCompactCurrency(tiktok.gmv || 0)} growth={tiktok.growth?.gmv} color="white" />
            <MetricCard label="Orders" value={formatNumber(tiktok.orders || 0)} growth={tiktok.growth?.orders} color="white" />
            <MetricCard label="Visitors" value={formatNumber(tiktok.visitors || 0)} growth={tiktok.growth?.visitors} color="white" />
            <MetricCard label="Conv. Rate" value={formatPercent(tiktok.conversion_rate || 0)} growth={tiktok.growth?.conversion_rate} color="white" />
            <MetricCard label="Product Clicks" value={formatNumber(tiktok.clicks || 0)} color="white" />
            <MetricCard label="AOV" value={formatCurrency(tiktok.aov || 0)} color="white" />
          </div>
        </Section>
      )}

      {/* ====== WEBSITE ====== */}
      {showWebsite && Object.keys(website).length > 0 && (
        <Section title="Website Overview" icon={Globe} badge="Data resmi dari website overview" defaultOpen={true}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="GMV" value={formatCompactCurrency(website.gmv || 0)} color="emerald" />
            <MetricCard label="Orders" value={formatNumber(website.orders || 0)} color="emerald" />
            <MetricCard label="Visitors" value={formatNumber(website.visitors || 0)} color="emerald" />
            <MetricCard label="Conv. Rate" value={formatPercent(website.conversion_rate || 0)} color="emerald" />
          </div>
        </Section>
      )}

      {/* ====== META ADS ====== */}
      {showMeta && meta_ads.length > 0 && (
        <Section title="Meta Ads Performance" icon={Megaphone} badge={`${meta_ads.length} campaigns`} defaultOpen={true}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <MetricCard label="Spend" value={formatCompactCurrency(meta_summary.cost)} color="blue" />
            <MetricCard label="GMV" value={formatCompactCurrency(meta_summary.gmv)} color="blue" />
            <MetricCard label="Orders" value={formatNumber(meta_summary.orders)} color="blue" />
            <MetricCard label="Impressions" value={formatNumber(meta_summary.impressions)} color="blue" />
            <MetricCard label="ROAS" value={meta_roas.toFixed(2) + "x"} color="blue" />
          </div>
          <DataTable
            columns={[
              { key: "campaign_name", label: "Campaign" },
              { key: "cost", label: "Spend", align: "right", format: (v) => formatCurrency(v) },
              { key: "gmv", label: "GMV", align: "right", format: (v) => formatCurrency(v) },
              { key: "orders", label: "Orders", align: "right", format: (v) => formatNumber(v) },
              { key: "impressions", label: "Impressions", align: "right", format: (v) => formatNumber(v) },
              { key: "clicks", label: "Clicks", align: "right", format: (v) => formatNumber(v) },
              { key: "roi", label: "ROAS", align: "right", format: (v) => (v || 0).toFixed(2) + "x" },
            ]}
            rows={meta_ads}
            maxRows={20}
            onDeleteRow={(row) => {
              const updated = meta_ads.filter(x => x.campaign_name !== row.campaign_name);
              handleDeleteItem("meta_ads_performance", updated);
            }}
          />
        </Section>
      )}

      {/* ====== ADS - Shopee ====== */}
      {showShopee && ads.shopee?.length > 0 && (
        <Section title="Shopee Ads" icon={Megaphone} badge={`${ads.shopee.length} ad campaigns`} defaultOpen={false}>
          {ads.shopee_summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <MetricCard label="Total Spend" value={formatCompactCurrency(ads.shopee_summary.cost || 0)} color="orange" />
              <MetricCard label="GMV from Ads" value={formatCompactCurrency(ads.shopee_summary.gmv || 0)} color="orange" />
              <MetricCard label="Orders" value={formatNumber(ads.shopee_summary.orders || 0)} color="orange" />
              <MetricCard label="ROAS" value={(ads.shopee_summary.roas || 0).toFixed(2) + "x"} color="orange" />
            </div>
          )}
          <DataTable
            columns={[
              { key: "ad_name", label: "Ad Name" },
              { key: "impressions", label: "Impressions", align: "right", format: (v) => formatNumber(v) },
              { key: "clicks", label: "Clicks", align: "right", format: (v) => formatNumber(v) },
              { key: "ctr", label: "CTR", align: "right", format: (v) => formatPercent(v) },
              { key: "cost", label: "Spend", align: "right", format: (v) => formatCurrency(v) },
              { key: "gmv", label: "GMV", align: "right", format: (v) => formatCurrency(v) },
              { key: "orders", label: "Orders", align: "right", format: (v) => formatNumber(v) },
              { key: "roas", label: "ROAS", align: "right", format: (v) => (v || 0).toFixed(2) + "x" },
            ]}
            rows={ads.shopee}
            maxRows={20}
            onDeleteRow={(row) => {
              const updated = {
                ...ads,
                shopee: ads.shopee.filter((x: any) => x.ad_name !== row.ad_name)
              };
              handleDeleteItem("ads", updated);
            }}
          />
        </Section>
      )}

      {/* ====== ADS - TikTok ====== */}
      {showTiktok && (ads.tiktok?.live?.length > 0 || ads.tiktok?.product?.length > 0) && (
        <Section title="TikTok GMV Max Ads" icon={Megaphone} badge="LIVE + Product ads" defaultOpen={false}>
          {ads.tiktok.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <MetricCard label="Total Spend" value={formatCompactCurrency(ads.tiktok.summary.cost || 0)} color="white" />
              <MetricCard label="GMV from Ads" value={formatCompactCurrency(ads.tiktok.summary.gmv || 0)} color="white" />
              <MetricCard label="Orders" value={formatNumber(ads.tiktok.summary.orders || 0)} color="white" />
              <MetricCard label="ROI" value={(ads.tiktok.summary.roi || 0).toFixed(2) + "x"} color="white" />
            </div>
          )}
          {ads.tiktok.live?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Radio className="w-3.5 h-3.5 text-rose-400" /> LIVE Ads ({ads.tiktok.live.length})</h4>
              <DataTable
                columns={[
                  { key: "campaign_name", label: "Campaign" },
                  { key: "cost", label: "Spend", align: "right", format: (v) => formatCurrency(v) },
                  { key: "gmv", label: "GMV", align: "right", format: (v) => formatCurrency(v) },
                  { key: "orders", label: "Orders", align: "right", format: (v) => formatNumber(v) },
                  { key: "views", label: "Views", align: "right", format: (v) => formatNumber(v) },
                  { key: "roi", label: "ROI", align: "right", format: (v) => (v || 0).toFixed(2) + "x" },
                ]}
                rows={ads.tiktok.live}
                maxRows={20}
                onDeleteRow={(row) => {
                  const updated = {
                    ...ads,
                    tiktok: {
                      ...ads.tiktok,
                      live: ads.tiktok.live.filter((x: any) => x.campaign_name !== row.campaign_name)
                    }
                  };
                  handleDeleteItem("ads", updated);
                }}
              />
            </div>
          )}
          {ads.tiktok.product?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Package className="w-3.5 h-3.5 text-cyan-400" /> Product Ads ({ads.tiktok.product.length})</h4>
              <DataTable
                columns={[
                  { key: "campaign_name", label: "Campaign" },
                  { key: "cost", label: "Spend", align: "right", format: (v) => formatCurrency(v) },
                  { key: "gmv", label: "GMV", align: "right", format: (v) => formatCurrency(v) },
                  { key: "orders", label: "Orders", align: "right", format: (v) => formatNumber(v) },
                  { key: "impressions", label: "Impressions", align: "right", format: (v) => formatNumber(v) },
                  { key: "roi", label: "ROI", align: "right", format: (v) => (v || 0).toFixed(2) + "x" },
                ]}
                rows={ads.tiktok.product}
                maxRows={20}
                onDeleteRow={(row) => {
                  const updated = {
                    ...ads,
                    tiktok: {
                      ...ads.tiktok,
                      product: ads.tiktok.product.filter((x: any) => x.campaign_name !== row.campaign_name)
                    }
                  };
                  handleDeleteItem("ads", updated);
                }}
              />
            </div>
          )}
        </Section>
      )}

      {/* ====== PRODUCTS CONSOLIDATED ====== */}
      {activeChannel === "all" && products_consolidated.length > 0 && (
        <Section title="Top Products (Cross-Channel)" icon={Package} badge={`${products_consolidated.length} products consolidated`} defaultOpen={false}>
          <DataTable
            columns={[
              { key: "name", label: "Product" },
              { key: "status", label: "Status" },
              { key: "shopee_gmv", label: "Shopee GMV", align: "right", format: (v) => formatCurrency(v) },
              { key: "shopee_items_sold", label: "Shopee Units", align: "right", format: (v) => formatNumber(v) },
              { key: "tiktok_gmv", label: "TikTok GMV", align: "right", format: (v) => formatCurrency(v) },
              { key: "tiktok_items_sold", label: "TikTok Units", align: "right", format: (v) => formatNumber(v) },
              { key: "combined_gmv", label: "Total GMV", align: "right", format: (v) => formatCurrency(v) },
              { key: "combined_items_sold", label: "Total Units", align: "right", format: (v) => formatNumber(v) },
            ]}
            rows={products_consolidated}
            maxRows={15}
            onDeleteRow={(row) => {
              const updated = products_consolidated.filter(x => x.name !== row.name);
              handleDeleteItem("products_consolidated", updated);
            }}
          />
        </Section>
      )}

      {/* ====== PRODUCTS PER PLATFORM ====== */}
      {(showShopee || showTiktok) && products.length > 0 && (
        <Section title="Products (Per Platform)" icon={Package} badge={`${products.length} entries`} defaultOpen={false}>
          <DataTable
            columns={[
              { key: "name", label: "Product" },
              { key: "platform", label: "Platform" },
              { key: "status", label: "Status" },
              { key: "gmv", label: "GMV", align: "right", format: (v) => formatCurrency(v) },
              { key: "items_sold", label: "Units Sold", align: "right", format: (v) => formatNumber(v) },
              { key: "orders", label: "Orders", align: "right", format: (v) => formatNumber(v) },
              { key: "conversion_rate", label: "Conv. Rate", align: "right", format: (v) => formatPercent(v) },
              { key: "ctr", label: "CTR", align: "right", format: (v) => formatPercent(v) },
              { key: "views", label: "Views", align: "right", format: (v) => formatNumber(v) },
            ]}
            rows={
              activeChannel === "shopee" ? products.filter(p => p.platform === "Shopee")
              : activeChannel === "tiktok" ? products.filter(p => p.platform === "TikTok")
              : products
            }
            maxRows={20}
            onDeleteRow={(row) => {
              const updated = products.filter(x => !(x.name === row.name && x.platform === row.platform));
              handleDeleteItem("products", updated);
            }}
          />
        </Section>
      )}

      {/* ====== TIKTOK LIVE ====== */}
      {showTiktok && lives.length > 0 && (
        <Section title="TikTok LIVE Sessions" icon={Radio} badge={`${lives.length} live streams`} defaultOpen={false}>
          <DataTable
            columns={[
              { key: "creator_name", label: "Creator" },
              { key: "type", label: "Type" },
              { key: "duration", label: "Duration" },
              { key: "gmv", label: "GMV", align: "right", format: (v) => formatCurrency(v) },
              { key: "items_sold", label: "Items Sold", align: "right", format: (v) => formatNumber(v) },
              { key: "views", label: "Views", align: "right", format: (v) => formatNumber(v) },
              { key: "clicks", label: "Clicks", align: "right", format: (v) => formatNumber(v) },
              { key: "ctr", label: "CTR", align: "right", format: (v) => formatPercent(v) },
            ]}
            rows={lives}
            maxRows={20}
            onDeleteRow={(row) => {
              const updated = lives.filter(x => !(x.creator === row.creator && x.duration === row.duration));
              handleDeleteItem("lives", updated);
            }}
          />
        </Section>
      )}

      {/* ====== TIKTOK VIDEOS ====== */}
      {showTiktok && videos.length > 0 && (
        <Section title="TikTok Short Videos" icon={Video} badge={`${videos.length} videos`} defaultOpen={false}>
          <DataTable
            columns={[
              { key: "creator", label: "Creator" },
              { key: "title", label: "Video Title" },
              { key: "type", label: "Type" },
              { key: "views", label: "Views", align: "right", format: (v) => formatNumber(v) },
              { key: "gmv", label: "GMV", align: "right", format: (v) => formatCurrency(v) },
              { key: "items_sold", label: "Items", align: "right", format: (v) => formatNumber(v) },
              { key: "ctr", label: "CTR", align: "right", format: (v) => formatPercent(v) },
              { key: "likes", label: "Likes", align: "right", format: (v) => formatNumber(v) },
              { key: "comments", label: "Comments", align: "right", format: (v) => formatNumber(v) },
            ]}
            rows={videos}
            maxRows={20}
            onDeleteRow={(row) => {
              const updated = videos.filter(x => !(x.creator === row.creator && x.title === row.title));
              handleDeleteItem("videos", updated);
            }}
          />
        </Section>
      )}

      {/* ====== DAILY TRENDS ====== */}
      {daily_trends.length > 0 && (
        <Section title="Daily Trends" icon={TrendingUp} badge={`${daily_trends.length} hari data`} defaultOpen={false}>
          <DataTable
            columns={[
              { key: "date", label: "Date" },
              ...(showShopee ? [
                { key: "shopee_gmv", label: "Shopee GMV", align: "right" as const, format: (v: number) => formatCurrency(v) },
                { key: "shopee_orders", label: "Shopee Orders", align: "right" as const, format: (v: number) => formatNumber(v) },
              ] : []),
              ...(showTiktok ? [
                { key: "tiktok_gmv", label: "TikTok GMV", align: "right" as const, format: (v: number) => formatCurrency(v) },
                { key: "tiktok_orders", label: "TikTok Orders", align: "right" as const, format: (v: number) => formatNumber(v) },
              ] : []),
              ...(showWebsite ? [
                { key: "website_gmv", label: "Web GMV", align: "right" as const, format: (v: number) => formatCurrency(v) },
                { key: "website_orders", label: "Web Orders", align: "right" as const, format: (v: number) => formatNumber(v) },
              ] : []),
              { key: "combined_gmv", label: "Combined GMV", align: "right" as const, format: (v: number) => formatCurrency(v) },
              { key: "combined_orders", label: "Combined Orders", align: "right" as const, format: (v: number) => formatNumber(v) },
            ]}
            rows={daily_trends}
            maxRows={31}
            onDeleteRow={(row) => {
              const updated = daily_trends.filter(x => x.date !== row.date);
              handleDeleteItem("daily_trends", updated);
            }}
          />
        </Section>
      )}
    </div>
  );
}
