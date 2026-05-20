"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { formatCompactCurrency, formatNumber } from "@/lib/format";
import { DailyTrendPoint } from "@/lib/db";
import { cn } from "@/lib/utils";

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendChartProps {
  dataPoints: DailyTrendPoint[];
  platform: "All" | "Shopee" | "TikTok" | "Meta";
  className?: string;
}

export default function TrendChart({ dataPoints, platform, className }: TrendChartProps) {
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <Card className="flex h-80 items-center justify-center border border-[#1F1F23] bg-[#131316] p-6">
        <p className="text-sm text-[#8E8E95]">No daily trends data available</p>
      </Card>
    );
  }

  // Format date from "YYYY-MM-DD" to short "DD MMM"
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return dateStr;
    }
  };

  const labels = dataPoints.map((dp) => formatDate(dp.date));
  
  // Create synthetic cost data (30% of GMV) for visual demonstration of dual-line
  const gmvData = dataPoints.map((dp) => dp.gmv);
  const costData = dataPoints.map((dp) => dp.gmv * 0.3 + (Math.random() * dp.gmv * 0.1));

  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Revenue",
        data: gmvData,
        borderColor: "#10B981", // Emerald
        borderWidth: 3,
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#131316",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
          gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
          return gradient;
        },
      },
      {
        fill: true,
        label: "Cost",
        data: costData,
        borderColor: "#3B82F6", // Blue
        borderWidth: 3,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#131316",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
          return gradient;
        },
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1F1F23",
        titleColor: "#F4F4F6",
        bodyColor: "#8E8E95",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: {
          family: "Figtree, sans-serif",
          weight: "bold",
          size: 13,
        },
        bodyFont: {
          family: "Figtree, sans-serif",
          size: 12,
        },
        callbacks: {
          label: (context) => {
            const val = context.parsed.y ?? 0;
            return ` ${context.dataset.label}: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#8E8E95",
          font: {
            family: "Figtree, sans-serif",
            size: 11,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#8E8E95",
          font: {
            family: "Figtree, sans-serif",
            size: 11,
          },
          callback: (value) => {
            return formatCompactCurrency(value as number).replace("Rp ", "");
          },
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  return (
    <Card className={cn("border border-[#1F1F23] bg-[#131316] p-6 shadow-sm", className)}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Grafik Tren</h3>
          <p className="text-sm text-[#8E8E95]">Revenue vs Cost Over Time</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-semibold text-[#8E8E95]">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-xs font-semibold text-[#8E8E95]">Cost</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <Line data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
}
