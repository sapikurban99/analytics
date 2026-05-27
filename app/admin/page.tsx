"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Lock, UploadCloud, FileText, Trash2, Edit,
  Clock, Database, AlertTriangle, CheckCircle2, RefreshCw,
  User, Eye, EyeOff, ChevronRight, Inbox,
  Code, Settings, BarChart3, Wand2, Loader2
} from "lucide-react";
import Link from "next/link";
import DataExplorer from "@/components/admin/data-explorer";

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
  const [activeTab, setActiveTab] = useState<"explorer" | "upload" | "history" | "edit">("explorer");
  // Channel filter
  const [activeChannel, setActiveChannel] = useState<"all" | "shopee" | "tiktok" | "meta" | "website">("all");

  // Edit Data States
  const [editSelectedMonth, setEditSelectedMonth] = useState<string>("");
  const [editSelectedSection, setEditSelectedSection] = useState<string>("tiktok_overview");
  const [editMonthRawData, setEditMonthRawData] = useState<Record<string, any> | null>(null);
  const [isFetchingEditData, setIsFetchingEditData] = useState(false);
  const [editFetchError, setEditFetchError] = useState<string | null>(null);
  const [structuredForm, setStructuredForm] = useState<Record<string, any>>({});
  const [rawJsonText, setRawJsonText] = useState<string>("");
  const [rawJsonError, setRawJsonError] = useState<string | null>(null);
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

  // Batch Upload States
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(-1);
  const [uploadStatuses, setUploadStatuses] = useState<Record<string, "waiting" | "uploading" | "success" | "error">>({});
  const [uploadResults, setUploadResults] = useState<string[]>([]);

  const [uploadPlatform, setUploadPlatform] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<string>("");
  const [uploadMonth, setUploadMonth] = useState<string>("");
  const [uploadYear, setUploadYear] = useState<string>("2026");
  const [autoDetect, setAutoDetect] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadErrorDetails, setUploadErrorDetails] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Upload History States
  const [historyList, setHistoryList] = useState<UploadHistoryItem[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Explorer States
  const [explorerMonth, setExplorerMonth] = useState<string>("");
  const [explorerMonthData, setExplorerMonthData] = useState<Record<string, any> | null>(null);
  const [explorerMonthName, setExplorerMonthName] = useState<string>("");
  const [isFetchingExplorer, setIsFetchingExplorer] = useState(false);
  const [explorerError, setExplorerError] = useState<string | null>(null);

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

  // Fetch Explorer Data
  const fetchExplorerData = useCallback(async (monthKey: string) => {
    if (!monthKey) return;
    setIsFetchingExplorer(true);
    setExplorerError(null);
    try {
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) throw new Error("Gagal mengambil data.");
      const data = await res.json();
      if (data?.months?.[monthKey]) {
        setExplorerMonthData(data.months[monthKey]);
        setExplorerMonthName(data.months[monthKey].month_name || monthKey);
      } else {
        setExplorerError(`Data untuk ${monthKey} tidak ditemukan.`);
        setExplorerMonthData(null);
      }
    } catch (err: any) {
      setExplorerError(err.message || "Gagal memuat data.");
      setExplorerMonthData(null);
    } finally {
      setIsFetchingExplorer(false);
    }
  }, []);

  // Auto-load explorer when month or channel changes
  useEffect(() => {
    if (activeTab === "explorer" && explorerMonth) {
      fetchExplorerData(explorerMonth);
    }
  }, [activeTab, explorerMonth, fetchExplorerData]);

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
      case "Website":
        return [
          { key: "Overview Website", label: "Website Overview UTM (.csv/.xlsx)" },
        ];
      default:
        return [];
    }
  };

  // Auto-detect & add files to batch list
  const handleFilesSelect = (filesList: FileList | null) => {
    if (!filesList) return;
    setUploadError(null);
    setUploadSuccess(null);

    const newFiles = Array.from(filesList);
    addFilesToQueue(newFiles);
  };

  const addFilesToQueue = (newFiles: File[]) => {
    const updatedFiles = [...uploadFiles];
    const updatedStatuses = { ...uploadStatuses };

    newFiles.forEach((file) => {
      if (updatedFiles.some(f => f.name === file.name && f.size === file.size)) return;
      updatedFiles.push(file);
      updatedStatuses[file.name] = "waiting";
    });

    setUploadFiles(updatedFiles);
    setUploadStatuses(updatedStatuses);
  };

  // Folder traversal: recursively read all files from dropped directory
  const traverseFileTree = async (entry: FileSystemEntry): Promise<File[]> => {
    const files: File[] = [];
    
    if (entry.isFile) {
      return new Promise((resolve) => {
        (entry as FileSystemFileEntry).file((file) => {
          files.push(file);
          resolve(files);
        });
      });
    }

    if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      const readAllEntries = (): Promise<FileSystemEntry[]> => {
        return new Promise((resolve) => {
          dirReader.readEntries((entries) => {
            if (entries.length === 0) {
              resolve([]);
            } else {
              readAllEntries().then((more) => resolve([...entries, ...more]));
            }
          });
        });
      };

      const entries = await readAllEntries();
      for (const childEntry of entries) {
        const childFiles = await traverseFileTree(childEntry);
        files.push(...childFiles);
      }
    }

    return files;
  };

  // Handle folder drop: scan directories via webkitGetAsEntry
  const handleFolderDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);
    setUploadSuccess(null);

    const items = e.dataTransfer.items;
    if (!items) {
      handleFilesSelect(e.dataTransfer.files);
      return;
    }

    const allFiles: File[] = [];
    let hasFolders = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry?.();
      
      if (entry) {
        hasFolders = true;
        const entryFiles = await traverseFileTree(entry);
        allFiles.push(...entryFiles);
      } else {
        const file = item.getAsFile();
        if (file) allFiles.push(file);
      }
    }

    if (!hasFolders) {
      handleFilesSelect(e.dataTransfer.files);
    } else {
      addFilesToQueue(allFiles);
    }
  };

  // Upload one file using XMLHttpRequest with progress tracking
  const uploadSingleFile = (file: File, index: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      setUploadProgress(0);
      setCurrentUploadIndex(index);
      setUploadStatuses(prev => ({ ...prev, [file.name]: "uploading" }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("auto_detect", autoDetect ? "true" : "false");
      formData.append("platform", uploadPlatform || "");
      formData.append("category", uploadCategory || "");
      formData.append("month", uploadMonth || "");
      formData.append("year", uploadYear || "2026");

      const xhr = new XMLHttpRequest();
      
      xhr.open("POST", "/api/upload", true);

      // Track progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        let result: any = {};
        try {
          result = JSON.parse(xhr.responseText);
        } catch (e) {}

        if (xhr.status >= 200 && xhr.status < 300 && result.success) {
          setUploadStatuses(prev => ({ ...prev, [file.name]: "success" }));
          const info = autoDetect && result.detected
            ? `${result.detected.platform} - ${result.detected.category} (${result.detected.month} ${result.detected.year})`
            : `${uploadPlatform || "?"} - ${uploadCategory || "?"} (${uploadMonth || "?"} ${uploadYear})`;
          setUploadResults(prev => [...prev, `Sukses: ${file.name} -> ${info}`]);
          resolve();
        } else {
          setUploadStatuses(prev => ({ ...prev, [file.name]: "error" }));
          setUploadResults(prev => [...prev, `Gagal: ${file.name} (${result.error || "Unknown error"})`]);
          resolve(); // Resolve anyway so we can upload subsequent files!
        }
      };

      xhr.onerror = () => {
        setUploadStatuses(prev => ({ ...prev, [file.name]: "error" }));
        setUploadResults(prev => [...prev, `Gagal: ${file.name} (Koneksi bermasalah)`]);
        resolve(); // Continue batch
      };

      xhr.send(formData);
    });
  };

  // Run sequential batch upload
  const handleUploadSubmit = async () => {
    const pendingFiles = uploadFiles.filter(f => uploadStatuses[f.name] === "waiting" || uploadStatuses[f.name] === "error");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadResults([]);

    // Loop through files sequentially
    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      if (uploadStatuses[file.name] === "waiting" || uploadStatuses[file.name] === "error") {
        await uploadSingleFile(file, i);
      }
    }

    setIsUploading(false);
    setCurrentUploadIndex(-1);
    setUploadProgress(0);
    setUploadSuccess("Proses upload batch selesai!");

    // Clean up successful files from the active list
    setUploadFiles(prev => prev.filter(f => uploadStatuses[f.name] !== "success"));

    fetchMonths();
    fetchHistory();
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

  const CHANNEL_SECTION_MAP: Record<string, string[]> = {
    all: ALL_SECTIONS_LIST,
    shopee: ["shopee_overview", "shopee_channel_revenue_streams", "shopee_affiliate_kol", "combined_overview", "ads", "daily_trends", "products", "products_consolidated"],
    tiktok: ["tiktok_overview", "tiktok_channel_video", "tiktok_channel_live", "tiktok_channel_product_card", "tiktok_affiliate_creator", "tiktok_affiliate_product", "tiktok_affiliate_sample", "tiktok_affiliate_commission", "combined_overview", "ads", "daily_trends", "products", "products_consolidated", "lives", "videos"],
    meta: ["meta_ads_performance", "combined_overview", "daily_trends"],
    website: ["website_overview_utm", "combined_overview", "daily_trends"],
  };

  const getSectionsForChannel = (channel: string) => CHANNEL_SECTION_MAP[channel] || ALL_SECTIONS_LIST;

  const getFilteredSectionGroups = (channel: string) => {
    const allowed = getSectionsForChannel(channel);
    return SECTION_GROUPS.map(group => ({
      ...group,
      sections: group.sections.filter(s => allowed.includes(s)),
    })).filter(g => g.sections.length > 0);
  };

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

  // Reset section when channel changes
  useEffect(() => {
    const allowed = getSectionsForChannel(activeChannel);
    if (!allowed.includes(editSelectedSection)) {
      const firstSection = allowed[0] || "combined_overview";
      handleSectionChange(firstSection);
      setEditSelectedSection(firstSection);
    }
  }, [activeChannel]);

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
    <div className="flex h-screen w-screen bg-[#060608] text-[#F4F4F6] font-sans overflow-hidden">

      {/* AUTHENTICATION SCREEN */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-sm w-full z-10 relative">
            <div className="mb-8 text-center">
              <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">BI Control Panel</h1>
              <p className="text-[#8E8E95] text-sm mt-1">Sistem manajemen data analitik terpusat</p>
            </div>

            <div className="bg-[#0B0B0C] border border-[#1F1F23] rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
              <form onSubmit={handleLogin} className="space-y-5">
                {authError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {authError}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8E8E95] uppercase tracking-wider ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E95]" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#131316] border border-[#1F1F23] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8E8E95] uppercase tracking-wider ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E95]" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#131316] border border-[#1F1F23] rounded-xl py-3 pl-11 pr-10 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E95]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoggingIn}
                  className="w-full bg-white hover:bg-gray-100 text-black font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-colors mt-2">
                  {isLoggingIn ? <><RefreshCw className="w-4 h-4 animate-spin" />Verifikasi...</> : "Akses Dashboard"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (

        /* MAIN ADMIN DASHBOARD */
        <div className="flex w-full h-full">

          {/* SIDEBAR NAVIGATION */}
          <aside className="w-64 border-r border-[#1F1F23] bg-[#0B0B0C] flex flex-col shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-[#1F1F23]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm tracking-wide text-white">Data Control</span>
              </div>
            </div>

            {/* Channel Selector */}
            <div className="px-4 py-3 border-b border-[#1F1F23]">
              <label className="text-[10px] font-bold text-[#8E8E95] uppercase tracking-wider block mb-2">Channel Filter</label>
              <div className="flex gap-1.5 flex-wrap">
                {(["all","shopee","tiktok","meta","website"] as const).map((ch) => (
                  <button key={ch} onClick={() => { setActiveChannel(ch); if (activeTab === "edit") setEditSelectedMonth(""); }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${
                      activeChannel === ch
                        ? ch === "all" ? "bg-white/10 text-white border border-white/20"
                          : ch === "shopee" ? "bg-[#EE4D2D]/20 text-[#EE4D2D] border border-[#EE4D2D]/30"
                          : ch === "tiktok" ? "bg-white/10 text-white border border-white/20"
                          : ch === "meta" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-[#8E8E95] hover:text-white border border-transparent"
                    }`}>
                    {ch === "all" ? "All" : ch.charAt(0).toUpperCase() + ch.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <div className="text-[10px] font-bold text-[#8E8E95] uppercase tracking-wider mb-2 mt-4 ml-2">Manajemen Utama</div>
              <button onClick={() => setActiveTab("explorer")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-cyan-500/10 text-cyan-400" : "text-[#8E8E95] hover:bg-[#131316] hover:text-white"}`}>
                <BarChart3 className="w-4 h-4" /> Data Explorer
              </button>
              <button onClick={() => setActiveTab("upload")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "upload" ? "bg-cyan-500/10 text-cyan-400" : "text-[#8E8E95] hover:bg-[#131316] hover:text-white"}`}>
                <UploadCloud className="w-4 h-4" /> Upload Dokumen
              </button>
              <button onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "history" ? "bg-cyan-500/10 text-cyan-400" : "text-[#8E8E95] hover:bg-[#131316] hover:text-white"}`}>
                <Clock className="w-4 h-4" /> Riwayat Upload
              </button>
              <button onClick={() => setActiveTab("edit")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "edit" ? "bg-cyan-500/10 text-cyan-400" : "text-[#8E8E95] hover:bg-[#131316] hover:text-white"}`}>
                <Code className="w-4 h-4" /> Editor JSON
              </button>
            </nav>

            <div className="p-4 border-t border-[#1F1F23]">
              <Link href="/" className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#8E8E95] hover:text-white transition-colors">
                <span className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> View Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                Keluar
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 bg-[#060608] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

              {/* DYNAMIC HEADER */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {activeTab === "explorer" && "Data Explorer"}
                  {activeTab === "upload" && "Upload & Integrasi Data"}
                  {activeTab === "history" && "Log Riwayat Upload"}
                  {activeTab === "edit" && "Editor Konfigurasi JSON"}
                </h2>
                <p className="text-[#8E8E95] mt-1 text-sm">
                  {activeTab === "explorer" && "Lihat data yang sudah dipetakan otomatis dari dokumen."}
                  {activeTab === "edit" && "Modifikasi langsung payload JSON untuk kalibrasi metrik dashboard."}
                </p>
              </div>

              {/* ========== TAB: DATA EXPLORER ========== */}
              {activeTab === "explorer" && (
                <div className="space-y-6 max-w-6xl">

                  {/* Month Selector */}
                  <div className="bg-[#0B0B0C] border border-[#1F1F23] rounded-2xl p-5 flex flex-col sm:flex-row items-end gap-4 shadow-sm">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2 block">
                        Pilih Bulan
                      </label>
                      <select
                        value={explorerMonth}
                        onChange={(e) => {
                          setExplorerMonth(e.target.value);
                          if (e.target.value) fetchExplorerData(e.target.value);
                        }}
                        className="w-full bg-[#131316] border border-[#1F1F23] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">-- Pilih Dataset --</option>
                        {months.map((m) => (
                          <option key={m.key} value={m.key}>
                            {m.name} ({m.key})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex gap-1.5 flex-wrap">
                        {(["all", "shopee", "tiktok", "meta", "website"] as const).map((ch) => (
                          <button
                            key={ch}
                            onClick={() => setActiveChannel(ch)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase ${
                              activeChannel === ch
                                ? ch === "all"
                                  ? "bg-white/10 text-white border border-white/20"
                                  : ch === "shopee"
                                  ? "bg-[#EE4D2D]/20 text-[#EE4D2D] border border-[#EE4D2D]/30"
                                  : ch === "tiktok"
                                  ? "bg-white/10 text-white border border-white/20"
                                  : ch === "meta"
                                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "text-[#8E8E95] hover:text-white border border-transparent"
                            }`}
                          >
                            {ch === "all" ? "All" : ch.charAt(0).toUpperCase() + ch.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {explorerError && (
                    <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{explorerError}</span>
                    </div>
                  )}

                  {isFetchingExplorer && (
                    <div className="py-16 flex flex-col items-center text-center space-y-3">
                      <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
                      <p className="text-sm text-[#8E8E95]">Memuat data...</p>
                    </div>
                  )}

                  {explorerMonthData && !isFetchingExplorer && (
                    <DataExplorer
                      monthData={explorerMonthData}
                      monthKey={explorerMonth}
                      monthName={explorerMonthName}
                      activeChannel={activeChannel}
                      onRefresh={() => fetchExplorerData(explorerMonth)}
                    />
                  )}

                  {!explorerMonth && !isFetchingExplorer && !explorerError && (
                    <div className="py-16 flex flex-col items-center text-center space-y-4 rounded-xl border border-dashed border-[#1F1F23] bg-[#131316]/40 p-8">
                      <BarChart3 className="h-10 w-10 text-[#8E8E95]" />
                      <h3 className="text-sm font-bold text-white">Pilih Data Bulanan</h3>
                      <p className="text-xs text-[#8E8E95] max-w-sm">
                        Pilih bulan dari menu di atas untuk melihat data yang sudah dipetakan secara otomatis.
                      </p>
                    </div>
                  )}
                </div>
              )}


              {/* ========== TAB: UPLOAD ========== */}
              {activeTab === "upload" && (
                <div className="bg-[#0B0B0C] border border-[#1F1F23] rounded-2xl p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <UploadCloud className="h-5 w-5 text-cyan-400" />
                      Upload & Konsolidasi Dokumen
                    </h2>
                    <p className="text-sm text-[#8E8E95] mt-1">
                      Unggah file laporan bulanan (Excel/CSV). Platform & kategori akan terdeteksi otomatis.
                    </p>
                  </div>

                  {/* Auto-detect Toggle */}
                  <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-[#131316] rounded-xl border border-[#1F1F23]">
                    <button
                      onClick={() => setAutoDetect(!autoDetect)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoDetect ? "bg-cyan-500" : "bg-[#27272A]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoDetect ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Auto-Detect</span>
                        {autoDetect && (
                          <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8E8E95] mt-0.5">
                        {autoDetect
                          ? "Platform, kategori, dan bulan akan terdeteksi otomatis dari file."
                          : "Pilih platform, kategori, dan bulan secara manual."}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      {!autoDetect && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Platform</label>
                            <select value={uploadPlatform} onChange={(e) => { setUploadPlatform(e.target.value); setUploadCategory(""); }}
                              className="w-full rounded-xl border border-[#1F1F23] bg-[#131316] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors">
                              <option value="">-- Pilih Platform --</option>
                              <option value="Shopee">Shopee</option>
                              <option value="TikTok">TikTok Shop</option>
                              <option value="Meta">Meta Ads</option>
                              <option value="Website">Website</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Jenis Dokumen</label>
                            <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}
                              className="w-full rounded-xl border border-[#1F1F23] bg-[#131316] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors">
                              <option value="">-- Pilih Kategori --</option>
                              {getCategoriesForPlatform(uploadPlatform).map((cat) => (
                                <option key={cat.key} value={cat.key}>{cat.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Bulan</label>
                              <select value={uploadMonth} onChange={(e) => setUploadMonth(e.target.value)}
                                className="w-full rounded-xl border border-[#1F1F23] bg-[#131316] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors">
                                {["","januari","februari","maret","april","mei","juni","juli","agustus","september","oktober","november","desember"].map((m) => (
                                  <option key={m} value={m}>{m ? m.charAt(0).toUpperCase() + m.slice(1) : "--Pilih Bulan--"}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Tahun</label>
                              <select value={uploadYear} onChange={(e) => setUploadYear(e.target.value)}
                                className="w-full rounded-xl border border-[#1F1F23] bg-[#131316] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors">
                                <option value="2026">2026</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                    </div>

                      {/* Drag & Drop zone and file list */}
                      <div className="md:col-span-2 space-y-4">
                        <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">File Laporan (Batch Upload & Drag & Drop)</label>
                        
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleFolderDrop}
                          onClick={() => document.getElementById("file-input")?.click()}
                          className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            isDragging 
                              ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]" 
                              : "border-[#1F1F23] hover:border-cyan-500/30 hover:bg-cyan-500/5"
                          } min-h-[190px]`}
                        >
                          <UploadCloud className={`h-12 w-12 mb-3 transition-transform ${isDragging ? "scale-110 text-cyan-400" : "text-[#8E8E95]"}`} />
                          <p className="text-sm font-semibold text-white">Drag & drop file laporan atau folder di sini</p>
                          <p className="text-xs text-[#8E8E95] mt-1">Support multiple file & folder — auto-detect (.xlsx, .csv)</p>
                          <div className="flex gap-3 mt-5">
                            <input id="file-input" type="file" className="hidden" accept=".xlsx,.xls,.csv" multiple={true}
                              onChange={(e) => handleFilesSelect(e.target.files)} />
                            <input id="folder-input" type="file" className="hidden" {...{ webkitdirectory: "" } as any} multiple={true}
                              onChange={(e) => {
                                const files = e.target.files ? Array.from(e.target.files) : [];
                                if (files.length > 0) addFilesToQueue(files);
                              }} />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); document.getElementById("file-input")?.click(); }}
                              className="px-4 py-2 bg-[#131316] border border-[#1F1F23] rounded-xl text-xs font-semibold text-white hover:border-cyan-500/50 transition-colors"
                            >
                              Pilih File
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); document.getElementById("folder-input")?.click(); }}
                              className="px-4 py-2 bg-[#131316] border border-[#1F1F23] rounded-xl text-xs font-semibold text-white hover:border-cyan-500/50 transition-colors flex items-center gap-1.5"
                            >
                              <UploadCloud className="w-3.5 h-3.5" /> Pilih Folder
                            </button>
                          </div>
                        </div>

                        {/* Selected Files Queue */}
                        {uploadFiles.length > 0 && (
                          <div className="bg-[#0B0B0C] border border-[#1F1F23] rounded-2xl p-5 space-y-4 shadow-xl">
                            <div className="flex justify-between items-center pb-2 border-b border-[#1F1F23]">
                              <span className="text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Antrean Berkas ({uploadFiles.length} file)</span>
                              <button 
                                onClick={() => { setUploadFiles([]); setUploadStatuses({}); setUploadResults([]); }} 
                                disabled={isUploading}
                                className="text-xs font-bold text-rose-400 hover:text-rose-300 disabled:opacity-50 transition-colors"
                              >
                                Bersihkan Antrean
                              </button>
                            </div>

                            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                              {uploadFiles.map((file, index) => {
                                const status = uploadStatuses[file.name] || "waiting";
                                return (
                                  <div key={file.name} className="flex items-center justify-between p-3 bg-[#131316] border border-[#1F1F23] rounded-xl text-xs">
                                    <div className="flex items-center gap-3 truncate max-w-[70%]">
                                      <FileText className={`h-5 w-5 shrink-0 ${
                                        status === "success" ? "text-emerald-400" : status === "error" ? "text-rose-400" : "text-cyan-400"
                                      }`} />
                                      <div className="truncate text-left">
                                        <p className="text-white font-mono truncate" title={file.name}>{file.name}</p>
                                        <p className="text-[10px] text-[#8E8E95]">{(file.size / 1024).toFixed(1)} KB</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {/* Status Badges */}
                                      {status === "waiting" && (
                                        <span className="px-2 py-0.5 rounded bg-gray-500/10 text-[#8E8E95] font-bold text-[9px] uppercase border border-gray-500/20">Antre</span>
                                      )}
                                      {status === "uploading" && (
                                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold text-[9px] uppercase border border-cyan-500/20 animate-pulse flex items-center gap-1">
                                          <RefreshCw className="w-2.5 h-2.5 animate-spin" /> {uploadProgress}%
                                        </span>
                                      )}
                                      {status === "success" && (
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase border border-emerald-500/20">Selesai</span>
                                      )}
                                      {status === "error" && (
                                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold text-[9px] uppercase border border-rose-500/20">Gagal</span>
                                      )}

                                      <button 
                                        onClick={() => {
                                          setUploadFiles(prev => prev.filter(f => f.name !== file.name));
                                          setUploadStatuses(prev => {
                                            const next = { ...prev };
                                            delete next[file.name];
                                            return next;
                                          });
                                        }}
                                        disabled={isUploading}
                                        className="p-1 text-[#8E8E95] hover:text-rose-400 rounded-md transition-all disabled:opacity-30 shrink-0"
                                        title="Hapus berkas dari antrean"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Batch upload loading progress bar */}
                            {isUploading && currentUploadIndex !== -1 && (
                              <div className="pt-2 border-t border-[#1F1F23] space-y-2">
                                <div className="flex justify-between text-[10px] text-[#8E8E95]">
                                  <span>Mengunggah file {currentUploadIndex + 1} dari {uploadFiles.length}: <strong>{uploadFiles[currentUploadIndex].name}</strong></span>
                                  <span className="font-mono text-cyan-400">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-[#131316] rounded-full h-1.5 overflow-hidden border border-[#1F1F23]">
                                  <div 
                                    className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Actions bar */}
                            <div className="flex justify-end pt-2 border-t border-[#1F1F23]">
                              <button 
                                onClick={handleUploadSubmit} 
                                disabled={isUploading}
                                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-xs font-bold text-black shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                              >
                                {isUploading ? (
                                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Memproses Batch ({currentUploadIndex + 1}/{uploadFiles.length})...</>
                                ) : (
                                  <><UploadCloud className="h-3.5 w-3.5" />Mulai Upload Batch ({uploadFiles.filter(f => uploadStatuses[f.name] !== "success").length} file)</>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                  </div>

                  {/* Summary Results Console */}
                  {uploadResults.length > 0 && (
                    <div className="mt-6 bg-[#0B0B0C] border border-[#1F1F23] rounded-2xl p-5 shadow-sm space-y-3">
                      <h4 className="text-xs font-bold text-[#8E8E95] uppercase tracking-wider">Hasil Pemrosesan Dokumen</h4>
                      <div className="bg-[#060608] border border-[#1F1F23] rounded-xl p-4 font-mono text-[10px] space-y-1 max-h-[160px] overflow-y-auto text-left custom-scrollbar">
                        {uploadResults.map((res, i) => {
                          const isError = res.startsWith("Gagal");
                          return (
                            <div key={i} className={isError ? "text-rose-400" : "text-emerald-400"}>
                              {res}
                            </div>
                          );
                        })}
                      </div>
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
                        {uploadErrorDetails && <div className="mt-2 ml-8 text-xs text-rose-300 font-mono bg-[#131316]/40 p-3 rounded-xl">{uploadErrorDetails}</div>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========== TAB: HISTORY ========== */}
              {activeTab === "history" && (
                <div className="bg-[#0B0B0C] border border-[#1F1F23] rounded-2xl p-6 shadow-sm">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-cyan-400" />
                        Riwayat Upload
                      </h2>
                      <p className="text-sm text-[#8E8E95] mt-1">Daftar semua dokumen yang pernah diupload beserta statusnya</p>
                    </div>
                    <button onClick={fetchHistory} disabled={isFetchingHistory}
                      className="p-2 text-[#8E8E95] hover:text-white rounded-xl bg-[#131316] border border-[#1F1F23] transition-colors">
                      <RefreshCw className={`h-4 w-4 ${isFetchingHistory ? "animate-spin text-cyan-400" : ""}`} />
                    </button>
                  </div>

                  {historyError && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" /><span>{historyError}</span>
                    </div>
                  )}

                  {isFetchingHistory && historyList.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center">
                      <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
                      <p className="text-sm text-[#8E8E95] mt-3">Memuat riwayat...</p>
                    </div>
                  ) : historyList.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-[#1F1F23] bg-[#131316]/40 p-8">
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
                            <tr key={log.id} className="text-white hover:bg-[#131316]/40 transition-colors">
                              <td className="py-3.5 pr-4 text-sm text-[#8E8E95]">
                                {new Date(log.timestamp).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </td>
                              <td className="py-3.5 pr-4">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${
                                  log.platform === "Shopee" ? "bg-[#EE4D2D]/10 text-[#EE4D2D]"
                                  : log.platform === "TikTok" ? "bg-white/10 text-white"
                                  : "bg-cyan-500/10 text-cyan-400"
                                }`}>{log.platform}</span>
                              </td>
                              <td className="py-3.5 pr-4 text-sm text-[#8E8E95]">{log.category}</td>
                              <td className="py-3.5 pr-4 text-sm text-[#8E8E95]">{log.month} {log.year}</td>
                              <td className="py-3.5 pr-4 text-sm font-mono text-[#8E8E95] max-w-[160px] truncate" title={log.filename}>
                                <span className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                                  {log.filename}
                                </span>
                              </td>
                              <td className="py-3.5 pr-4 text-sm text-[#8E8E95]">{(log.sizeBytes / 1024).toFixed(1)} KB</td>
                              <td className="py-3.5">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  log.status === "Berhasil" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                }`}>{log.status}</span>
                                {log.errorMessage && (
                                  <p className="text-[10px] text-rose-400 mt-1 font-mono max-w-[160px] truncate bg-[#131316]/60 p-1 rounded" title={log.errorMessage}>
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

              {/* ========== TAB: EDIT JSON ========== */}
              {activeTab === "edit" && (
                <div className="space-y-6 max-w-6xl">

                  {/* Month Selector Bar */}
                  <div className="bg-[#0B0B0C] border border-[#1F1F23] rounded-2xl p-5 flex flex-col sm:flex-row items-end gap-4 shadow-sm">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2 block">Target Bulan</label>
                      <select value={editSelectedMonth} onChange={(e) => setEditSelectedMonth(e.target.value)}
                        className="w-full bg-[#131316] border border-[#1F1F23] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer">
                        <option value="">-- Pilih Dataset --</option>
                        {months.map((m) => (
                          <option key={m.key} value={m.key}>{m.name} ({m.key})</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={() => editSelectedMonth && fetchMonthData(editSelectedMonth)} disabled={!editSelectedMonth || isFetchingEditData}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0">
                      {isFetchingEditData ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                      {isFetchingEditData ? "Memuat..." : "Load Data"}
                    </button>
                  </div>

                  {editFetchError && (
                    <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" /><span>{editFetchError}</span>
                    </div>
                  )}

                  {/* Editor Workspace */}
                  {editMonthRawData && (
                    <div className="flex flex-col lg:flex-row gap-6 items-start">

                      {/* Section Selector Sidebar */}
                      <div className="w-full lg:w-64 shrink-0 space-y-6">
                        {getFilteredSectionGroups(activeChannel).map((group) => {
                          const visibleSections = group.sections.filter(s => editMonthRawData[s] !== undefined);
                          if (visibleSections.length === 0) return null;
                          return (
                            <div key={group.label}>
                              <h4 className="text-[10px] font-bold text-[#8E8E95] uppercase tracking-wider mb-2 px-1">{group.label}</h4>
                              <div className="space-y-1">
                                {visibleSections.map((section) => (
                                  <button key={section} onClick={() => handleSectionChange(section)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                      editSelectedSection === section
                                        ? "bg-[#1F1F23] text-white border border-[#27272A]"
                                        : "text-[#8E8E95] hover:bg-[#131316] hover:text-white border border-transparent"
                                    }`}>
                                    {isStructuredSection(section) ? <Edit className="w-3 h-3 inline mr-1.5 text-cyan-400" /> : <Code className="w-3 h-3 inline mr-1.5 text-orange-400" />}
                                    {section.replace(/_/g, " ")}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Editor Panel */}
                      <div className="flex-1 w-full bg-[#0B0B0C] border border-[#1F1F23] rounded-2xl flex flex-col shadow-sm overflow-hidden">

                        {/* Editor Header */}
                        <div className="px-5 py-4 border-b border-[#1F1F23] flex items-center justify-between bg-[#131316]">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-[#1F1F23] rounded-md">
                              {isStructuredSection(editSelectedSection) ? <Edit className="w-4 h-4 text-cyan-400" /> : <Code className="w-4 h-4 text-orange-400" />}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white capitalize">{editSelectedSection.replace(/_/g, " ")}</h3>
                              <p className="text-[10px] text-[#8E8E95] font-mono mt-0.5">{isStructuredSection(editSelectedSection) ? "Structured Form Input" : "Raw JSON Editor"}</p>
                            </div>
                          </div>
                          {!isStructuredSection(editSelectedSection) && (
                            <button onClick={() => { try { const p = JSON.parse(rawJsonText); setRawJsonText(JSON.stringify(p, null, 2)); } catch (e) {} }}
                              className="text-[10px] font-bold bg-[#1F1F23] hover:bg-[#27272A] text-white px-3 py-1.5 rounded-lg transition-colors border border-[#27272A]">
                              Format JSON
                            </button>
                          )}
                        </div>

                        {/* Editor Body */}
                        <div className="p-5">
                          {isStructuredSection(editSelectedSection) ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                              {Object.entries(structuredForm).length === 0 ? (
                                <p className="text-sm text-[#8E8E95] col-span-full py-8 text-center">No structured fields available for this section.</p>
                              ) : (
                                Object.entries(structuredForm).map(([key, value]) => (
                                  <div key={key} className="bg-[#131316] p-3 rounded-xl border border-[#1F1F23]">
                                    <label className="block text-[10px] font-mono text-[#8E8E95] mb-2 truncate" title={key}>{key}</label>
                                    <input type="number" step="any" value={value as number}
                                      onChange={(e) => setStructuredForm(prev => ({ ...prev, [key]: e.target.value }))}
                                      className="w-full bg-[#0B0B0C] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors" />
                                  </div>
                                ))
                              )}
                            </div>
                          ) : (
                            <div className="relative">
                              {rawJsonError && (
                                <div className="absolute top-4 right-4 max-w-sm bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl backdrop-blur-md z-10 font-mono shadow-xl">
                                  {rawJsonError}
                                </div>
                              )}
                              <div className="bg-[#1E1E1E] rounded-xl border border-[#27272A] overflow-hidden flex">
                                <div className="w-10 bg-[#191919] border-r border-[#27272A] flex flex-col py-4 items-center text-[10px] text-[#5C5C5C] font-mono select-none">
                                  {Array.from({ length: Math.min(40, rawJsonText.split('\n').length) }).map((_, i) => (
                                    <span key={i} className="leading-[21px]">{i + 1}</span>
                                  ))}
                                </div>
                                <textarea value={rawJsonText}
                                  onChange={(e) => { setRawJsonText(e.target.value); setRawJsonError(null); }}
                                  spellCheck={false}
                                  className="flex-1 bg-transparent text-[#D4D4D4] font-mono text-[13px] leading-[21px] p-4 focus:outline-none resize-y custom-scrollbar min-h-[400px]" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Editor Footer */}
                        <div className="px-5 py-4 border-t border-[#1F1F23] bg-[#0B0B0C] flex items-center justify-between">
                          <div className="flex-1">
                            {saveSectionSuccess && <span className="text-xs text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {saveSectionSuccess}</span>}
                            {saveSectionError && <span className="text-xs text-rose-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {saveSectionError}</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleSectionChange(editSelectedSection)} disabled={isSavingSection}
                              className="text-xs font-bold text-[#8E8E95] hover:text-white px-4 py-2 transition-colors">
                              Discard
                            </button>
                            <button onClick={handleSectionSave} disabled={isSavingSection}
                              className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                              {isSavingSection ? <><RefreshCw className="w-4 h-4 animate-spin" />Menyimpan...</> : "Save Changes"}
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </main>
        </div>
      )}

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
                  <AlertTriangle className="h-4 w-4" /><span>{editError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[#8E8E95] uppercase tracking-wider mb-2">Nama Bulan Baru</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  placeholder="Contoh: Januari 2026"
                  className="w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50" required />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingMonth(null)} disabled={isSavingEdit}
                className="rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-2 text-xs font-bold text-[#8E8E95] hover:text-white">Batal</button>
              <button onClick={handleRenameMonth} disabled={isSavingEdit || !editName.trim()}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-1.5">
                {isSavingEdit ? <><RefreshCw className="h-3 w-3 animate-spin" />Menyimpan...</> : "Simpan Perubahan"}
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
              <p className="text-xs text-rose-300 font-bold leading-normal">PERINGATAN: Tindakan ini permanen dan tidak dapat dibatalkan!</p>
              <p className="text-xs text-[#8E8E95] leading-relaxed">
                Tindakan ini akan menghapus bulan <span className="font-bold text-white">"{deletingMonth.name}" ({deletingMonth.key})</span> dari database Supabase.
              </p>
              <p className="text-xs text-[#8E8E95] leading-relaxed">
                Semua file spreadsheets (.xlsx/.csv) asli terkait bulan tersebut di direktori <code className="bg-black/50 p-0.5 rounded px-1 text-zinc-300 font-mono">./dokumen</code> juga akan dihapus agar data tetap sinkron dan tidak memicu penulisan ulang otomatis.
              </p>
            </div>
            {deleteError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertTriangle className="h-4 w-4" /><span>{deleteError}</span>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeletingMonth(null)} disabled={isDeleting}
                className="rounded-xl border border-[#1F1F23] bg-[#0B0B0C] px-4 py-2 text-xs font-bold text-[#8E8E95] hover:text-white">Batal</button>
              <button onClick={handleDeleteMonth} disabled={isDeleting}
                className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                {isDeleting ? <><RefreshCw className="h-3 w-3 animate-spin" />Menghapus...</> : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}