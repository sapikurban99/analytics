"use client";

import React, { useState, useMemo } from "react";
import {
  getAvailableMonths,
  getAvailableDateRange,
  getDashboardDataByDateRange,
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
  Menu,
  X,
  Sun,
  Moon,
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
import DateRangePicker from "@/components/ui/date-range-picker";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const selectedPlatform = 'All' as const;

  const handleActiveTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close sidebar on tab change for mobile
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

  // Initialize theme from localStorage on client side
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("tomeame_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("tomeame_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const [filteredProducts, setFilteredProducts] = useState<ConsolidatedProduct[]>([]);
  const [filteredLives, setFilteredLives] = useState<LiveSession[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoMetric[]>([]);
  const [filteredShopeeAds, setFilteredShopeeAds] = useState<ShopeeAdItem[]>([]);
  const [filteredTiktokLiveAds, setFilteredTiktokLiveAds] = useState<TiktokLiveAdItem[]>([]);
  const [filteredTiktokProductAds, setFilteredTiktokProductAds] = useState<TiktokProductAdItem[]>([]);

  const dateRangeInfo = useMemo(() => getAvailableDateRange(metricsData), [metricsData]);
  const months = useMemo(() => getAvailableMonths(metricsData), [metricsData]);

  React.useEffect(() => {
    if (dateRangeInfo.minDate && dateRangeInfo.maxDate) {
      setDateRange({ start: dateRangeInfo.minDate, end: dateRangeInfo.maxDate });
    }
  }, [dateRangeInfo.minDate, dateRangeInfo.maxDate]);

  const dashboardData = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return null;
    return getDashboardDataByDateRange(dateRange.start, dateRange.end, selectedPlatform, metricsData);
  }, [dateRange, selectedPlatform, metricsData]);

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
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3D4BFF] border-t-transparent" />
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
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleActiveTabChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-y-auto relative custom-scrollbar">
        <div className="pointer-events-none absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#3D4BFF]/5 blur-[120px]" />
        <div className="pointer-events-none absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />

        <main className="flex-1 p-4 md:p-8 space-y-8 z-10">
          {/* TOP HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted/50 transition-colors shrink-0 shadow-sm"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{getPageTitle()}</h1>
                <p className="text-sm text-muted-foreground mt-1">{getPageDesc()}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                minDate={dateRangeInfo.minDate}
                maxDate={dateRangeInfo.maxDate}
                onStartDateChange={(d) => setDateRange((prev) => ({ ...prev, start: d }))}
                onEndDateChange={(d) => setDateRange((prev) => ({ ...prev, end: d }))}
                onReset={() => setDateRange({ start: dateRangeInfo.minDate, end: dateRangeInfo.maxDate })}
                availableMonths={months}
              />

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <button
                  onClick={toggleTheme}
                  className="rounded-xl border border-border bg-card text-foreground p-2.5 hover:bg-muted/50 transition-all duration-200 flex items-center justify-center shadow-sm h-[38px] w-[38px] cursor-pointer"
                  title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-600" />
                  )}
                </button>

                <button
                  onClick={handleExport}
                  className="rounded-xl bg-foreground text-background px-4 py-2 text-xs font-bold hover:bg-foreground/80 transition-all duration-200 flex items-center gap-2 shadow-sm h-[38px] cursor-pointer"
                >
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
