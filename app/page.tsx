"use client";

import React, { useState, useMemo } from "react";
import { getAvailableMonths, getAvailableDateRange, getDashboardDataByDateRange } from "@/lib/db";
import { TrendingUp, Activity, Users, DollarSign, ShoppingBag, Coins, ArrowDownRight, Menu, Sun, Moon } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import DateRangePicker from "@/components/ui/date-range-picker";
import { exportToCSV } from "@/lib/export";

import OverviewSales from "@/components/dashboard/overview-sales";
import OverviewProduct from "@/components/dashboard/overview-product";
import { TikTokOverview, TikTokProductAnalyz, TikTokChannelAnalyz, TikTokAffiliateAnalyz } from "@/components/dashboard/tiktok-sections";
import { ShopeeOverview, ShopeeProductAnalyz, ShopeeChannelAnalyz, ShopeeAffiliateAnalyz } from "@/components/dashboard/shopee-sections";
import { WebsiteOverview, WebsiteProductAnalyz } from "@/components/dashboard/website-sections";
import { MetaCPAS, MetaWebsite, MetaTraffic } from "@/components/dashboard/meta-sections";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview-sales");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [metricsData, setMetricsData] = useState<any>(null);

  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/metrics");
        if (res.ok) setMetricsData(await res.json());
      } catch (err) { console.error("Failed to fetch metrics:", err); }
    };
    fetchMetrics();
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem("tomeame_theme") as "dark" | "light" | null;
    if (saved) { setTheme(saved); document.documentElement.classList.toggle("dark", saved === "dark"); }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("tomeame_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const dateRangeInfo = useMemo(() => getAvailableDateRange(metricsData), [metricsData]);
  const months = useMemo(() => getAvailableMonths(metricsData), [metricsData]);

  React.useEffect(() => {
    if (dateRangeInfo.minDate && dateRangeInfo.maxDate && !dateRange.start) {
      setDateRange({ start: dateRangeInfo.minDate, end: dateRangeInfo.maxDate });
    }
  }, [dateRangeInfo.minDate, dateRangeInfo.maxDate]);

  const determinePlatform = (tab: string): "All" | "Shopee" | "TikTok" | "Meta" | "Website" => {
    if (tab.startsWith("tiktok")) return "TikTok";
    if (tab.startsWith("shopee")) return "Shopee";
    if (tab.startsWith("meta") || tab === "meta-cpas" || tab === "meta-website" || tab === "meta-traffic") return "Meta";
    if (tab.startsWith("website")) return "Website";
    return "All";
  };

  const dashboardData = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return null;
    return getDashboardDataByDateRange(dateRange.start, dateRange.end, determinePlatform(activeTab), metricsData);
  }, [dateRange, activeTab, metricsData]);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      "overview-sales": "Performance Sales",
      "overview-product": "Performance Product",
      "tiktok-overview": "TikTok Shop — Overview",
      "tiktok-product": "TikTok Shop — Product Analyz",
      "tiktok-channel": "TikTok Shop — Channel Analyz",
      "tiktok-affiliate": "TikTok Shop — Affiliate Analyz",
      "shopee-overview": "Shopee — Overview",
      "shopee-product": "Shopee — Product Analyz",
      "shopee-channel": "Shopee — Channel Analyz",
      "shopee-affiliate": "Shopee — Affiliate Analyz",
      "website-overview": "Website — Overview",
      "website-product": "Website — Product Analyz",
      "meta-cpas": "Meta — CPAS",
      "meta-website": "Meta — Website",
      "meta-traffic": "Meta — Traffic",
    };
    return titles[activeTab] || "Analytics";
  };

  if (!dashboardData) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3D4BFF] border-t-transparent" />
          <p className="text-sm font-semibold tracking-wide">Loading Tome Ame Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-y-auto relative custom-scrollbar">
        <div className="pointer-events-none absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#3D4BFF]/5 blur-[120px]" />
        <div className="pointer-events-none absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />

        <main className="flex-1 p-4 md:p-8 space-y-6 z-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted/50 transition-colors shrink-0 shadow-sm">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{getPageTitle()}</h1>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <DateRangePicker
                startDate={dateRange.start} endDate={dateRange.end}
                minDate={dateRangeInfo.minDate} maxDate={dateRangeInfo.maxDate}
                onStartDateChange={(d) => setDateRange(p => ({ ...p, start: d }))}
                onEndDateChange={(d) => setDateRange(p => ({ ...p, end: d }))}
                onReset={() => setDateRange({ start: dateRangeInfo.minDate, end: dateRangeInfo.maxDate })}
                availableMonths={months}
              />
              <button onClick={toggleTheme} className="rounded-xl border border-border bg-card text-foreground p-2.5 hover:bg-muted/50 transition-all duration-200 flex items-center justify-center shadow-sm h-[38px] w-[38px] cursor-pointer">
                {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
              </button>
            </div>
          </div>

          {activeTab === "overview-sales" && <OverviewSales dashboardData={dashboardData} />}
          {activeTab === "overview-product" && <OverviewProduct dashboardData={dashboardData} />}

          {activeTab === "tiktok-overview" && <TikTokOverview dashboardData={dashboardData} />}
          {activeTab === "tiktok-product" && <TikTokProductAnalyz dashboardData={dashboardData} />}
          {activeTab === "tiktok-channel" && <TikTokChannelAnalyz dashboardData={dashboardData} />}
          {activeTab === "tiktok-affiliate" && <TikTokAffiliateAnalyz dashboardData={dashboardData} />}

          {activeTab === "shopee-overview" && <ShopeeOverview dashboardData={dashboardData} />}
          {activeTab === "shopee-product" && <ShopeeProductAnalyz dashboardData={dashboardData} />}
          {activeTab === "shopee-channel" && <ShopeeChannelAnalyz dashboardData={dashboardData} />}
          {activeTab === "shopee-affiliate" && <ShopeeAffiliateAnalyz dashboardData={dashboardData} />}

          {activeTab === "website-overview" && <WebsiteOverview dashboardData={dashboardData} />}
          {activeTab === "website-product" && <WebsiteProductAnalyz dashboardData={dashboardData} />}

          {activeTab === "meta-cpas" && <MetaCPAS dashboardData={dashboardData} />}
          {activeTab === "meta-website" && <MetaWebsite dashboardData={dashboardData} />}
          {activeTab === "meta-traffic" && <MetaTraffic dashboardData={dashboardData} />}
        </main>
      </div>
    </div>
  );
}
