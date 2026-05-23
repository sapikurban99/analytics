"use client";

import React, { useState, useMemo } from "react";
import {
  getAvailableMonths,
  getDashboardData,
  ConsolidatedProduct,
  LiveSession,
  VideoMetric,
  ShopeeAdItem,
  TiktokLiveAdItem,
  TiktokProductAdItem,
} from "@/lib/db";
import {
  TrendingUp,
  Activity,
  Users,
  DollarSign,
  ShoppingBag,
  Coins,
  ArrowDownRight,
} from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import MetricCard from "@/components/ui/metric-card";
import TrendChart from "@/components/ui/trend-chart";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency, formatNumber } from "@/lib/format";
import { exportToCSV } from "@/lib/export";
import { cn } from "@/lib/utils";

import OverviewSection from "@/components/dashboard/overview-section";
import ProductPerformance from "@/components/dashboard/product-performance";
import {
  TikTokOverview,
  TikTokProductAnalyz,
  TikTokChannelAnalyz,
  TikTokAffiliateAnalyz,
} from "@/components/dashboard/tiktok-sections";
import {
  ShopeeOverview,
  ShopeeProductAnalyz,
  ShopeeChannelAnalyz,
  ShopeeAffiliateAnalyz,
} from "@/components/dashboard/shopee-sections";
import { WebsiteOverview, MetaAdsPerformance } from "@/components/dashboard/website-meta-sections";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [selectedPlatform, setSelectedPlatform] = useState<"All" | "Shopee" | "TikTok" | "Meta">("All");

  const handleActiveTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePlatformFilterChange = (platform: "All" | "Shopee" | "TikTok" | "Meta") => {
    setSelectedPlatform(platform);
  };

  const [metricsData, setMetricsData] = useState<any>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetricsData(data);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic metrics from Supabase:", err);
      } finally {
        setIsLoadingMetrics(false);
      }
    };
    fetchMetrics();
  }, []);

  const [filteredProducts, setFilteredProducts] = useState<ConsolidatedProduct[]>([]);
  const [filteredLives, setFilteredLives] = useState<LiveSession[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoMetric[]>([]);
  const [filteredShopeeAds, setFilteredShopeeAds] = useState<ShopeeAdItem[]>([]);
  const [filteredTiktokLiveAds, setFilteredTiktokLiveAds] = useState<TiktokLiveAdItem[]>([]);
  const [filteredTiktokProductAds, setFilteredTiktokProductAds] = useState<TiktokProductAdItem[]>([]);

  const availableMonths = useMemo(() => getAvailableMonths(metricsData), [metricsData]);

  const activeMonth = useMemo(() => {
    if (availableMonths && availableMonths.length > 0) {
      const exists = availableMonths.some((m) => m.key === selectedMonth);
      if (exists) return selectedMonth;
      return availableMonths[0].key;
    }
    return selectedMonth;
  }, [availableMonths, selectedMonth]);

  const dashboardData = useMemo(() => getDashboardData(activeMonth, selectedPlatform, metricsData), [activeMonth, selectedPlatform, metricsData]);

  const getMetricIcon = (key: string) => {
    switch (key) {
      case "gmv": return DollarSign;
      case "orders": return ShoppingBag;
      case "visitors": return Users;
      case "conversion_rate": return Activity;
      case "aov": return Coins;
      default: return TrendingUp;
    }
  };

  if (!dashboardData) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0B0B0C] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-sm font-semibold tracking-wide">Loading Tome Ame Analytics...</p>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      "overview": "Performance Sales Summary Multi-Channel",
      "product-performance": "Product Performance",
      "tiktok-overview": "TikTok Overview",
      "tiktok-product": "Product Analyz - TikTok",
      "tiktok-channel": "Channel Analyz - TikTok",
      "tiktok-affiliate": "Affiliate Analyz - TikTok",
      "shopee-overview": "Shopee Overview",
      "shopee-product": "Product Analyz - Shopee",
      "shopee-channel": "Channel Analyz - Shopee",
      "shopee-affiliate": "Affiliate Analyz - Shopee",
      "website": "Website Overview",
      "meta-ads": "Meta Ads Performance",
    };
    return titles[activeTab] || "Analytics";
  };

  const getPageDesc = () => {
    const descs: Record<string, string> = {
      "overview": "Ringkasan performa omnichannel marketplace",
      "product-performance": "Tabel pertumbuhan produk fashion wanita",
      "tiktok-overview": "Overview performa TikTok Shop",
      "tiktok-product": "Audit kinerja konversi SKU TikTok",
      "tiktok-channel": "Analisis konten Seller vs Affiliate TikTok",
      "tiktok-affiliate": "Performa jaringan kreator afiliasi TikTok",
      "shopee-overview": "Overview performa Shopee",
      "shopee-product": "Audit kinerja konversi SKU Shopee",
      "shopee-channel": "Komposisi & growth revenue Shopee",
      "shopee-affiliate": "Performa KOL Shopee Share",
      "website": "Metrik ritel D2C berdasarkan UTM Source",
      "meta-ads": "Pelacakan periklanan FB/IG Ads",
    };
    return descs[activeTab] || "";
  };

  const handleExport = () => {
    const monthLabel = dashboardData.monthName.toLowerCase();
    const platformLabel = selectedPlatform.toLowerCase();

    if (activeTab === "overview") {
      exportToCSV(`tomeame-overview-${platformLabel}-${monthLabel}-2026`, dashboardData.overview, [
        { key: "key", header: "Metric Code" }, { key: "label", header: "Metric Name" }, { key: "value", header: "Value" }, { key: "growth", header: "MoM Growth" },
      ]);
    } else if (activeTab === "product-performance" || activeTab.startsWith("tiktok-product") || activeTab.startsWith("shopee-product")) {
      exportToCSV(`tomeame-products-${platformLabel}-${monthLabel}-2026`, filteredProducts.length > 0 ? filteredProducts : dashboardData.products, [
        { key: "name", header: "Product Name" }, { key: "status", header: "Status" }, { key: "platformGmv", header: "GMV (Rp)" }, { key: "platformItemsSold", header: "Items Sold" },
      ]);
    } else if (activeTab === "tiktok-channel") {
      exportToCSV(`tomeame-videos-${platformLabel}-${monthLabel}-2026`, filteredVideos.length > 0 ? filteredVideos : dashboardData.videos, [
        { key: "creator", header: "Creator" }, { key: "title", header: "Video Title" }, { key: "gmv", header: "GMV (Rp)" }, { key: "items_sold", header: "Items Sold" },
      ]);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0B0C] text-[#F4F4F6]">
      <Sidebar activeTab={activeTab} setActiveTab={handleActiveTabChange} />

      <div className="flex flex-1 flex-col overflow-y-auto relative custom-scrollbar">
        <div className="pointer-events-none absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#3D4BFF]/5 blur-[120px]" />
        <div className="pointer-events-none absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />

        <main className="flex-1 p-8 space-y-8 z-10">
          {/* TOP HEADER */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">{getPageTitle()}</h1>
              <p className="text-sm text-[#8E8E95] mt-1">{getPageDesc()}</p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full border border-[#1F1F23] bg-[#131316] p-1">
                  <div className="px-3 py-1 text-xs font-bold text-[#8E8E95]">PERIODE</div>
                  <div className="h-4 w-px bg-[#1F1F23] mx-1"></div>
                  <div className="flex gap-1">
                    {availableMonths.slice(0, 3).map((month) => (
                      <button
                        key={month.key}
                        onClick={() => setSelectedMonth(month.key)}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                          activeMonth === month.key
                            ? "bg-[#11112B] text-white border border-[#3D4BFF]/50 shadow-[0_0_15px_rgba(61,75,255,0.2)]"
                            : "text-[#8E8E95] hover:text-white border border-transparent"
                        )}
                      >
                        {month.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setSelectedMonth(availableMonths[0]?.key)} className="text-xs font-semibold text-[#8E8E95] hover:text-white transition-colors underline underline-offset-4">
                  Reset
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-[#1F1F23] bg-[#131316] p-1">
                  <button onClick={() => handlePlatformFilterChange("All")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", selectedPlatform === "All" ? "bg-[#2A2A32] text-white" : "text-[#8E8E95] hover:text-white")}>
                    All Channel
                  </button>
                  <button onClick={() => handlePlatformFilterChange("Shopee")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5", selectedPlatform === "Shopee" ? "bg-[#EE4D2D]/20 text-[#EE4D2D]" : "text-[#8E8E95] hover:text-white")}>
                    Shopee
                  </button>
                  <button onClick={() => handlePlatformFilterChange("TikTok")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5", selectedPlatform === "TikTok" ? "bg-zinc-800 text-white" : "text-[#8E8E95] hover:text-white")}>
                    TikTok
                  </button>
                  <button onClick={() => handlePlatformFilterChange("Meta")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5", selectedPlatform === "Meta" ? "bg-[#1877F2]/20 text-[#1877F2]" : "text-[#8E8E95] hover:text-white")}>
                    Meta Ads
                  </button>
                </div>
                <button onClick={handleExport} className="rounded-lg bg-white text-black px-4 py-1.5 text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <ArrowDownRight className="h-4 w-4" /> Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* === TAB RENDERING === */}

          {activeTab === "overview" && (
            <OverviewSection
              dashboardData={dashboardData}
              selectedPlatform={selectedPlatform}
              filteredProducts={filteredProducts}
              setFilteredProducts={setFilteredProducts}
            />
          )}

          {activeTab === "product-performance" && (
            <ProductPerformance
              dashboardData={dashboardData}
              selectedPlatform={selectedPlatform}
              filteredProducts={filteredProducts}
              setFilteredProducts={setFilteredProducts}
            />
          )}

          {activeTab === "tiktok-overview" && <TikTokOverview dashboardData={dashboardData} />}
          {activeTab === "tiktok-product" && <TikTokProductAnalyz dashboardData={dashboardData} />}
          {activeTab === "tiktok-channel" && <TikTokChannelAnalyz dashboardData={dashboardData} />}
          {activeTab === "tiktok-affiliate" && <TikTokAffiliateAnalyz dashboardData={dashboardData} />}

          {activeTab === "shopee-overview" && <ShopeeOverview dashboardData={dashboardData} />}
          {activeTab === "shopee-product" && <ShopeeProductAnalyz dashboardData={dashboardData} />}
          {activeTab === "shopee-channel" && <ShopeeChannelAnalyz dashboardData={dashboardData} />}
          {activeTab === "shopee-affiliate" && <ShopeeAffiliateAnalyz dashboardData={dashboardData} />}

          {activeTab === "website" && <WebsiteOverview />}
          {activeTab === "meta-ads" && <MetaAdsPerformance />}

        </main>
      </div>
    </div>
  );
}
