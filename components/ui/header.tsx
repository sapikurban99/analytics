"use client";

import React from "react";
import { Download, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeTab: string;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedPlatform: "All" | "Shopee" | "TikTok" | "Meta";
  setSelectedPlatform: (platform: "All" | "Shopee" | "TikTok" | "Meta") => void;
  availableMonths: { key: string; name: string }[];
  onExport: () => void;
}

export default function Header({
  activeTab,
  selectedMonth,
  setSelectedMonth,
  selectedPlatform,
  setSelectedPlatform,
  availableMonths,
  onExport,
}: HeaderProps) {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "overview":
        return "Business Overview";
      case "products":
        return "Product Performance";
      case "lives":
        return "Live Stream Performance";
      case "videos":
        return "Short Video Metrics";
      case "ads":
        return "Ads & Campaign Performance";
      default:
        return "Analytics Dashboard";
    }
  };

  const getTabSubtitle = (tab: string) => {
    switch (tab) {
      case "overview":
        return "Consolidated metrics, GMV trend lines, and key business health indicator cards.";
      case "products":
        return "Direct sales analytics, confirmation rates, and multi-platform sales contribution.";
      case "lives":
        return "Live stream host performance, attributed GMV, conversion rates, and session durations.";
      case "videos":
        return "Short video conversion, attributed orders, views, engagement, and content CTR.";
      case "ads":
        return "ROI/ROAS metrics, Shopee Ads, TikTok GMV Max campaigns, and consolidated ad spend.";
      default:
        return "Analyze your digital sales channel health.";
    }
  };

  return (
    <header className="flex flex-col gap-4 border-b border-zinc-200 bg-white/80 p-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 md:flex-row md:items-center md:justify-between">
      {/* Title block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {getTabTitle(activeTab)}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {getTabSubtitle(activeTab)}
        </p>
      </div>

      {/* Control filters block */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Selector */}
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900">
          <Calendar className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs font-semibold text-zinc-700 outline-none dark:text-zinc-300 cursor-pointer"
          >
            {availableMonths.map((m) => (
              <option key={m.key} value={m.key} className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Platform segmented filter */}
        <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          {(["All", "Shopee", "TikTok", "Meta"] as const).map((platform) => {
            const isSelected = selectedPlatform === platform;
            return (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  isSelected
                    ? platform === "Shopee"
                      ? "bg-[#ee4d2d] text-white shadow-sm"
                      : platform === "TikTok"
                      ? "bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950"
                      : platform === "Meta"
                      ? "bg-[#0668E1] text-white shadow-sm"
                      : "bg-rose-500 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                {platform}
              </button>
            );
          })}
        </div>

        {/* Export CSV action button */}
        <Button
          onClick={onExport}
          variant="outline"
          size="sm"
          className="h-10 rounded-xl border-zinc-200 bg-white font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </header>
  );
}
