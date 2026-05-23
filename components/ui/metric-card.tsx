"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent, formatGrowth } from "@/lib/format";

interface MetricCardProps {
  label: string;
  value: number;
  growth?: number;
  format: "currency" | "number" | "percent";
  icon?: LucideIcon;
  description?: string;
  className?: string;
  renderValue?: () => string;
}

export default function MetricCard({
  label,
  value,
  growth = 0,
  format,
  icon: Icon,
  description,
  className,
  renderValue: customRenderValue,
}: MetricCardProps) {
  // Format the numerical value based on specified type
  const renderValue = () => {
    if (customRenderValue) {
      return customRenderValue();
    }
    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percent":
        return formatPercent(value);
      case "number":
      default:
        return formatNumber(value);
    }
  };

  const isPositive = growth > 0;
  const isNegative = growth < 0;
  const isZero = growth === 0;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#3D4BFF]/50 hover:shadow-lg hover:shadow-[#3D4BFF]/10",
        className
      )}
    >
      {/* Dynamic Hover Glow effect */}
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-[#3D4BFF]/20 via-[#3D4BFF]/5 to-transparent blur-2xl transition-all duration-500 group-hover:scale-150" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground transition-all duration-300 group-hover:bg-rose-500/10 group-hover:text-rose-500 dark:bg-zinc-800/40 dark:text-zinc-400 dark:group-hover:bg-rose-950/30 dark:group-hover:text-rose-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {renderValue()}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        {/* Description, default to "vs previous month" if not provided and growth is non-zero */}
        <span className="text-xs text-muted-foreground">
          {description || (isZero ? "Base month" : "vs previous month")}
        </span>

        {/* Growth Rate Badge */}
        {!isZero && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold shadow-sm transition-all",
              isPositive &&
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              isNegative &&
                "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 shrink-0" />
            ) : (
              <ArrowDownRight className="h-3 w-3 shrink-0" />
            )}
            {formatGrowth(growth)}
          </span>
        )}

        {isZero && (
          <span className="flex items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            <Minus className="h-3 w-3 shrink-0" />
            Neutral
          </span>
        )}
      </div>
    </Card>
  );
}
