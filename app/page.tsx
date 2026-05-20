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
  Award,
  ShoppingBag,
  Tv,
  Play,
  Percent,
  Coins,
  Store,
  Eye,
  Heart,
  Sparkles,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UploadCloud,
  FileText,
  Check,
  Trash2,
  Loader2,
  Calendar,
} from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";
import MetricCard from "@/components/ui/metric-card";
import TrendChart from "@/components/ui/trend-chart";
import RoasGauge from "@/components/ui/roas-gauge";
import AIInsight from "@/components/ui/ai-insight";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { exportToCSV } from "@/lib/export";
import { cn } from "@/lib/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState("2026-04"); // Default to latest month
  const [selectedPlatform, setSelectedPlatform] = useState<"All" | "Shopee" | "TikTok" | "Meta">("All");

  // Dynamic metrics from Supabase database
  const [metricsData, setMetricsData] = useState<any>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Fetch metrics on mount
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

  // Keep track of the currently active table's filtered/sorted data for dynamic CSV exports
  const [filteredProducts, setFilteredProducts] = useState<ConsolidatedProduct[]>([]);
  const [filteredLives, setFilteredLives] = useState<LiveSession[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoMetric[]>([]);
  const [filteredShopeeAds, setFilteredShopeeAds] = useState<ShopeeAdItem[]>([]);
  const [filteredTiktokLiveAds, setFilteredTiktokLiveAds] = useState<TiktokLiveAdItem[]>([]);
  const [filteredTiktokProductAds, setFilteredTiktokProductAds] = useState<TiktokProductAdItem[]>([]);

  // Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPlatform, setUploadPlatform] = useState<string>("Shopee");
  const [uploadCategory, setUploadCategory] = useState<string>("Shp Ads");
  const [uploadMonth, setUploadMonth] = useState<string>("januari");
  const [uploadYear, setUploadYear] = useState<string>("2026");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadErrorDetails, setUploadErrorDetails] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // History Log States
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchUploadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/upload");
      if (res.ok) {
        const data = await res.json();
        setUploadHistory(data.uploads || []);
      }
    } catch (err) {
      console.error("Failed to fetch upload history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "riwayat") {
      fetchUploadHistory();
    }
  }, [activeTab]);

  const getCategoriesForPlatform = (plat: string) => {
    switch (plat) {
      case "Shopee":
        return [
          { key: "Shp Ads", label: "Shopee Ads Campaign (.csv)" },
          { key: "Shp Affiliate", label: "Shopee Affiliate (.xlsx)" },
          { key: "Shp Overview Metriks", label: "Shopee Overview Metriks (.xlsx)" },
          { key: "Shp Product Performance", label: "Shopee Product Performance (.xlsx)" },
        ];
      case "TikTok":
        return [
          { key: "Tts Overview Metriks", label: "TikTok Overview Metriks (.xlsx)" },
          { key: "Tts Live Seller", label: "TikTok LIVE Attributed Seller (.xlsx)" },
          { key: "Tts Live Affiliate", label: "TikTok LIVE Attributed Affiliate (.xlsx)" },
          { key: "Tts Video Seller", label: "TikTok Short Video Seller (.xlsx)" },
          { key: "Tts Video Affiliate", label: "TikTok Short Video Affiliate (.xlsx)" },
          { key: "Tts Gmv Max Live Ads", label: "TikTok GMV Max LIVE Ads (.xlsx)" },
          { key: "Tts Gmv Max Product Ads", label: "TikTok GMV Max Product Ads (.xlsx)" },
          { key: "Tts Product Affiliate", label: "TikTok Product Affiliate (.xlsx)" },
          { key: "Tts Product List", label: "TikTok Product List (.xlsx)" },
          { key: "Tts Product card Seller", label: "TikTok Product Card Seller (.xlsx)" },
        ];
      case "Meta":
        return [
          { key: "CPAS", label: "Meta CPAS (.xlsx/.csv)" },
          { key: "Meta Regular", label: "Meta Regular (.xlsx/.csv)" },
        ];
      default:
        return [];
    }
  };

  const handlePlatformChange = (p: string) => {
    setUploadPlatform(p);
    const cats = getCategoriesForPlatform(p);
    if (cats.length > 0) {
      setUploadCategory(cats[0].key);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadErrorDetails(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("platform", uploadPlatform);
    formData.append("category", uploadCategory);
    formData.append("month", uploadMonth);
    formData.append("year", uploadYear);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setUploadSuccess(`Laporan untuk ${uploadPlatform} - ${uploadCategory} (${uploadMonth} ${uploadYear}) berhasil diunggah dan dikonsolidasikan! Dashboard akan diperbarui otomatis dalam beberapa detik.`);
        setUploadFile(null);
        setTimeout(() => {
          window.location.reload();
        }, 1800);
      } else {
        setUploadError(result.error || "Gagal mengunggah file.");
        setUploadErrorDetails(result.details || null);
      }
    } catch (err: any) {
      setUploadError("Terjadi kesalahan koneksi ke server.");
      setUploadErrorDetails(err.message || null);
    } finally {
      setIsUploading(false);
    }
  };

  // 1. Get available months
  const availableMonths = useMemo(() => {
    return getAvailableMonths(metricsData);
  }, [metricsData]);

  // 2. Fetch data based on filters
  const dashboardData = useMemo(() => {
    return getDashboardData(selectedMonth, selectedPlatform, metricsData);
  }, [selectedMonth, selectedPlatform, metricsData]);

  // 3. Auto-select latest month from fetched available months
  React.useEffect(() => {
    if (availableMonths && availableMonths.length > 0) {
      const exists = availableMonths.some((m) => m.key === selectedMonth);
      if (!exists) {
        setSelectedMonth(availableMonths[0].key);
      }
    }
  }, [availableMonths, selectedMonth]);

  // 4. Calculate distributions for GMV (Shopee vs TikTok)
  const platformGMVDistribution = useMemo(() => {
    const rawMonthData = getDashboardData(selectedMonth, "All", metricsData);
    if (!rawMonthData) return { shopeePercent: 50, tiktokPercent: 50, shopeeVal: 0, tiktokVal: 0 };
    
    const shopeeData = getDashboardData(selectedMonth, "Shopee", metricsData);
    const tiktokData = getDashboardData(selectedMonth, "TikTok", metricsData);
    
    const shopeeGmv = shopeeData?.overview.find((m) => m.key === "gmv")?.value || 0;
    const tiktokGmv = tiktokData?.overview.find((m) => m.key === "gmv")?.value || 0;
    const totalGmv = shopeeGmv + tiktokGmv;
    
    if (totalGmv === 0) return { shopeePercent: 0, tiktokPercent: 0, shopeeVal: 0, tiktokVal: 0 };
    
    return {
      shopeePercent: (shopeeGmv / totalGmv) * 100,
      tiktokPercent: (tiktokGmv / totalGmv) * 100,
      shopeeVal: shopeeGmv,
      tiktokVal: tiktokGmv
    };
  }, [selectedMonth, metricsData]);

  // 6. Define Table Columns
  
  // Products table columns
  const productColumns = useMemo<ColumnDef<ConsolidatedProduct>[]>(() => {
    const cols: ColumnDef<ConsolidatedProduct>[] = [
      {
        key: "name",
        header: "Product Name",
        sortable: true,
        render: (p) => (
          <div className="max-w-xs sm:max-w-sm">
            <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50" title={p.name}>
              {p.name}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        align: "center",
        render: (p) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold shadow-sm",
              p.status === "Active"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-550 dark:bg-zinc-800 dark:text-zinc-500"
            )}
          >
            {p.status}
          </span>
        ),
      },
    ];

    if (selectedPlatform === "All") {
      cols.push({
        key: "shopeeGmv",
        header: "Shopee GMV",
        sortable: true,
        align: "right",
        render: (p) => <span className="text-zinc-650 dark:text-zinc-350">{formatCurrency(p.shopeeGmv)}</span>,
      });
      cols.push({
        key: "tiktokGmv",
        header: "TikTok GMV",
        sortable: true,
        align: "right",
        render: (p) => <span className="text-zinc-650 dark:text-zinc-350">{formatCurrency(p.tiktokGmv)}</span>,
      });
      cols.push({
        key: "combinedGmv",
        header: "Total GMV",
        sortable: true,
        align: "right",
        render: (p) => <span className="font-semibold text-rose-500">{formatCurrency(p.combinedGmv)}</span>,
      });
      cols.push({
        key: "combinedItemsSold",
        header: "Items Sold",
        sortable: true,
        align: "right",
        render: (p) => <span className="font-medium">{formatNumber(p.combinedItemsSold)}</span>,
      });
    } else {
      cols.push({
        key: "platformGmv",
        header: `${selectedPlatform} GMV`,
        sortable: true,
        align: "right",
        render: (p) => (
          <span className="font-semibold text-rose-500">{formatCurrency(p.platformGmv)}</span>
        ),
      });
      cols.push({
        key: "platformItemsSold",
        header: "Items Sold",
        sortable: true,
        align: "right",
        render: (p) => <span className="font-medium">{formatNumber(p.platformItemsSold)}</span>,
      });
    }

    return cols;
  }, [selectedPlatform]);

  // Live Streams columns
  const liveColumns = useMemo<ColumnDef<LiveSession>[]>(() => {
    return [
      {
        key: "creator_name",
        header: "Host Creator Name",
        sortable: true,
        render: (item) => (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-[10px] font-bold text-rose-500 dark:bg-rose-950/30">
              {item.creator_name.substring(0, 2).toUpperCase()}
            </div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">{item.creator_name}</p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Live Type",
        sortable: true,
        align: "center",
        render: (item) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold",
              item.type === "Seller"
                ? "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
            )}
          >
            {item.type}
          </span>
        ),
      },
      {
        key: "duration",
        header: "Duration",
        sortable: false,
        align: "center",
      },
      {
        key: "gmv",
        header: "Attributed GMV",
        sortable: true,
        align: "right",
        render: (item) => <span className="font-semibold text-rose-500">{formatCurrency(item.gmv)}</span>,
      },
      {
        key: "items_sold",
        header: "Items Sold",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.items_sold)}</span>,
      },
      {
        key: "views",
        header: "Views",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.views)}</span>,
      },
      {
        key: "clicks",
        header: "Product Clicks",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.clicks)}</span>,
      },
      {
        key: "ctr",
        header: "CTR",
        sortable: true,
        align: "right",
        render: (item) => <span className="font-medium text-emerald-500">{formatPercent(item.ctr)}</span>,
      },
    ];
  }, []);

  // Short videos columns
  const videoColumns = useMemo<ColumnDef<VideoMetric>[]>(() => {
    return [
      {
        key: "creator",
        header: "Creator",
        sortable: true,
        render: (item) => <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.creator}</span>,
      },
      {
        key: "title",
        header: "Video Title / Info",
        sortable: true,
        render: (item) => (
          <div className="max-w-xs sm:max-w-md">
            <p className="truncate text-zinc-700 dark:text-zinc-350" title={item.title}>
              {item.title}
            </p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Video Type",
        sortable: true,
        align: "center",
        render: (item) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold",
              item.type === "Seller"
                ? "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
            )}
          >
            {item.type}
          </span>
        ),
      },
      {
        key: "views",
        header: "Views (VV)",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.views)}</span>,
      },
      {
        key: "gmv",
        header: "Attributed GMV",
        sortable: true,
        align: "right",
        render: (item) => <span className="font-semibold text-rose-500">{formatCurrency(item.gmv)}</span>,
      },
      {
        key: "items_sold",
        header: "Items Sold",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.items_sold)}</span>,
      },
      {
        key: "ctr",
        header: "CTOR",
        sortable: true,
        align: "right",
        render: (item) => <span className="font-medium text-emerald-500">{formatPercent(item.ctr)}</span>,
      },
      {
        key: "likes",
        header: "Likes",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.likes)}</span>,
      },
      {
        key: "comments",
        header: "Comments",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.comments)}</span>,
      },
    ];
  }, []);

  // Shopee Ads Columns
  const shopeeAdColumns = useMemo<ColumnDef<ShopeeAdItem>[]>(() => {
    return [
      {
        key: "ad_name",
        header: "Shopee Ad Campaign Name",
        sortable: true,
        render: (item) => <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.ad_name}</span>,
      },
      {
        key: "impressions",
        header: "Impressions",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.impressions)}</span>,
      },
      {
        key: "clicks",
        header: "Clicks",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.clicks)}</span>,
      },
      {
        key: "cost",
        header: "Expense / Spend",
        sortable: true,
        align: "right",
        render: (item) => <span className="text-zinc-650 dark:text-zinc-350">{formatCurrency(item.cost)}</span>,
      },
      {
        key: "gmv",
        header: "Attributed GMV",
        sortable: true,
        align: "right",
        render: (item) => <span className="font-semibold text-rose-500">{formatCurrency(item.gmv)}</span>,
      },
      {
        key: "orders",
        header: "Conversions",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.orders)}</span>,
      },
      {
        key: "ctr",
        header: "CTR",
        sortable: true,
        align: "right",
        render: (item) => <span className="font-medium text-emerald-500">{formatPercent(item.ctr)}</span>,
      },
      {
        key: "roas",
        header: "ROAS",
        sortable: true,
        align: "right",
        render: (item) => (
          <span
            className={cn(
              "font-bold",
              item.roas >= 4
                ? "text-emerald-500"
                : item.roas >= 2
                ? "text-amber-500"
                : "text-rose-500"
            )}
          >
            {item.roas.toFixed(2)}x
          </span>
        ),
      },
    ];
  }, []);

  // TikTok Live Ads Columns
  const tiktokLiveAdColumns = useMemo<ColumnDef<TiktokLiveAdItem>[]>(() => {
    return [
      {
        key: "campaign_name",
        header: "LIVE Campaign Name",
        sortable: true,
        render: (item) => <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.campaign_name}</span>,
      },
      {
        key: "cost",
        header: "Cost / Budget",
        sortable: true,
        align: "right",
        render: (item) => <span className="text-zinc-650 dark:text-zinc-350">{formatCurrency(item.cost)}</span>,
      },
      {
        key: "gmv",
        header: "Gross Revenue (GMV)",
        sortable: true,
        align: "right",
        render: (item) => <span className="font-semibold text-rose-500">{formatCurrency(item.gmv)}</span>,
      },
      {
        key: "orders",
        header: "SKU Orders",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.orders)}</span>,
      },
      {
        key: "views",
        header: "LIVE Views",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.views)}</span>,
      },
      {
        key: "roi",
        header: "ROI",
        sortable: true,
        align: "right",
        render: (item) => (
          <span
            className={cn(
              "font-bold",
              item.roi >= 4
                ? "text-emerald-500"
                : item.roi >= 2
                ? "text-amber-500"
                : "text-rose-500"
            )}
          >
            {item.roi.toFixed(2)}x
          </span>
        ),
      },
    ];
  }, []);

  // TikTok Product Ads Columns
  const tiktokProductAdColumns = useMemo<ColumnDef<TiktokProductAdItem>[]>(() => {
    return [
      {
        key: "campaign_name",
        header: "Product Campaign Name",
        sortable: true,
        render: (item) => <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.campaign_name}</span>,
      },
      {
        key: "cost",
        header: "Cost / Expense",
        sortable: true,
        align: "right",
        render: (item) => <span className="text-zinc-650 dark:text-zinc-350">{formatCurrency(item.cost)}</span>,
      },
      {
        key: "gmv",
        header: "Attributed GMV",
        sortable: true,
        align: "right",
        render: (item) => <span className="font-semibold text-rose-500">{formatCurrency(item.gmv)}</span>,
      },
      {
        key: "orders",
        header: "SKU Orders",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.orders)}</span>,
      },
      {
        key: "impressions",
        header: "Impressions",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.impressions)}</span>,
      },
      {
        key: "clicks",
        header: "Clicks",
        sortable: true,
        align: "right",
        render: (item) => <span>{formatNumber(item.clicks)}</span>,
      },
      {
        key: "roi",
        header: "ROI",
        sortable: true,
        align: "right",
        render: (item) => (
          <span
            className={cn(
              "font-bold",
              item.roi >= 4
                ? "text-emerald-500"
                : item.roi >= 2
                ? "text-amber-500"
                : "text-rose-500"
            )}
          >
            {item.roi.toFixed(2)}x
          </span>
        ),
      },
    ];
  }, []);

  // 3. Dynamic card icons based on keys
  const getMetricIcon = (key: string) => {
    switch (key) {
      case "gmv":
        return DollarSign;
      case "orders":
        return ShoppingBag;
      case "visitors":
        return Users;
      case "conversion_rate":
        return Percent;
      case "repeat_purchase_rate":
        return Activity;
      case "aov":
        return Coins;
      default:
        return TrendingUp;
    }
  };

  if (!dashboardData) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white text-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-sm font-semibold tracking-wide">Loading Tome Ame Analytics...</p>
        </div>
      </div>
    );
  }

  // 5. Handles CSV Export based on active tab
  const handleExport = () => {
    const monthLabel = dashboardData.monthName.toLowerCase();
    const platformLabel = selectedPlatform.toLowerCase();
    
    if (activeTab === "overview") {
      const exportCols = [
        { key: "key", header: "Metric Code" },
        { key: "label", header: "Metric Name" },
        { key: "value", header: "Value" },
        { key: "growth", header: "MoM Growth (Decimal)" },
      ];
      exportToCSV(
        `tomeame-overview-${platformLabel}-${monthLabel}-2026`,
        dashboardData.overview,
        exportCols
      );
    } else if (activeTab === "products") {
      const exportCols = [
        { key: "name", header: "Product Name" },
        { key: "status", header: "Status" },
        { key: "shopeeGmv", header: "Shopee GMV (Rp)" },
        { key: "shopeeItemsSold", header: "Shopee Items Sold" },
        { key: "tiktokGmv", header: "TikTok GMV (Rp)" },
        { key: "tiktokItemsSold", header: "TikTok Items Sold" },
        { key: "combinedGmv", header: "Combined GMV (Rp)" },
        { key: "combinedItemsSold", header: "Combined Items Sold" },
        { key: "platformGmv", header: "Selected Attributed GMV (Rp)" },
        { key: "platformItemsSold", header: "Selected Attributed Items Sold" },
      ];
      exportToCSV(
        `tomeame-products-${platformLabel}-${monthLabel}-2026`,
        filteredProducts.length > 0 ? filteredProducts : dashboardData.products,
        exportCols
      );
    } else if (activeTab === "lives") {
      const exportCols = [
        { key: "creator_name", header: "Host Creator Name" },
        { key: "type", header: "Live Type" },
        { key: "duration", header: "Duration" },
        { key: "duration_minutes", header: "Duration (Minutes)" },
        { key: "gmv", header: "Attributed GMV (Rp)" },
        { key: "items_sold", header: "Items Sold" },
        { key: "views", header: "Views" },
        { key: "clicks", header: "Product Clicks" },
        { key: "ctr", header: "CTR (Decimal)" },
      ];
      exportToCSV(
        `tomeame-lives-${platformLabel}-${monthLabel}-2026`,
        filteredLives.length > 0 ? filteredLives : dashboardData.lives,
        exportCols
      );
    } else if (activeTab === "videos") {
      const exportCols = [
        { key: "creator", header: "Creator" },
        { key: "title", header: "Video Title" },
        { key: "type", header: "Video Type" },
        { key: "views", header: "Views (VV)" },
        { key: "gmv", header: "Attributed GMV (Rp)" },
        { key: "items_sold", header: "Items Sold" },
        { key: "ctr", header: "CTR/CTOR (Decimal)" },
        { key: "likes", header: "Likes" },
        { key: "comments", header: "Comments" },
      ];
      exportToCSV(
        `tomeame-videos-${platformLabel}-${monthLabel}-2026`,
        filteredVideos.length > 0 ? filteredVideos : dashboardData.videos,
        exportCols
      );
    } else if (activeTab === "ads") {
      // Export multi table campaign lists
      if (selectedPlatform === "Shopee" || selectedPlatform === "All") {
        const cols = [
          { key: "ad_name", header: "Shopee Ad Name" },
          { key: "impressions", header: "Impressions" },
          { key: "clicks", header: "Clicks" },
          { key: "cost", header: "Expense (Rp)" },
          { key: "gmv", header: "Attributed GMV (Rp)" },
          { key: "orders", header: "Orders/Conversions" },
          { key: "ctr", header: "CTR (Decimal)" },
          { key: "roas", header: "ROAS" },
        ];
        exportToCSV(
          `tomeame-ads-shopee-${monthLabel}-2026`,
          filteredShopeeAds.length > 0 ? filteredShopeeAds : dashboardData.ads.shopee,
          cols
        );
      }
      
      if (selectedPlatform === "TikTok" || selectedPlatform === "All") {
        const liveCols = [
          { key: "campaign_name", header: "TikTok Live Campaign Name" },
          { key: "cost", header: "Cost (Rp)" },
          { key: "gmv", header: "Gross Revenue (Rp)" },
          { key: "orders", header: "SKU Orders" },
          { key: "views", header: "LIVE Views" },
          { key: "roi", header: "ROI" },
        ];
        const prodCols = [
          { key: "campaign_name", header: "TikTok Product Campaign Name" },
          { key: "cost", header: "Cost (Rp)" },
          { key: "gmv", header: "Gross Revenue (Rp)" },
          { key: "orders", header: "SKU Orders" },
          { key: "impressions", header: "Ad Impressions" },
          { key: "clicks", header: "Ad Clicks" },
          { key: "roi", header: "ROI" },
        ];
        
        exportToCSV(
          `tomeame-ads-tiktok-live-${monthLabel}-2026`,
          filteredTiktokLiveAds.length > 0 ? filteredTiktokLiveAds : dashboardData.ads.tiktokLive,
          liveCols
        );
        exportToCSV(
          `tomeame-ads-tiktok-product-${monthLabel}-2026`,
          filteredTiktokProductAds.length > 0 ? filteredTiktokProductAds : dashboardData.ads.tiktokProduct,
          prodCols
        );
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0B0C] text-[#F4F4F6]">
      {/* 1. Sidebar Nav */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main content container */}
      <div className="flex flex-1 flex-col overflow-y-auto relative custom-scrollbar">
        {/* Background ambient lighting */}
        <div className="pointer-events-none absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#3D4BFF]/5 blur-[120px]" />
        <div className="pointer-events-none absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />

        {/* 4. Scrollable Content Wrapper */}
        <main className="flex-1 p-8 space-y-8 z-10">
          
          {/* TOP HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {activeTab === 'overview' ? 'Dashboard' : 
                 activeTab === 'videos' ? 'Video Overview' : 
                 activeTab === 'ai-insight' ? 'AI Insight' : 
                 'Analytics'}
              </h1>
              <p className="text-sm text-[#8E8E95] mt-1">
                {activeTab === 'overview' ? 'Ringkasan performa GMV MAX' : 
                 activeTab === 'videos' ? 'Analisis performa konten video' : 
                 'Detail performa analytics'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-4">
                 {/* Period Filter Pill */}
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
                           selectedMonth === month.key 
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
                   Reset Filter
                 </button>
              </div>

              {/* Platform and Action buttons row */}
              <div className="flex items-center gap-3">
                 <div className="flex items-center rounded-lg border border-[#1F1F23] bg-[#131316] p-1">
                    <button
                      onClick={() => setSelectedPlatform("All")}
                      className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", selectedPlatform === "All" ? "bg-[#2A2A32] text-white" : "text-[#8E8E95] hover:text-white")}
                    >
                      Semua Platform
                    </button>
                    <button
                      onClick={() => setSelectedPlatform("Shopee")}
                      className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5", selectedPlatform === "Shopee" ? "bg-[#EE4D2D]/20 text-[#EE4D2D]" : "text-[#8E8E95] hover:text-white")}
                    >
                      Shopee
                    </button>
                    <button
                      onClick={() => setSelectedPlatform("TikTok")}
                      className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5", selectedPlatform === "TikTok" ? "bg-zinc-800 text-white" : "text-[#8E8E95] hover:text-white")}
                    >
                      TikTok
                    </button>
                 </div>
                 <button onClick={handleExport} className="rounded-lg bg-white text-black px-4 py-1.5 text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                   <ArrowDownRight className="h-4 w-4" /> Export CSV
                 </button>
              </div>
            </div>
          </div>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 mt-4">
              {/* Dynamic metric summaries grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {dashboardData.overview.slice(0, 4).map((metric) => (
                  <MetricCard
                    key={metric.key}
                    label={metric.label}
                    value={metric.value}
                    growth={metric.growth}
                    format={metric.format}
                    icon={getMetricIcon(metric.key)}
                  />
                ))}
              </div>

              {/* Performance Rating Cards Row */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all hover:bg-emerald-500/15">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">18 Produk</h3>
                    <p className="text-sm font-semibold text-emerald-500">Performa Bagus</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5 shadow-[0_0_15px_rgba(234,179,8,0.05)] transition-all hover:bg-yellow-500/15">
                  <div className="rounded-full bg-yellow-500/20 p-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">24 Produk</h3>
                    <p className="text-sm font-semibold text-yellow-500">Performa Sedang</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-5 shadow-[0_0_15px_rgba(239,68,68,0.05)] transition-all hover:bg-red-500/15">
                  <div className="rounded-full bg-red-500/20 p-2">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">5 Produk</h3>
                    <p className="text-sm font-semibold text-red-500">Performa Buruk</p>
                  </div>
                </div>
              </div>

              {/* GMV Trend Chart & Platform Share Distribution row */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Visual curves */}
                <div className="lg:col-span-2">
                  <TrendChart
                    dataPoints={dashboardData.dailyTrends}
                    platform={selectedPlatform}
                  />
                </div>

                {/* ROAS Gauge */}
                <div className="flex flex-col h-full">
                  <RoasGauge 
                    value={dashboardData.ads.summary.roi || 5.4} 
                    target={10} 
                    className="h-full rounded-2xl" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Product top stats metrics */}
              <div className="grid gap-6 sm:grid-cols-3">
                <MetricCard
                  label="Unique Products Catalog"
                  value={dashboardData.products.length}
                  format="number"
                  icon={ShoppingBag}
                  description="Active on selected filters"
                />
                <MetricCard
                  label="Top Selling Revenue"
                  value={dashboardData.products[0]?.platformGmv || 0}
                  format="currency"
                  icon={Award}
                  description={
                    dashboardData.products[0]?.name
                      ? `"${dashboardData.products[0].name.substring(0, 15)}..."`
                      : "-"
                  }
                />
                <MetricCard
                  label="Total Sold units"
                  value={dashboardData.products.reduce((acc, p) => acc + p.platformItemsSold, 0)}
                  format="number"
                  icon={Store}
                  description="Consolidated items sold"
                />
              </div>

              {/* Products Table */}
              <DataTable
                columns={productColumns}
                data={dashboardData.products}
                searchFields={["name"]}
                searchPlaceholder="Cari nama produk (Regex support)..."
                defaultSort={{ key: "platformGmv", direction: "desc" }}
                onFilteredDataChange={setFilteredProducts}
              />
            </div>
          )}

          {/* TAB 3: LIVE STREAMS */}
          {activeTab === "lives" && (
            <div className="space-y-6">
              {selectedPlatform === "Shopee" ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 rounded-2xl">
                  <Tv className="h-10 w-10 text-zinc-300 mb-3" />
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Shopee Lives Unavailable</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm text-center">
                    Shopee Live data spreadsheets were not included in the raw sheets. Switch platform to TikTok or All to view Live host performance.
                  </p>
                </div>
              ) : (
                <>
                  {/* Lives Metrics */}
                  <div className="grid gap-6 sm:grid-cols-4">
                    <MetricCard
                      label="Total Live Streams"
                      value={dashboardData.lives.length}
                      format="number"
                      icon={Tv}
                      description="Unique streams recorded"
                    />
                    <MetricCard
                      label="Live Attributed GMV"
                      value={dashboardData.lives.reduce((acc, l) => acc + l.gmv, 0)}
                      format="currency"
                      icon={DollarSign}
                    />
                    <MetricCard
                      label="Best Live Host"
                      value={dashboardData.lives[0]?.gmv || 0}
                      format="currency"
                      icon={Award}
                      description={dashboardData.lives[0]?.creator_name ? `@${dashboardData.lives[0].creator_name}` : "-"}
                    />
                    <MetricCard
                      label="Average Stream CTR"
                      value={
                        dashboardData.lives.length > 0
                          ? dashboardData.lives.reduce((acc, l) => acc + l.ctr, 0) / dashboardData.lives.length
                          : 0
                      }
                      format="percent"
                      icon={Percent}
                      description="Direct product click conversion"
                    />
                  </div>

                  {/* Lives Table */}
                  <DataTable
                    columns={liveColumns}
                    data={dashboardData.lives}
                    searchFields={["creator", "creator_name"]}
                    searchPlaceholder="Cari nickname host (Regex support)..."
                    defaultSort={{ key: "gmv", direction: "desc" }}
                    onFilteredDataChange={setFilteredLives}
                  />
                </>
              )}
            </div>
          )}

          {/* TAB 4: VIDEOS */}
          {activeTab === "videos" && (
            <div className="space-y-6">
              {selectedPlatform === "Shopee" ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[#1F1F23] bg-[#131316] rounded-2xl">
                  <Play className="h-10 w-10 text-[#8E8E95] mb-3" />
                  <h4 className="text-sm font-semibold text-white">Shopee Videos Unavailable</h4>
                  <p className="text-xs text-[#8E8E95] mt-1 max-w-sm text-center">
                    Shopee Video content spreadsheets were not included in the raw sheets. Switch platform to TikTok or All to view Video creator performance.
                  </p>
                </div>
              ) : (
                <>
                  {/* Videos Metrics */}
                  <div className="grid gap-6 sm:grid-cols-4">
                    <MetricCard
                      label="Short Videos Items"
                      value={dashboardData.videos.length}
                      format="number"
                      icon={Play}
                      description="Unique items tracked"
                    />
                    <MetricCard
                      label="Video Attributed GMV"
                      value={dashboardData.videos.reduce((acc, v) => acc + v.gmv, 0)}
                      format="currency"
                      icon={DollarSign}
                    />
                    <MetricCard
                      label="Total Video Views"
                      value={dashboardData.videos.reduce((acc, v) => acc + v.views, 0)}
                      format="number"
                      icon={Eye}
                      description="Cumulative video playbacks"
                    />
                    <MetricCard
                      label="Video Engagement (Likes)"
                      value={dashboardData.videos.reduce((acc, v) => acc + v.likes, 0)}
                      format="number"
                      icon={Heart}
                      description="Total audience feedback"
                    />
                  </div>

                  {/* Videos Table */}
                  <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">Video Database</h3>
                        <p className="text-sm text-[#8E8E95]">Daftar performa per video konten</p>
                      </div>
                    </div>
                    <DataTable
                      columns={videoColumns}
                      data={dashboardData.videos}
                      searchFields={["creator", "title"]}
                      searchPlaceholder="Cari judul video atau creator (Regex support)..."
                      defaultSort={{ key: "gmv", direction: "desc" }}
                      onFilteredDataChange={setFilteredVideos}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 8: AI INSIGHT */}
          {activeTab === "ai-insight" && (
            <AIInsight videos={dashboardData.videos} />
          )}

          {/* TAB 5: ADS CAMPAIGN */}
          {activeTab === "ads" && (
            <div className="space-y-6">
              {/* Campaign High level KPI cards */}
              <div className="grid gap-6 sm:grid-cols-4">
                <MetricCard
                  label="Total Ad Spend"
                  value={dashboardData.ads.summary.cost}
                  format="currency"
                  icon={Coins}
                  description="Paid traffic expenses"
                />
                <MetricCard
                  label="Total Ad GMV"
                  value={dashboardData.ads.summary.gmv}
                  format="currency"
                  icon={DollarSign}
                  description="Paid traffic revenue attribution"
                />
                <MetricCard
                  label="Consolidated ROI / ROAS"
                  value={dashboardData.ads.summary.roi}
                  format="number"
                  icon={TrendingUp}
                  description="Rev / Spend efficiency ratio"
                  className="border-rose-300 dark:border-rose-950 shadow-rose-100/50"
                  renderValue={() => `${dashboardData.ads.summary.roi.toFixed(2)}x`}
                />
                <MetricCard
                  label="Attributed Orders"
                  value={dashboardData.ads.summary.orders}
                  format="number"
                  icon={ShoppingBag}
                  description="Completed ad acquisitions"
                />
              </div>

              {/* Dynamic Stacked Ad Campaign lists based on active platform */}
              
              {/* 5A. Shopee CPC Ads list */}
              {(selectedPlatform === "Shopee" || selectedPlatform === "All") && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <div className="h-2 w-2 rounded-full bg-[#ee4d2d]" />
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Shopee CPC Ads Campaign</h3>
                  </div>

                  {dashboardData.ads.shopee.length === 0 ? (
                    <p className="text-sm text-zinc-400 py-4">Tidak ada data iklan Shopee untuk bulan ini.</p>
                  ) : (
                    <DataTable
                      columns={shopeeAdColumns}
                      data={dashboardData.ads.shopee}
                      searchFields={["ad_name"]}
                      searchPlaceholder="Cari nama iklan Shopee..."
                      defaultSort={{ key: "cost", direction: "desc" }}
                      onFilteredDataChange={setFilteredShopeeAds}
                    />
                  )}
                </div>
              )}

              {/* 5B. TikTok GMV Max Ads lists */}
              {(selectedPlatform === "TikTok" || selectedPlatform === "All") && (
                <div className="space-y-8 pt-4">
                  
                  {/* LIVE ADS */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <div className="h-2 w-2 rounded-full bg-zinc-950 dark:bg-white" />
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">TikTok GMV Max Live Campaign</h3>
                    </div>

                    {dashboardData.ads.tiktokLive.length === 0 ? (
                      <p className="text-sm text-zinc-400 py-4">Tidak ada data iklan LIVE TikTok untuk bulan ini.</p>
                    ) : (
                      <DataTable
                        columns={tiktokLiveAdColumns}
                        data={dashboardData.ads.tiktokLive}
                        searchFields={["campaign_name"]}
                        searchPlaceholder="Cari campaign LIVE TikTok..."
                        defaultSort={{ key: "cost", direction: "desc" }}
                        onFilteredDataChange={setFilteredTiktokLiveAds}
                      />
                    )}
                  </div>

                  {/* PRODUCT ADS */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <div className="h-2 w-2 rounded-full bg-zinc-950 dark:bg-white" />
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">TikTok GMV Max Product Campaign</h3>
                    </div>

                    {dashboardData.ads.tiktokProduct.length === 0 ? (
                      <p className="text-sm text-zinc-400 py-4">Tidak ada data iklan produk TikTok untuk bulan ini.</p>
                    ) : (
                      <DataTable
                        columns={tiktokProductAdColumns}
                        data={dashboardData.ads.tiktokProduct}
                        searchFields={["campaign_name"]}
                        searchPlaceholder="Cari campaign produk TikTok..."
                        defaultSort={{ key: "cost", direction: "desc" }}
                        onFilteredDataChange={setFilteredTiktokProductAds}
                      />
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB: INPUT DATA */}
          {activeTab === "input-data" && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-8 shadow-lg">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-[#3D4BFF]" />
                    Upload & Konsolidasi Dokumen
                  </h2>
                  <p className="text-sm text-[#8E8E95] mt-1 text-left">
                    Unggah file laporan bulanan (Excel/CSV) Anda. Sistem akan menyimpan file ke direktori yang sesuai dan secara otomatis menjalankan proses konsolidasi ETL untuk memperbarui seluruh dashboard.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left Column: Config */}
                  <div className="space-y-4 text-left">
                    {/* Platform Selector */}
                    <div>
                      <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Platform</label>
                      <select
                        value={uploadPlatform}
                        onChange={(e) => handlePlatformChange(e.target.value)}
                        className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3D4BFF]/50 transition-colors"
                      >
                        <option value="Shopee">Shopee</option>
                        <option value="TikTok">TikTok Shop</option>
                        <option value="Meta">Meta Ads</option>
                      </select>
                    </div>

                    {/* Category Selector */}
                    <div>
                      <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Jenis Dokumen / Folder</label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3D4BFF]/50 transition-colors"
                      >
                        {getCategoriesForPlatform(uploadPlatform).map((cat) => (
                          <option key={cat.key} value={cat.key}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Month / Year Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Bulan</label>
                        <select
                          value={uploadMonth}
                          onChange={(e) => setUploadMonth(e.target.value)}
                          className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3D4BFF]/50 transition-colors"
                        >
                          <option value="januari">Januari</option>
                          <option value="februari">Februari</option>
                          <option value="maret">Maret</option>
                          <option value="april">April</option>
                          <option value="mei">Mei</option>
                          <option value="juni">Juni</option>
                          <option value="juli">Juli</option>
                          <option value="agustus">Agustus</option>
                          <option value="september">September</option>
                          <option value="oktober">Oktober</option>
                          <option value="november">November</option>
                          <option value="desember">Desember</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Tahun</label>
                        <select
                          value={uploadYear}
                          onChange={(e) => setUploadYear(e.target.value)}
                          className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3D4BFF]/50 transition-colors"
                        >
                          <option value="2026">2026</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: File Area */}
                  <div className="flex flex-col justify-between text-left">
                    <div>
                      <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">File Dokumen</label>
                      
                      {!uploadFile ? (
                        <div
                          className="border-2 border-dashed border-[#1F1F23] hover:border-[#3D4BFF]/30 hover:bg-[#3D4BFF]/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group h-[190px]"
                          onClick={() => document.getElementById("file-input")?.click()}
                        >
                          <UploadCloud className="h-10 w-10 text-[#8E8E95] group-hover:text-white group-hover:scale-105 transition-all mb-3 duration-300" />
                          <p className="text-sm font-semibold text-white">Pilih file atau tarik kesini</p>
                          <p className="text-xs text-[#8E8E95] mt-1">
                            {uploadCategory === "Shp Ads" ? "Menerima file .csv" : "Menerima file .xlsx"}
                          </p>
                          <input
                            id="file-input"
                            type="file"
                            className="hidden"
                            accept={uploadCategory === "Shp Ads" ? ".csv" : ".xlsx"}
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setUploadFile(e.target.files[0]);
                                setUploadError(null);
                                setUploadErrorDetails(null);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="border border-[#1F1F23] bg-[#0B0B0C] rounded-2xl p-4 flex items-center justify-between h-[190px]">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-[#3D4BFF]/10 rounded-xl">
                              <FileText className="h-8 w-8 text-[#3D4BFF]" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-white max-w-[200px] truncate" title={uploadFile.name}>
                                {uploadFile.name}
                              </p>
                              <p className="text-xs text-[#8E8E95] mt-0.5">
                                {(uploadFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setUploadFile(null)}
                            className="p-2 text-[#8E8E95] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress / Success / Errors */}
                <div className="mt-6">
                  {isUploading && (
                    <div className="flex items-center gap-3 p-4 border border-[#3D4BFF]/20 bg-[#3D4BFF]/5 rounded-xl">
                      <Loader2 className="h-5 w-5 text-[#3D4BFF] animate-spin" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white">Mengunggah Laporan & Mengkonsolidasi Data...</p>
                        <p className="text-xs text-[#8E8E95] mt-0.5">Harap tunggu, proses ETL Python sedang memproses file.</p>
                      </div>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="flex items-center gap-3 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
                      <div className="p-1.5 bg-emerald-500/10 rounded-full">
                        <Check className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-emerald-400">Proses Berhasil!</p>
                        <p className="text-xs text-[#8E8E95] mt-0.5">{uploadSuccess}</p>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl text-left space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-rose-500/10 rounded-full">
                          <XCircle className="h-5 w-5 text-rose-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-rose-400">Proses Gagal</p>
                          <p className="text-xs text-[#8E8E95] mt-0.5">{uploadError}</p>
                        </div>
                      </div>
                      {uploadErrorDetails && (
                        <div className="bg-[#0B0B0C] border border-[#1F1F23] rounded-lg p-3 text-[11px] font-mono text-zinc-400 overflow-x-auto max-h-[150px] custom-scrollbar">
                          {uploadErrorDetails}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="mt-8 border-t border-[#1F1F23] pt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setUploadFile(null);
                      setUploadError(null);
                      setUploadErrorDetails(null);
                      setUploadSuccess(null);
                    }}
                    disabled={isUploading}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold border border-[#1F1F23] text-[#8E8E95] hover:text-white hover:bg-zinc-800 disabled:opacity-50 transition-all duration-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={!uploadFile || isUploading}
                    className="px-8 py-2.5 rounded-xl text-sm font-bold bg-[#3D4BFF] hover:bg-[#3D4BFF]/90 text-white shadow-[0_0_20px_rgba(61,75,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sedang Mengkonsolidasi...
                      </>
                    ) : (
                      "Unggah & Konsolidasi Data"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RIWAYAT UPLOAD */}
          {activeTab === "riwayat" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">Riwayat Upload & ETL</h3>
                    <p className="text-sm text-[#8E8E95]">Daftar aktivitas log unggah dokumen manual bulanan</p>
                  </div>
                  <button
                    onClick={fetchUploadHistory}
                    disabled={historyLoading}
                    className="rounded-lg border border-[#1F1F23] bg-[#0B0B0C] hover:bg-zinc-800 text-xs font-semibold px-4 py-2 transition-colors flex items-center gap-1.5 text-white"
                  >
                    {historyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Refresh Data
                  </button>
                </div>

                {historyLoading && uploadHistory.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-[#3D4BFF] animate-spin mb-4" />
                    <p className="text-sm text-[#8E8E95]">Memuat riwayat...</p>
                  </div>
                ) : uploadHistory.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center border border-dashed border-[#1F1F23] bg-[#0B0B0C]/40 rounded-2xl">
                    <Calendar className="h-10 w-10 text-[#8E8E95]/40 mb-3" />
                    <h4 className="text-sm font-semibold text-white">Belum Ada Riwayat Upload</h4>
                    <p className="text-xs text-[#8E8E95] mt-1 max-w-sm text-center">
                      Anda belum mengunggah dokumen apapun secara manual. Pergi ke tab "Input Data" untuk mengunggah dokumen pertama Anda.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#1F1F23] text-[#8E8E95] font-bold text-xs uppercase tracking-wider">
                          <th className="py-4 px-3">Waktu Upload</th>
                          <th className="py-4 px-3">Platform</th>
                          <th className="py-4 px-3">Jenis Dokumen</th>
                          <th className="py-4 px-3">Periode</th>
                          <th className="py-4 px-3">Nama File</th>
                          <th className="py-4 px-3">Ukuran</th>
                          <th className="py-4 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F1F23] text-zinc-300">
                        {uploadHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-[#1C1C21]/30 transition-colors group">
                            <td className="py-4 px-3 font-medium text-left">
                              {new Date(item.timestamp).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-4 px-3 text-left">
                              <span className={cn(
                                "inline-flex items-center rounded px-2 py-0.5 text-xs font-bold",
                                item.platform === "Shopee" ? "bg-[#EE4D2D]/10 text-[#EE4D2D]" :
                                item.platform === "TikTok" ? "bg-zinc-800 text-white border border-zinc-700" : "bg-cyan-500/10 text-cyan-400"
                              )}>
                                {item.platform}
                              </span>
                            </td>
                            <td className="py-4 px-3 font-semibold text-white text-left">
                              {item.category}
                            </td>
                            <td className="py-4 px-3 text-left">
                              {item.month} {item.year}
                            </td>
                            <td className="py-4 px-3 max-w-[200px] truncate font-mono text-xs text-[#8E8E95] group-hover:text-zinc-200 text-left" title={item.filename}>
                              {item.filename}
                            </td>
                            <td className="py-4 px-3 text-[#8E8E95] text-left">
                              {(item.sizeBytes / 1024).toFixed(1)} KB
                            </td>
                            <td className="py-4 px-3 text-right">
                              <span className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm",
                                item.status === "Berhasil" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-help"
                              )} title={item.errorMessage || undefined}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
