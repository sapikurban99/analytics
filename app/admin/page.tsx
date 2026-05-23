"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  ArrowLeft,
  UploadCloud,
  FileText,
  Trash2,
  Edit,
  Clock,
  Database,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  User,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Inbox
} from "lucide-react";
import Link from "next/link";

interface MonthItem {
  key: string;
  name: string;
}

interface UploadHistoryItem {
  id: string;
  timestamp: string;
  platform: string;
  category: string;
  month: string;
  year: string;
  filename: string;
  sizeBytes: number;
  status: "Berhasil" | "Gagal";
  errorMessage: string | null;
}

export default function AdminPage() {
  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"upload" | "database" | "history" | "edit">("database");

  // Edit Data States
  const [editSelectedMonth, setEditSelectedMonth] = useState<string>("");
  const [editSelectedSection, setEditSelectedSection] = useState<string>("tiktok_overview");
  const [editMonthRawData, setEditMonthRawData] = useState<Record<string, any> | null>(null);
  const [isFetchingEditData, setIsFetchingEditData] = useState(false);
  const [editFetchError, setEditFetchError] = useState<string | null>(null);
  // Structured form state for overview sections
  const [structuredForm, setStructuredForm] = useState<Record<string, any>>({});
  // Raw JSON editor state
  const [rawJsonText, setRawJsonText] = useState<string>("");
  const [rawJsonError, setRawJsonError] = useState<string | null>(null);
  // Save feedback
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [saveSectionSuccess, setSaveSectionSuccess] = useState<string | null>(null);
  const [saveSectionError, setSaveSectionError] = useState<string | null>(null);

  // Database Management States
  const [months, setMonths] = useState<MonthItem[]>([]);
  const [isFetchingMonths, setIsFetchingMonths] = useState(false);
  const [monthError, setMonthError] = useState<string | null>(null);
  
  // Edit Modal States
  const [editingMonth, setEditingMonth] = useState<MonthItem | null>(null);
  const [editName, setEditName] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Modal States
  const [deletingMonth, setDeletingMonth] = useState<MonthItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  // Upload History States
  const [historyList, setHistoryList] = useState<UploadHistoryItem[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Check sessionStorage on Mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem("tomeame_admin_auth") === "true";
    if (isAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch Database Months
  const fetchMonths = async () => {
    setIsFetchingMonths(true);
    setMonthError(null);
    try {
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) throw new Error("Gagal mengambil data bulan dari database.");
      const data = await res.json();
      
      if (data && data.months) {
        const parsedMonths = Object.keys(data.months)
          .sort((a, b) => b.localeCompare(a))
          .map((key) => ({
            key,
            name: data.months[key].month_name,
          }));
        setMonths(parsedMonths);
      }
    } catch (err: any) {
      console.error(err);
      setMonthError(err.message || "Gagal mengambil data bulan.");
    } finally {
      setIsFetchingMonths(false);
    }
  };

  // Fetch Upload History
  const fetchHistory = async () => {
    setIsFetchingHistory(true);
    setHistoryError(null);
    try {
      const res = await fetch("/api/upload");
      if (!res.ok) throw new Error("Gagal mengambil riwayat upload.");
      const data = await res.json();
      setHistoryList(data.uploads || []);
    } catch (err: any) {
      console.error(err);
      setHistoryError(err.message || "Gagal memuat riwayat upload.");
    } finally {
      setIsFetchingHistory(false);
    }
  };

  // Fetch initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMonths();
      fetchHistory();
    }
  }, [isAuthenticated]);

  // Handle Login Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      if (username.trim() === "admin" && password === "password123") {
        sessionStorage.setItem("tomeame_admin_auth", "true");
        setIsAuthenticated(true);
      } else {
        setAuthError("Username atau password salah! Silakan coba lagi.");
      }
      setIsLoggingIn(false);
    }, 800);
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem("tomeame_admin_auth");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  // Document categories helper
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

  // File Upload Submission
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

      if (res.ok && result.success) {
        setUploadSuccess(
          `Dokumen ${uploadPlatform} - ${uploadCategory} (${uploadMonth} ${uploadYear}) berhasil diunggah & dikonsolidasikan!`
        );
        setUploadFile(null);
        // Refresh months & history list
        fetchMonths();
        fetchHistory();
      } else {
        setUploadError(result.error || "Gagal mengunggah file.");
        setUploadErrorDetails(result.details || null);
      }
    } catch (err: any) {
      setUploadError("Terjadi kesalahan koneksi saat mengunggah dokumen.");
      setUploadErrorDetails(err.message || null);
    } finally {
      setIsUploading(false);
    }
  };

  // Edit Month Rename
  const handleRenameMonth = async () => {
    if (!editingMonth || !editName.trim()) return;
    setIsSavingEdit(true);
    setEditError(null);

    try {
      const res = await fetch("/api/admin/metrics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthKey: editingMonth.key,
          newMonthName: editName.trim(),
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setEditingMonth(null);
        fetchMonths();
      } else {
        setEditError(result.error || "Gagal mengubah nama bulan.");
      }
    } catch (err: any) {
      setEditError(err.message || "Koneksi bermasalah.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Month
  const handleDeleteMonth = async () => {
    if (!deletingMonth) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/metrics?monthKey=${deletingMonth.key}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setDeletingMonth(null);
        fetchMonths();
        fetchHistory();
      } else {
        setDeleteError(result.error || "Gagal menghapus data bulan.");
      }
    } catch (err: any) {
      setDeleteError(err.message || "Koneksi bermasalah.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch full data for a specific month for the editor
  const fetchMonthData = async (monthKey: string) => {
    setIsFetchingEditData(true);
    setEditFetchError(null);
    setEditMonthRawData(null);
    setSaveSectionSuccess(null);
    setSaveSectionError(null);
    try {
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) throw new Error("Gagal mengambil data dari server.");
      const data = await res.json();
      if (data?.months?.[monthKey]) {
        const monthData = data.months[monthKey];
        setEditMonthRawData(monthData);
        // Auto-load the currently selected section
        const sectionData = monthData[editSelectedSection];
        if (sectionData !== undefined) {
          if (STRUCTURED_SECTIONS_LIST.includes(editSelectedSection)) {
            setStructuredForm(flattenForForm(sectionData));
          } else {
            setRawJsonText(JSON.stringify(sectionData, null, 2));
          }
        } else {
          setRawJsonText("[]");
        }
      } else {
        setEditFetchError(`Data untuk bulan ${monthKey} tidak ditemukan.`);
      }
    } catch (err: any) {
      setEditFetchError(err.message || "Gagal memuat data bulan.");
    } finally {
      setIsFetchingEditData(false);
    }
  };

  const STRUCTURED_SECTIONS_LIST = ["shopee_overview", "tiktok_overview", "combined_overview"];
  const RAW_SECTIONS_LIST = [
    "ads", "daily_trends", "products", "products_consolidated", "lives", "videos",
    "tiktok_channel_video", "tiktok_channel_live", "tiktok_channel_product_card",
    "tiktok_affiliate_creator", "tiktok_affiliate_product", "tiktok_affiliate_sample", "tiktok_affiliate_commission",
    "shopee_channel_revenue_streams", "shopee_affiliate_kol",
    "website_overview_utm", "meta_ads_performance",
  ];
  const ALL_SECTIONS_LIST = [...STRUCTURED_SECTIONS_LIST, ...RAW_SECTIONS_LIST];

  const SECTION_GROUP_LABELS: Record<string, string> = {
    "shopee_overview": "📊 Shopee Overview",
    "tiktok_overview": "📊 TikTok Overview",
    "combined_overview": "📊 Combined Overview",
    "ads": "{ } Ads Campaign",
    "daily_trends": "{ } Daily Trends",
    "products": "{ } Products",
    "products_consolidated": "{ } Products Consolidated",
    "lives": "{ } Lives",
    "videos": "{ } Videos",
    "tiktok_channel_video": "🎥 TikTok Channel - Video",
    "tiktok_channel_live": "🔴 TikTok Channel - Live",
    "tiktok_channel_product_card": "🛍️ TikTok Channel - Product Card",
    "tiktok_affiliate_creator": "👤 TikTok Affiliate - Creator",
    "tiktok_affiliate_product": "📦 TikTok Affiliate - Product",
    "tiktok_affiliate_sample": "📬 TikTok Affiliate - Sample & Shipping",
    "tiktok_affiliate_commission": "💰 TikTok Affiliate - Commission",
    "shopee_channel_revenue_streams": "📈 Shopee Channel - Revenue Streams",
    "shopee_affiliate_kol": "🤝 Shopee Affiliate - KOL",
    "website_overview_utm": "🌐 Website Overview UTM",
    "meta_ads_performance": "📣 Meta Ads Performance",
  };

  const SECTION_GROUPS: { label: string; sections: string[] }[] = [
    { label: "Overview", sections: ["combined_overview", "shopee_overview", "tiktok_overview"] },
    { label: "Raw Data", sections: ["ads", "daily_trends", "products", "products_consolidated", "lives", "videos"] },
    { label: "TikTok Channel", sections: ["tiktok_channel_video", "tiktok_channel_live", "tiktok_channel_product_card"] },
    { label: "TikTok Affiliate", sections: ["tiktok_affiliate_creator", "tiktok_affiliate_product", "tiktok_affiliate_sample", "tiktok_affiliate_commission"] },
    { label: "Shopee", sections: ["shopee_channel_revenue_streams", "shopee_affiliate_kol"] },
    { label: "Other Channels", sections: ["website_overview_utm", "meta_ads_performance"] },
  ];

  const isStructuredSection = (key: string) => STRUCTURED_SECTIONS_LIST.includes(key);

  const flattenForForm = (obj: Record<string, any>, prefix = ""): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "object" && v !== null && !Array.isArray(v)) {
        Object.assign(result, flattenForForm(v, fullKey));
      } else {
        result[fullKey] = v;
      }
    }
    return result;
  };

  const unflattenForm = (flat: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const [path, value] of Object.entries(flat)) {
      const keys = path.split(".");
      let cur: any = result;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]] || typeof cur[keys[i]] !== "object") cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      const numVal = parseFloat(value);
      cur[keys[keys.length - 1]] = isNaN(numVal) ? value : numVal;
    }
    return result;
  };

  const handleSectionChange = (section: string) => {
    setEditSelectedSection(section);
    setRawJsonError(null);
    setSaveSectionSuccess(null);
    setSaveSectionError(null);
    if (!editMonthRawData) return;
    const sectionData = editMonthRawData[section];
    if (sectionData !== undefined) {
      if (STRUCTURED_SECTIONS_LIST.includes(section)) {
        setStructuredForm(flattenForForm(sectionData));
      } else {
        setRawJsonText(JSON.stringify(sectionData, null, 2));
      }
    } else {
      if (STRUCTURED_SECTIONS_LIST.includes(section)) {
        setStructuredForm({});
      } else {
        setRawJsonText("[]");
      }
    }
  };

  const handleSectionSave = async () => {
    if (!editSelectedMonth) return;
    setIsSavingSection(true);
    setSaveSectionSuccess(null);
    setSaveSectionError(null);

    let sectionData: any;
    if (isStructuredSection(editSelectedSection)) {
      sectionData = unflattenForm(structuredForm);
    } else {
      try {
        sectionData = JSON.parse(rawJsonText);
        setRawJsonError(null);
      } catch (e: any) {
        setRawJsonError("JSON tidak valid: " + e.message);
        setIsSavingSection(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/metrics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthKey: editSelectedMonth,
          sectionKey: editSelectedSection,
          sectionData,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSaveSectionSuccess(result.message || "Berhasil disimpan!");
        setEditMonthRawData((prev: any) => prev ? { ...prev, [editSelectedSection]: sectionData } : prev);
      } else {
        setSaveSectionError(result.error || "Gagal menyimpan data.");
      }
    } catch (err: any) {
      setSaveSectionError("Koneksi bermasalah: " + err.message);
    } finally {
      setIsSavingSection(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0B0C] text-[#F4F4F6]">
      {/* Decorative Glow */}
      <div className="pointer-events-none absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#3D4BFF]/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />

      <div className="flex flex-1 flex-col overflow-y-auto relative custom-scrollbar">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-[#1F1F23]/80 bg-[#0B0B0C]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)] animate-pulse" />
            <span className="text-base font-bold tracking-tight text-white">Admin Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-[#1F1F23] bg-[#131316] px-4 py-2 text-xs font-semibold text-[#8E8E95] hover:text-white hover:border-zinc-700 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 hover:text-white transition-all"
              >
                Keluar
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-8 space-y-8 z-10">
          {/* Auth Screen */}
          {!isAuthenticated ? (
            <div className="max-w-md w-full mx-auto mt-12 space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)] mb-3">
                  <Lock className="h-6 w-6 text-cyan-400" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Protected Area</h1>
                <p className="text-sm text-[#8E8E95]">Masukkan kredensial admin</p>
              </div>

              <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-8 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-[#3D4BFF] to-pink-500" />
                <form onSubmit={handleLogin} className="space-y-5 relative">
                  {authError && (
                    <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}
                  <div className="space-y-2 text-left">
                    <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-4 w-4 text-[#8E8E95]" />
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username"
                        className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-[#3D4BFF]/50 focus:ring-1 focus:ring-[#3D4BFF]/50" required />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-4 w-4 text-[#8E8E95]" />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password"
                        className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] pl-11 pr-11 py-3 text-sm text-white outline-none focus:border-[#3D4BFF]/50 focus:ring-1 focus:ring-[#3D4BFF]/50" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-[#8E8E95] hover:text-white">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoggingIn}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-[#3D4BFF] to-pink-500 p-[1.5px] shadow-[0_0_30px_rgba(61,75,255,0.2)] hover:shadow-[0_0_35px_rgba(61,75,255,0.3)] transition-all font-semibold">
                    <div className="w-full bg-[#131316] rounded-[10px] py-3 text-sm text-white flex items-center justify-center gap-2 hover:bg-[#131316]/50 transition-colors">
                      {isLoggingIn ? <><RefreshCw className="h-4 w-4 animate-spin" />Verifikasi...</> : <><Unlock className="h-4 w-4 text-cyan-400" />Masuk Area Admin</>}
                    </div>
                  </button>
                </form>
              </div>
            </div>
          ) : (
          
          /* Admin Area Dashboard */
          <div className="space-y-8">
            
            {/* Header + Tab Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Setup & Setting Data</h1>
                <p className="text-sm text-[#8E8E95] mt-1">Kelola database bulanan, upload dokumen, dan edit data</p>
              </div>

              {/* Tab Selector - pill style like dashboard period filter */}
              <div className="flex items-center rounded-full border border-[#1F1F23] bg-[#131316] p-1 shrink-0 self-start md:self-auto">
                <button onClick={() => setActiveTab("database")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTab === "database" ? "bg-[#11112B] text-white border border-[#3D4BFF]/50 shadow-[0_0_15px_rgba(61,75,255,0.2)]" : "text-[#8E8E95] hover:text-white"}`}>
                  <Database className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />Kelola Database
                </button>
                <button onClick={() => setActiveTab("edit")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTab === "edit" ? "bg-[#11112B] text-white border border-[#3D4BFF]/50 shadow-[0_0_15px_rgba(61,75,255,0.2)]" : "text-[#8E8E95] hover:text-white"}`}>
                  <Edit className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />Edit Data
                </button>
                <button onClick={() => setActiveTab("upload")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTab === "upload" ? "bg-[#11112B] text-white border border-[#3D4BFF]/50 shadow-[0_0_15px_rgba(61,75,255,0.2)]" : "text-[#8E8E95] hover:text-white"}`}>
                  <UploadCloud className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />Upload Data
                </button>
                <button onClick={() => setActiveTab("history")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTab === "history" ? "bg-[#11112B] text-white border border-[#3D4BFF]/50 shadow-[0_0_15px_rgba(61,75,255,0.2)]" : "text-[#8E8E95] hover:text-white"}`}>
                  <Clock className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />Riwayat
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-6">
              
              {/* TAB: KELOLA DATABASE */}
              {activeTab === "database" && (
                <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6 shadow-sm">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Database className="h-5 w-5 text-cyan-400" />
                        Bulan yang Terdaftar
                      </h2>
                      <p className="text-sm text-[#8E8E95] mt-1">Daftar bulan yang tersimpan di database</p>
                    </div>
                    <button onClick={fetchMonths} disabled={isFetchingMonths}
                      className="p-2 text-[#8E8E95] hover:text-white rounded-xl bg-[#0B0B0C] border border-[#1F1F23] transition-colors" title="Refresh">
                      <RefreshCw className={`h-4 w-4 ${isFetchingMonths ? "animate-spin text-cyan-400" : ""}`} />
                    </button>
                  </div>

                  {monthError && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" /><span>{monthError}</span>
                    </div>
                  )}

                  {isFetchingMonths && months.length === 0 ? (
                    <div className="py-16 flex flex-col items-center text-center space-y-3">
                      <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
                      <p className="text-sm text-[#8E8E95]">Memuat data...</p>
                    </div>
                  ) : months.length === 0 ? (
                    <div className="py-16 flex flex-col items-center text-center space-y-4 rounded-xl border border-dashed border-[#1F1F23] bg-[#0B0B0C]/40 p-8">
                      <Database className="h-10 w-10 text-[#8E8E95]" />
                      <h3 className="text-sm font-bold text-white">Database Kosong</h3>
                      <p className="text-xs text-[#8E8E95] max-w-sm">Belum ada data. Upload dokumen via tab Upload Data.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#1F1F23]">
                            <th className="py-3 px-4 text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Month Key</th>
                            <th className="py-3 px-4 text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Nama Bulan</th>
                            <th className="py-3 px-4 text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Tahun</th>
                            <th className="py-3 px-4 text-xs font-bold text-[#8E8E95] uppercase tracking-wider text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F1F23]">
                          {months.map((m) => {
                            const [year] = m.key.split("-");
                            return (
                              <tr key={m.key} className="hover:bg-[#1C1C21]/30 transition-colors">
                                <td className="py-4 px-4 text-sm font-mono text-cyan-400">{m.key}</td>
                                <td className="py-4 px-4 text-sm font-bold text-white">{m.name}</td>
                                <td className="py-4 px-4 text-sm text-[#8E8E95]">{year}</td>
                                <td className="py-4 px-4 text-sm text-right space-x-2">
                                  <button onClick={() => { setEditingMonth(m); setEditName(m.name); setEditError(null); }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F1F23] bg-[#0B0B0C] px-3 py-1.5 text-xs text-[#8E8E95] hover:text-white transition-colors">
                                    <Edit className="h-3 w-3" />Ubah Nama
                                  </button>
                                  <button onClick={() => { setDeletingMonth(m); setDeleteError(null); }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 hover:text-white transition-colors">
                                    <Trash2 className="h-3 w-3" />Hapus
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: UPLOAD DATA */}
              {activeTab === "upload" && (
                <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <UploadCloud className="h-5 w-5 text-cyan-400" />
                      Upload & Konsolidasi Dokumen
                    </h2>
                    <p className="text-sm text-[#8E8E95] mt-1">Unggah file laporan bulanan (Excel/CSV) untuk memperbarui dashboard</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Left: Config */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Platform</label>
                        <select value={uploadPlatform} onChange={(e) => handlePlatformChange(e.target.value)}
                          className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white outline-none focus:border-[#3D4BFF]/50 focus:ring-1 focus:ring-[#3D4BFF]/50">
                          <option value="Shopee">Shopee</option>
                          <option value="TikTok">TikTok Shop</option>
                          <option value="Meta">Meta Ads</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Jenis Dokumen</label>
                        <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}
                          className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white outline-none focus:border-[#3D4BFF]/50 focus:ring-1 focus:ring-[#3D4BFF]/50">
                          {getCategoriesForPlatform(uploadPlatform).map((cat) => (
                            <option key={cat.key} value={cat.key}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Bulan</label>
                          <select value={uploadMonth} onChange={(e) => setUploadMonth(e.target.value)}
                            className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white outline-none focus:border-[#3D4BFF]/50 focus:ring-1 focus:ring-[#3D4BFF]/50">
                            {["januari","februari","maret","april","mei","juni","juli","agustus","september","oktober","november","desember"].map((m) => (
                              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Tahun</label>
                          <select value={uploadYear} onChange={(e) => setUploadYear(e.target.value)}
                            className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white outline-none focus:border-[#3D4BFF]/50 focus:ring-1 focus:ring-[#3D4BFF]/50">
                            <option value="2026">2026</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right: File Area */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">File Laporan</label>
                        {!uploadFile ? (
                          <div onClick={() => document.getElementById("file-input")?.click()}
                            className="border-2 border-dashed border-[#1F1F23] hover:border-[#3D4BFF]/30 hover:bg-[#3D4BFF]/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[190px]">
                            <UploadCloud className="h-10 w-10 text-[#8E8E95] group-hover:text-white mb-3" />
                            <p className="text-sm font-semibold text-white">Pilih file excel/csv</p>
                            <p className="text-xs text-[#8E8E95] mt-1">{uploadCategory === "Shp Ads" ? ".csv" : ".xlsx"}</p>
                            <input id="file-input" type="file" className="hidden" accept={uploadCategory === "Shp Ads" ? ".csv" : ".xlsx"}
                              onChange={(e) => { if (e.target.files?.[0]) { setUploadFile(e.target.files[0]); setUploadError(null); } }} />
                          </div>
                        ) : (
                          <div className="border border-[#1F1F23] bg-[#0B0B0C] rounded-2xl p-4 flex items-center justify-between h-[190px]">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-cyan-500/10 rounded-xl"><FileText className="h-8 w-8 text-cyan-400" /></div>
                              <div className="text-left">
                                <p className="text-sm font-semibold text-white max-w-[160px] truncate" title={uploadFile.name}>{uploadFile.name}</p>
                                <p className="text-xs text-[#8E8E95] mt-0.5">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button onClick={() => setUploadFile(null)} className="p-2 text-[#8E8E95] hover:text-rose-500 rounded-xl transition-all"><Trash2 className="h-5 w-5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {uploadFile && (
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleUploadSubmit} disabled={isUploading}
                        className="rounded-xl bg-gradient-to-r from-cyan-500 via-[#3D4BFF] to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                        {isUploading ? <><RefreshCw className="h-4 w-4 animate-spin" />Memproses...</> : <><UploadCloud className="h-4 w-4" />Upload & Sinkronisasi</>}
                      </button>
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    {uploadSuccess && (
                      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-400">
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /><span>{uploadSuccess}</span>
                      </div>
                    )}
                    {uploadError && (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
                        <div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" /><span>{uploadError}</span></div>
                        {uploadErrorDetails && <div className="mt-2 ml-8 text-xs text-rose-300 font-mono bg-[#0B0B0C]/40 p-3 rounded-xl">{uploadErrorDetails}</div>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: RIWAYAT UPLOAD */}
              {/* TAB: HISTORY */}
              {activeTab === "history" && (
                <div className="rounded-2xl border border-[#1F1F23] bg-[#131316] p-6 shadow-sm">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-cyan-400" />
                        Riwayat Upload
                      </h2>
                      <p className="text-sm text-[#8E8E95] mt-1">Daftar semua dokumen yang pernah diupload beserta statusnya</p>
                    </div>
                    <button onClick={fetchHistory} disabled={isFetchingHistory}
                      className="p-2 text-[#8E8E95] hover:text-white rounded-xl bg-[#0B0B0C] border border-[#1F1F23] transition-colors">
                      <RefreshCw className={`h-4 w-4 ${isFetchingHistory ? "animate-spin text-cyan-400" : ""}`} />
                    </button>
                  </div>

                  {historyError && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{historyError}</span>
                    </div>
                  )}

                  {isFetchingHistory && historyList.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center">
                      <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
                      <p className="text-sm text-[#8E8E95] mt-3">Memuat riwayat...</p>
                    </div>
                  ) : historyList.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-[#1F1F23] bg-[#0B0B0C]/40 p-8">
                      <Inbox className="h-12 w-12 text-[#8E8E95] mb-4" />
                      <p className="text-sm font-semibold text-white">Belum ada riwayat upload</p>
                      <p className="text-xs text-[#8E8E95] mt-1">Upload dokumen pertama melalui tab Upload Data</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-[#1F1F23] text-xs text-[#8E8E95] uppercase tracking-wider">
                            <th className="pb-3 pr-4 font-semibold">Tanggal</th>
                            <th className="pb-3 pr-4 font-semibold">Platform</th>
                            <th className="pb-3 pr-4 font-semibold">Kategori</th>
                            <th className="pb-3 pr-4 font-semibold">Periode</th>
                            <th className="pb-3 pr-4 font-semibold">File</th>
                            <th className="pb-3 pr-4 font-semibold">Ukuran</th>
                            <th className="pb-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F1F23]">
                          {historyList.map((log) => (
                            <tr key={log.id} className="text-white hover:bg-[#0B0B0C]/30 transition-colors">
                              <td className="py-3.5 pr-4 text-sm text-[#8E8E95]">
                                {new Date(log.timestamp).toLocaleString("id-ID", {
                                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                })}
                              </td>
                              <td className="py-3.5 pr-4">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${
                                  log.platform === "Shopee"
                                    ? "bg-[#EE4D2D]/10 text-[#EE4D2D]"
                                    : log.platform === "TikTok"
                                    ? "bg-white/10 text-white"
                                    : "bg-cyan-500/10 text-cyan-400"
                                }`}>
                                  {log.platform}
                                </span>
                              </td>
                              <td className="py-3.5 pr-4 text-sm text-[#8E8E95]">{log.category}</td>
                              <td className="py-3.5 pr-4 text-sm text-[#8E8E95]">{log.month} {log.year}</td>
                              <td className="py-3.5 pr-4 text-sm font-mono text-[#8E8E95] max-w-[160px] truncate" title={log.filename}>
                                <span className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                                  {log.filename}
                                </span>
                              </td>
                              <td className="py-3.5 pr-4 text-sm text-[#8E8E95]">
                                {(log.sizeBytes / 1024).toFixed(1)} KB
                              </td>
                              <td className="py-3.5">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  log.status === "Berhasil"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-rose-500/10 text-rose-400"
                                }`}>
                                  {log.status}
                                </span>
                                {log.errorMessage && (
                                  <p className="text-[10px] text-rose-400 mt-1 font-mono max-w-[160px] truncate bg-[#0B0B0C]/60 p-1 rounded" title={log.errorMessage}>
                                    {log.errorMessage}
                                  </p>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: EDIT DATA JSON */}
              {activeTab === "edit" && (
                <div className="space-y-6">
                  {/* Month selector */}
                  <div className="rounded-3xl border border-[#1F1F23] bg-[#131316]/60 p-6 shadow-xl backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                      <Edit className="h-5 w-5 text-cyan-400" />
                      Edit Data JSON Bulan
                    </h2>
                    <p className="text-xs text-[#8E8E95] mb-5">
                      Pilih bulan dan section yang ingin diedit. Section overview menggunakan form terstruktur; section lain menggunakan raw JSON editor.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Bulan</label>
                        <select
                          value={editSelectedMonth}
                          onChange={(e) => setEditSelectedMonth(e.target.value)}
                          className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                        >
                          <option value="">-- Pilih Bulan --</option>
                          {months.map((m) => (
                            <option key={m.key} value={m.key}>{m.name} ({m.key})</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => editSelectedMonth && fetchMonthData(editSelectedMonth)}
                        disabled={!editSelectedMonth || isFetchingEditData}
                        className="rounded-xl bg-cyan-500 px-5 py-3 text-xs font-bold text-black hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-2 shrink-0"
                      >
                        {isFetchingEditData ? (
                          <><RefreshCw className="h-4 w-4 animate-spin" />Memuat...</>
                        ) : (
                          <><Database className="h-4 w-4" />Load Data</>  
                        )}
                      </button>
                    </div>

                    {editFetchError && (
                      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{editFetchError}</span>
                      </div>
                    )}
                  </div>

                  {/* Editor Area — only shown after data is loaded */}
                  {editMonthRawData && (
                    <div className="rounded-3xl border border-[#1F1F23] bg-[#131316]/60 shadow-xl backdrop-blur-md overflow-hidden">
                      {/* Section Selector Tabs */}
                      <div className="border-b border-[#1F1F23] p-4 bg-[#0B0B0C]/40">
                        <span className="text-xs font-bold text-[#8E8E95] mr-2 uppercase tracking-wider block mb-3">Section:</span>
                        {SECTION_GROUPS.map((group) => {
                          const visibleSections = group.sections.filter(s => editMonthRawData[s] !== undefined);
                          if (visibleSections.length === 0) return null;
                          return (
                            <div key={group.label} className="mb-2">
                              <span className="text-[10px] font-semibold text-[#8E8E95] uppercase tracking-wider block mb-1.5 ml-1">{group.label}</span>
                              <div className="flex items-center gap-2 flex-wrap">
                                {visibleSections.map((section) => (
                                  <button
                                    key={section}
                                    onClick={() => handleSectionChange(section)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                      editSelectedSection === section
                                        ? isStructuredSection(section)
                                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                          : "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                        : "bg-[#131316] text-[#8E8E95] border border-[#1F1F23] hover:text-white"
                                    }`}
                                  >
                                    {SECTION_GROUP_LABELS[section] || section}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Editor Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <h3 className="text-sm font-bold text-white">
                              {isStructuredSection(editSelectedSection) ? "Structured Form" : "Raw JSON Editor"}
                              <span className="ml-2 text-xs font-mono text-[#8E8E95]">— {editSelectedSection}</span>
                            </h3>
                            <p className="text-xs text-[#8E8E95] mt-0.5">
                              {isStructuredSection(editSelectedSection)
                                ? "Edit nilai field numerik secara langsung melalui form input."
                                : "Edit JSON mentah section ini. Pastikan format JSON valid sebelum menyimpan."}
                            </p>
                          </div>
                          {!isStructuredSection(editSelectedSection) && (
                            <button
                              onClick={() => {
                                try {
                                  const parsed = JSON.parse(rawJsonText);
                                  setRawJsonText(JSON.stringify(parsed, null, 2));
                                  setRawJsonError(null);
                                } catch (e: any) {
                                  setRawJsonError("Format JSON tidak valid: " + e.message);
                                }
                              }}
                              className="rounded-lg border border-[#1F1F23] bg-[#0B0B0C] px-3 py-1.5 text-xs font-semibold text-[#8E8E95] hover:text-white transition-colors"
                            >
                              ✨ Format JSON
                            </button>
                          )}
                        </div>

                        {/* STRUCTURED FORM MODE */}
                        {isStructuredSection(editSelectedSection) ? (
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(structuredForm).map(([key, value]) => (
                              <div key={key}>
                                <label className="block text-[10px] font-bold text-[#8E8E95] uppercase tracking-wider mb-1.5">
                                  {key}
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  value={value as number}
                                  onChange={(e) => setStructuredForm(prev => ({ ...prev, [key]: e.target.value }))}
                                  className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* RAW JSON MODE */
                          <div className="space-y-3">
                            {rawJsonError && (
                              <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                <span className="font-mono">{rawJsonError}</span>
                              </div>
                            )}
                            <textarea
                              value={rawJsonText}
                              onChange={(e) => { setRawJsonText(e.target.value); setRawJsonError(null); }}
                              rows={24}
                              spellCheck={false}
                              className="w-full rounded-2xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-4 text-xs text-emerald-400 font-mono leading-relaxed focus:outline-none focus:border-cyan-500/30 transition-colors resize-y custom-scrollbar"
                              style={{ minHeight: '400px' }}
                            />
                            <p className="text-[10px] text-[#8E8E95]">
                              Jumlah karakter: {rawJsonText.length.toLocaleString()} • Estimasi baris: {rawJsonText.split('\n').length.toLocaleString()}
                            </p>
                          </div>
                        )}

                        {/* Save / Feedback */}
                        <div className="mt-6 flex items-center justify-between gap-4">
                          <div className="flex-1">
                            {saveSectionSuccess && (
                              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-400">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <span>{saveSectionSuccess}</span>
                              </div>
                            )}
                            {saveSectionError && (
                              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-400">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <span>{saveSectionError}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3 shrink-0">
                            <button
                              onClick={() => handleSectionChange(editSelectedSection)}
                              disabled={isSavingSection}
                              className="rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-2.5 text-xs font-bold text-[#8E8E95] hover:text-white transition-colors disabled:opacity-50"
                            >
                              Reset
                            </button>
                            <button
                              onClick={handleSectionSave}
                              disabled={isSavingSection}
                              className="rounded-xl bg-gradient-to-r from-cyan-500 to-[#3D4BFF] px-6 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(61,75,255,0.2)] hover:shadow-[0_0_25px_rgba(61,75,255,0.3)] disabled:opacity-50 flex items-center gap-2 transition-all"
                            >
                              {isSavingSection ? (
                                <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Menyimpan...</>
                              ) : (
                                <><CheckCircle2 className="h-3.5 w-3.5" />Simpan ke Database</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        </main>

        {/* FOOTER */}
        <footer className="relative z-10 py-6 border-t border-[#1F1F23]/80 text-center text-xs text-[#8E8E95]">
          <p>© 2026 Tome Ame Channel Analytics Dashboard. All rights reserved.</p>
        </footer>

      {/* MODAL EDIT: RENAME MONTH */}
      {editingMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative max-w-md w-full rounded-3xl border border-[#1F1F23] bg-[#131316] p-6 shadow-2xl text-left overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-[#3D4BFF]" />
            
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit className="h-5 w-5 text-cyan-400" />
              Ubah Nama Tampilan Bulan
            </h3>
            <p className="text-xs text-[#8E8E95] mt-1.5">
              Anda mengubah nama tampilan bulan untuk key database <code className="text-cyan-400 font-mono">{editingMonth.key}</code>.
            </p>

            <div className="mt-4 space-y-4">
              {editError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Nama Bulan Baru</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Contoh: Januari 2026"
                  className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingMonth(null)}
                disabled={isSavingEdit}
                className="rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-2 text-xs font-bold text-[#8E8E95] hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleRenameMonth}
                disabled={isSavingEdit || !editName.trim()}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSavingEdit ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION: DELETE MONTH */}
      {deletingMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative max-w-md w-full rounded-3xl border border-rose-500/20 bg-[#131316] p-6 shadow-2xl text-left overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500" />
            
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
              Hapus Data Bulan?
            </h3>
            
            <div className="mt-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 p-4 space-y-2">
              <p className="text-xs text-rose-300 font-bold leading-normal">
                PERINGATAN: Tindakan ini permanen dan tidak dapat dibatalkan!
              </p>
              <p className="text-xs text-[#8E8E95] leading-relaxed">
                Tindakan ini akan menghapus bulan <span className="font-bold text-white">"{deletingMonth.name}" ({deletingMonth.key})</span> dari database Supabase.
              </p>
              <p className="text-xs text-[#8E8E95] leading-relaxed">
                Semua file spreadsheets (.xlsx/.csv) asli terkait bulan tersebut di direktori <code className="bg-black/50 p-0.5 rounded px-1 text-zinc-300 font-mono">./dokumen</code> juga akan dihapus agar data tetap sinkron dan tidak memicu penulisan ulang otomatis.
              </p>
            </div>

            {deleteError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletingMonth(null)}
                disabled={isDeleting}
                className="rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-2 text-xs font-bold text-[#8E8E95] hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMonth}
                disabled={isDeleting}
                className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus Permanen"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
