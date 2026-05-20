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
  Sparkles
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
  const [activeTab, setActiveTab] = useState<"upload" | "database" | "history">("database");

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

  return (
    <main className="min-h-screen bg-gradient-to-tr from-[#0B0B0C] via-[#0E0E12] to-[#12121D] text-[#F4F4F6] font-sans antialiased relative selection:bg-cyan-500/30 overflow-x-hidden flex flex-col justify-between">
      
      {/* Decorative Glow Grid */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none z-0" />

      {/* HEADER BAR */}
      <header className="relative z-10 border-b border-[#1F1F23]/80 bg-[#0B0B0C]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)] animate-pulse" />
          <span className="text-base font-bold tracking-tight text-white">
            Channel Analytics Admin Portal
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-[#1F1F23] bg-[#131316] px-4 py-2 text-xs font-semibold text-[#8E8E95] hover:text-white hover:border-zinc-700 transition-all duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
          
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 hover:text-white transition-all duration-200"
            >
              Keluar
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 relative z-10 flex flex-col justify-center">
        
        {/* Auth Screen */}
        {!isAuthenticated ? (
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)] mb-3">
                <Lock className="h-6 w-6 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Protected Area</h1>
              <p className="text-sm text-[#8E8E95]">Masukkan kredensial admin Anda untuk mengelola data dashboard.</p>
            </div>

            {/* Login Card */}
            <div className="rounded-3xl border border-[#1F1F23] bg-[#131316]/90 p-8 shadow-2xl backdrop-blur-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-[#3D4BFF] to-pink-500" />
              
              <form onSubmit={handleLogin} className="space-y-5">
                {authError && (
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Username */}
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#8E8E95]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username"
                      className="w-full rounded-2xl border border-[#1F1F23] bg-[#0B0B0C] pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#8E8E95]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full rounded-2xl border border-[#1F1F23] bg-[#0B0B0C] pl-11 pr-11 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-[#8E8E95] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-[#3D4BFF] to-pink-500 p-[1.5px] shadow-[0_0_30px_rgba(61,75,255,0.2)] hover:shadow-[0_0_35px_rgba(61,75,255,0.3)] transition-all font-semibold"
                >
                  <div className="w-full bg-[#131316] rounded-[14px] py-3 text-sm text-white flex items-center justify-center gap-2 hover:bg-[#131316]/50 transition-colors">
                    {isLoggingIn ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                        Verifikasi...
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 text-cyan-400" />
                        Masuk Area Admin
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Dummy Info Box */}
              <div className="mt-6 border-t border-[#1F1F23] pt-5 text-left">
                <div className="rounded-2xl bg-cyan-950/20 border border-cyan-500/20 p-4">
                  <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Kredensial Demo
                  </p>
                  <p className="text-xs text-[#8E8E95] mt-1.5">
                    Username: <code className="text-white bg-[#0B0B0C] px-1.5 py-0.5 rounded">admin</code>
                  </p>
                  <p className="text-xs text-[#8E8E95] mt-1">
                    Password: <code className="text-white bg-[#0B0B0C] px-1.5 py-0.5 rounded">password123</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          
          /* Admin Area Dashboard */
          <div className="space-y-6">
            
            {/* Header Title section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Setup & Setting Data
                </h1>
                <p className="text-sm text-[#8E8E95] mt-1">
                  Kelola database bulanan, upload dokumen laporan keuangan multi-channel, dan edit riwayat.
                </p>
              </div>

              {/* TABS SELECTOR */}
              <div className="inline-flex rounded-xl bg-[#131316] border border-[#1F1F23] p-1 gap-1 shrink-0 self-start md:self-auto">
                <button
                  onClick={() => setActiveTab("database")}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    activeTab === "database"
                      ? "bg-[#252538] text-white"
                      : "text-[#8E8E95] hover:text-[#F4F4F6]"
                  }`}
                >
                  <Database className="inline h-3.5 w-3.5 mr-1.5" />
                  Kelola Database
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    activeTab === "upload"
                      ? "bg-[#252538] text-white"
                      : "text-[#8E8E95] hover:text-[#F4F4F6]"
                  }`}
                >
                  <UploadCloud className="inline h-3.5 w-3.5 mr-1.5" />
                  Upload Data
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    activeTab === "history"
                      ? "bg-[#252538] text-white"
                      : "text-[#8E8E95] hover:text-[#F4F4F6]"
                  }`}
                >
                  <Clock className="inline h-3.5 w-3.5 mr-1.5" />
                  Riwayat Upload
                </button>
              </div>
            </div>

            {/* TAB CONTAINER CONTENT */}
            <div className="w-full">
              
              {/* TAB 1: KELOLA DATABASE */}
              {activeTab === "database" && (
                <div className="rounded-3xl border border-[#1F1F23] bg-[#131316]/60 p-6 shadow-xl backdrop-blur-md">
                  <div className="mb-6 text-left flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Database className="h-5 w-5 text-cyan-400" />
                        Bulan yang Terdaftar
                      </h2>
                      <p className="text-xs text-[#8E8E95] mt-1">
                        Berikut adalah daftar bulan yang sudah berhasil diproses di Supabase. Anda dapat mengubah nama tampilan bulan atau menghapusnya untuk upload ulang.
                      </p>
                    </div>

                    <button
                      onClick={fetchMonths}
                      disabled={isFetchingMonths}
                      className="p-2 text-[#8E8E95] hover:text-white rounded-xl bg-[#0B0B0C] border border-[#1F1F23] transition-colors"
                      title="Refresh data"
                    >
                      <RefreshCw className={`h-4 w-4 ${isFetchingMonths ? "animate-spin text-cyan-400" : ""}`} />
                    </button>
                  </div>

                  {monthError && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{monthError}</span>
                    </div>
                  )}

                  {isFetchingMonths && months.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                      <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
                      <p className="text-sm text-[#8E8E95]">Memuat data bulan dari database...</p>
                    </div>
                  ) : months.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 rounded-2xl border border-dashed border-[#1F1F23] bg-[#0B0B0C]/40 p-8">
                      <Database className="h-12 w-12 text-[#8E8E95] mb-2" />
                      <h3 className="text-sm font-bold text-white">Database Kosong</h3>
                      <p className="text-xs text-[#8E8E95] max-w-sm">
                        Belum ada data bulan yang tersimpan di Supabase. Silakan unggah dokumen laporan terlebih dahulu melalui tab <b>Upload Data</b>.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[#1F1F23]">
                            <th className="py-3 px-4 text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Month Key</th>
                            <th className="py-3 px-4 text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Nama Bulan</th>
                            <th className="py-3 px-4 text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Tahun</th>
                            <th className="py-3 px-4 text-xs font-bold text-[#8E8E95] uppercase tracking-wider text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F1F23]/60">
                          {months.map((m) => {
                            const [year, code] = m.key.split("-");
                            return (
                              <tr key={m.key} className="hover:bg-[#0B0B0C]/30 transition-colors group">
                                <td className="py-4 px-4 text-sm font-mono text-cyan-400">{m.key}</td>
                                <td className="py-4 px-4 text-sm font-bold text-white">{m.name}</td>
                                <td className="py-4 px-4 text-sm text-[#8E8E95]">{year}</td>
                                <td className="py-4 px-4 text-sm text-right space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingMonth(m);
                                      setEditName(m.name);
                                      setEditError(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F1F23] bg-[#0B0B0C] px-3 py-1.5 text-xs text-[#8E8E95] hover:text-white hover:border-zinc-700 transition-colors"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Ubah Nama
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeletingMonth(m);
                                      setDeleteError(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 hover:text-white transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Hapus
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

              {/* TAB 2: UPLOAD DATA */}
              {activeTab === "upload" && (
                <div className="mx-auto max-w-4xl space-y-6">
                  <div className="rounded-3xl border border-[#1F1F23] bg-[#131316]/60 p-8 shadow-xl backdrop-blur-md">
                    <div className="mb-6 text-left">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <UploadCloud className="h-5 w-5 text-cyan-400" />
                        Upload & Konsolidasi Dokumen
                      </h2>
                      <p className="text-sm text-[#8E8E95] mt-1">
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
                            className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                            className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                              className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                              className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                            >
                              <option value="2026">2026</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: File Area */}
                      <div className="flex flex-col justify-between text-left">
                        <div>
                          <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">File Laporan</label>
                          
                          {!uploadFile ? (
                            <div
                              className="border-2 border-dashed border-[#1F1F23] hover:border-cyan-500/30 hover:bg-cyan-500/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group h-[190px]"
                              onClick={() => document.getElementById("file-input")?.click()}
                            >
                              <UploadCloud className="h-10 w-10 text-[#8E8E95] group-hover:text-white group-hover:scale-105 transition-all mb-3 duration-300" />
                              <p className="text-sm font-semibold text-white">Pilih file excel/csv Anda</p>
                              <p className="text-xs text-[#8E8E95] mt-1">
                                {uploadCategory === "Shp Ads" ? "Menerima format file .csv" : "Menerima format file .xlsx"}
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
                                <div className="p-3 bg-cyan-500/10 rounded-xl">
                                  <FileText className="h-8 w-8 text-cyan-400" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-semibold text-white max-w-[160px] truncate" title={uploadFile.name}>
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

                    {/* Submit Section */}
                    {uploadFile && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleUploadSubmit}
                          disabled={isUploading}
                          className="rounded-2xl bg-gradient-to-r from-cyan-500 via-[#3D4BFF] to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Memproses Dokumen...
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-4 w-4" />
                              Mulai Upload & Sinkronisasi
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Progress / Success / Errors */}
                    <div className="mt-6 text-left">
                      {uploadSuccess && (
                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm font-medium text-emerald-400">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{uploadSuccess}</span>
                        </div>
                      )}

                      {uploadError && (
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm font-medium text-rose-400 space-y-2">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{uploadError}</span>
                          </div>
                          {uploadErrorDetails && (
                            <div className="pl-8 text-xs text-rose-300 font-mono bg-[#0B0B0C]/40 p-3 rounded-xl border border-rose-500/10 whitespace-pre-wrap max-h-36 overflow-y-auto">
                              {uploadErrorDetails}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RIWAYAT UPLOAD */}
              {activeTab === "history" && (
                <div className="rounded-3xl border border-[#1F1F23] bg-[#131316]/60 p-6 shadow-xl backdrop-blur-md">
                  <div className="mb-6 text-left flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-cyan-400" />
                        Log Upload
                      </h2>
                      <p className="text-xs text-[#8E8E95] mt-1">
                        Daftar lengkap riwayat dokumen Excel/CSV yang pernah diunggah beserta status keberhasilan ETL konsolidasi.
                      </p>
                    </div>

                    <button
                      onClick={fetchHistory}
                      disabled={isFetchingHistory}
                      className="p-2 text-[#8E8E95] hover:text-white rounded-xl bg-[#0B0B0C] border border-[#1F1F23] transition-colors"
                    >
                      <RefreshCw className={`h-4 w-4 ${isFetchingHistory ? "animate-spin text-cyan-400" : ""}`} />
                    </button>
                  </div>

                  {historyError && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{historyError}</span>
                    </div>
                  )}

                  {isFetchingHistory && historyList.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                      <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
                      <p className="text-sm text-[#8E8E95]">Memuat riwayat log dari database...</p>
                    </div>
                  ) : historyList.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 rounded-2xl border border-dashed border-[#1F1F23] bg-[#0B0B0C]/40 p-8">
                      <Clock className="h-12 w-12 text-[#8E8E95] mb-2" />
                      <h3 className="text-sm font-bold text-white">Belum Ada Riwayat</h3>
                      <p className="text-xs text-[#8E8E95] max-w-sm">
                        Belum ada dokumen yang terunggah. File apa pun yang Anda unggah akan secara otomatis tercatat di tabel log riwayat ini.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#1F1F23]">
                            <th className="py-3 px-3 text-[#8E8E95] font-bold uppercase tracking-wider">Tanggal & Waktu</th>
                            <th className="py-3 px-3 text-[#8E8E95] font-bold uppercase tracking-wider">Platform</th>
                            <th className="py-3 px-3 text-[#8E8E95] font-bold uppercase tracking-wider">Kategori</th>
                            <th className="py-3 px-3 text-[#8E8E95] font-bold uppercase tracking-wider">Bulan / Tahun</th>
                            <th className="py-3 px-3 text-[#8E8E95] font-bold uppercase tracking-wider">Nama File</th>
                            <th className="py-3 px-3 text-[#8E8E95] font-bold uppercase tracking-wider">Ukuran</th>
                            <th className="py-3 px-3 text-[#8E8E95] font-bold uppercase tracking-wider text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F1F23]/60">
                          {historyList.map((log) => (
                            <tr key={log.id} className="hover:bg-[#0B0B0C]/30 transition-colors">
                              <td className="py-3.5 px-3 text-[#8E8E95] font-mono">
                                {new Date(log.timestamp).toLocaleString("id-ID", {
                                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                })}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 font-bold ${
                                  log.platform === "Shopee"
                                    ? "bg-[#EE4D2D]/10 text-[#EE4D2D]"
                                    : log.platform === "TikTok"
                                    ? "bg-white/10 text-white"
                                    : "bg-cyan-500/10 text-cyan-400"
                                }`}>
                                  {log.platform}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 font-semibold text-zinc-300">{log.category}</td>
                              <td className="py-3.5 px-3 text-zinc-400">{log.month} {log.year}</td>
                              <td className="py-3.5 px-3 font-mono text-[#8E8E95] max-w-[150px] truncate" title={log.filename}>
                                {log.filename}
                              </td>
                              <td className="py-3.5 px-3 text-[#8E8E95]">
                                {(log.sizeBytes / 1024).toFixed(1)} KB
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${
                                  log.status === "Berhasil"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-rose-500/10 text-rose-400"
                                }`}>
                                  {log.status}
                                </span>
                                {log.errorMessage && (
                                  <p className="text-[10px] text-rose-400 text-left mt-1 font-mono max-w-[150px] truncate bg-[#0B0B0C]/60 p-1 rounded" title={log.errorMessage}>
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

            </div>
          </div>
        )}

      </div>

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

    </main>
  );
}
