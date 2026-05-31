"use client";

import React from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, ChartOptions, ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { formatCompactCurrency, formatNumber, formatCurrency } from "@/lib/format";
import { DailyTrendPoint } from "@/lib/db";
import { cn } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TrendChartProps {
  dataPoints: DailyTrendPoint[];
  platform: "All" | "Shopee" | "TikTok" | "Meta" | "Website";
  multiLine?: boolean;
  metric?: "gmv" | "orders" | "visitors";
  title?: string;
  className?: string;
}

export default function TrendChart({ dataPoints, platform, multiLine = false, metric, title, className }: TrendChartProps) {
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <Card className="flex h-80 items-center justify-center border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">No daily trends data available</p>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch { return dateStr; }
  };

  const labels = dataPoints.map((dp) => formatDate(dp.date));

  const gmvData = dataPoints.map((dp) => dp.gmv);
  const ordersData = dataPoints.map((dp) => dp.orders);
  const visitorsData = dataPoints.map((dp) => dp.visitors);

  const colorMap = { gmv: "#10B981", orders: "#3B82F6", visitors: "#F59E0B" };
  const formatMap = {
    gmv: (v: number) => formatCurrency(v),
    orders: (v: number) => formatNumber(v),
    visitors: (v: number) => formatNumber(v),
  };

  if (metric) {
    const data = metric === "gmv" ? gmvData : metric === "orders" ? ordersData : visitorsData;
    const color = colorMap[metric];
    const fmt = formatMap[metric];

    const singleOptions: ChartOptions<"line"> = {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15,15,17,0.95)", titleColor: "#FFF", bodyColor: "#A1A1AA",
          borderColor: "rgba(255,255,255,0.1)", borderWidth: 1, padding: 12, cornerRadius: 12,
          callbacks: { label: (ctx) => ` ${fmt(ctx.parsed.y ?? 0)}` },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#8E8E95", maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }, border: { display: false } },
        y: {
          type: "linear", position: "left",
          grid: { color: "rgba(142,142,149,0.1)" },
          ticks: { color: "#8E8E95", callback: (v) => metric === "gmv" ? formatCompactCurrency(v as number).replace("Rp ", "") : formatNumber(v as number) },
          border: { display: false },
        },
      },
      interaction: { mode: "index", intersect: false },
    };

    return (
      <Card className={cn("border border-border bg-card p-6 shadow-sm", className)}>
        {title && <h3 className="text-sm font-bold text-foreground mb-3">{title}</h3>}
        <div className="h-64 w-full">
          <Line
            data={{
              labels,
              datasets: [{
                label: title || metric, data,
                borderColor: color, borderWidth: 3, pointRadius: 0, tension: 0.4,
                fill: true,
                backgroundColor: (ctx: ScriptableContext<"line">) => {
                  const { chartArea: a, ctx: c } = ctx.chart;
                  if (!a) return undefined;
                  const g = c.createLinearGradient(0, a.top, 0, a.bottom);
                  g.addColorStop(0, `${color}33`);
                  g.addColorStop(1, `${color}00`);
                  return g;
                },
              }],
            }}
            options={singleOptions}
          />
        </div>
      </Card>
    );
  }

  const datasets: any[] = [
    {
      fill: true, label: "Revenue", data: gmvData,
      borderColor: "#10B981", borderWidth: 3, pointRadius: 0, tension: 0.4, yAxisID: "y",
      backgroundColor: (ctx: ScriptableContext<"line">) => {
        const { chartArea: a, ctx: c } = ctx.chart;
        if (!a) return undefined;
        const g = c.createLinearGradient(0, a.top, 0, a.bottom);
        g.addColorStop(0, "rgba(16,185,129,0.2)"); g.addColorStop(1, "rgba(16,185,129,0)");
        return g;
      },
    },
  ];

  if (multiLine) {
    datasets.push(
      {
        fill: false, label: "Orders", data: ordersData,
        borderColor: "#3B82F6", borderWidth: 2, borderDash: [4, 4], pointRadius: 0, tension: 0.4, yAxisID: "y1",
      },
      {
        fill: false, label: "Visitor", data: visitorsData,
        borderColor: "#F59E0B", borderWidth: 2, borderDash: [2, 2], pointRadius: 0, tension: 0.4, yAxisID: "y1",
      }
    );
  }

  const chartOptions: ChartOptions<"line"> = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: multiLine, position: "top", labels: { color: "#8E8E95", usePointStyle: true, boxWidth: 8, font: { size: 11 } } },
      tooltip: {
        backgroundColor: "rgba(15,15,17,0.95)", titleColor: "#FFF", bodyColor: "#A1A1AA",
        borderColor: "rgba(255,255,255,0.1)", borderWidth: 1, padding: 12, cornerRadius: 12,
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y ?? 0;
            if (ctx.dataset.label === "Revenue") return ` ${ctx.dataset.label}: Rp${formatCompactCurrency(v).replace("Rp ", "")}`;
            return ` ${ctx.dataset.label}: ${formatNumber(v)}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#8E8E95", maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }, border: { display: false } },
      y: {
        type: "linear", display: true, position: "left",
        grid: { color: "rgba(142,142,149,0.1)" },
        ticks: { color: "#8E8E95", callback: (v) => formatCompactCurrency(v as number).replace("Rp ", "") },
        border: { display: false },
      },
      ...(multiLine ? {
        y1: {
          type: "linear", display: true, position: "right",
          grid: { drawOnChartArea: false },
          ticks: { color: "#8E8E95", callback: (v) => formatNumber(v as number) },
          border: { display: false },
        },
      } : {}),
    },
    interaction: { mode: "index", intersect: false },
  };

  return (
    <Card className={cn("border border-border bg-card p-6 shadow-sm", className)}>
      <div className="h-80 w-full">
        <Line data={{ labels, datasets }} options={chartOptions} />
      </div>
    </Card>
  );
}
