"use client";

import React, { useState, useEffect } from "react";
import { Calendar, ChevronDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
  availableMonths?: { key: string; name: string; label: string }[];
}

export default function DateRangePicker({
  startDate,
  endDate,
  minDate,
  maxDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
  availableMonths = [],
}: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false);

  // Helper: get start/end date of month key (e.g., "2026-02")
  const getMonthDateRange = (monthKey: string) => {
    const [yearStr, monthStr] = monthKey.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const start = `${yearStr}-${monthStr}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
    return { start, end };
  };

  const isFullRange = startDate === minDate && endDate === maxDate;

  // Determine which preset is active
  let activePreset: string | null = null;
  if (isFullRange) {
    activePreset = "all";
  } else {
    for (const m of availableMonths) {
      const { start, end } = getMonthDateRange(m.key);
      if (startDate === start && endDate === end) {
        activePreset = m.key;
        break;
      }
    }
  }

  // If no preset is active, default to custom mode
  const isCustomActive = activePreset === null;

  // Sync custom input visibility state
  useEffect(() => {
    if (isCustomActive) {
      setShowCustom(true);
    }
  }, [isCustomActive]);

  const handlePresetClick = (presetKey: string) => {
    if (presetKey === "all") {
      onReset();
      setShowCustom(false);
    } else {
      const { start, end } = getMonthDateRange(presetKey);
      onStartDateChange(start);
      onEndDateChange(end);
      setShowCustom(false);
    }
  };

  // Sort available months chronologically (ascending: Jan -> Apr)
  const sortedMonths = [...availableMonths].sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div className="flex flex-col gap-3 w-full sm:w-auto">
      <div className="flex flex-wrap items-center gap-2">
        {/* Presets Pills */}
        <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-sm shrink-0">
          <button
            onClick={() => handlePresetClick("all")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200",
              activePreset === "all"
                ? "bg-[#3D4BFF] text-white shadow-md shadow-[#3D4BFF]/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Semua
          </button>

          {sortedMonths.map((m) => {
            const isActive = activePreset === m.key;
            const shortLabel = m.label.substring(0, 3); // "Januari" -> "Jan"
            return (
              <button
                key={m.key}
                onClick={() => handlePresetClick(m.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200",
                  isActive
                    ? "bg-[#3D4BFF] text-white shadow-md shadow-[#3D4BFF]/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {shortLabel}
              </button>
            );
          })}

          <button
            onClick={() => {
              setShowCustom(true);
            }}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200",
              isCustomActive
                ? "bg-[#3D4BFF] text-white shadow-md shadow-[#3D4BFF]/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Kustom
          </button>
        </div>
      </div>

      {/* Custom Picker Section */}
      {showCustom && (
        <div className="flex items-center rounded-xl border border-border bg-card p-2.5 gap-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200 w-full sm:w-auto self-start">
          <div className="flex items-center gap-1.5 w-full">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="date"
              value={startDate}
              min={minDate}
              max={endDate || maxDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-transparent text-foreground text-xs font-semibold outline-none cursor-pointer w-full sm:w-[110px] dark:[color-scheme:dark] light:[color-scheme:light]"
            />
            <span className="text-[#3D4BFF] text-xs font-bold shrink-0">→</span>
            <input
              type="date"
              value={endDate}
              min={startDate || minDate}
              max={maxDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-transparent text-foreground text-xs font-semibold outline-none cursor-pointer w-full sm:w-[110px] dark:[color-scheme:dark] light:[color-scheme:light]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
