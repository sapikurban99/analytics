"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface RoasGaugeProps {
  value: number;
  target?: number;
  className?: string;
}

export default function RoasGauge({ value, target = 10, className }: RoasGaugeProps) {
  const percentage = Math.min((value / target) * 100, 100);
  const remaining = 100 - percentage;

  const data = {
    labels: ["Achieved", "Remaining"],
    datasets: [
      {
        data: [percentage, remaining],
        backgroundColor: [
          "#3D4BFF", // Bright blue active
          "#1F1F23", // Dark grey background
        ],
        borderWidth: 0,
        circumference: 360,
        rotation: -90,
        cutout: "85%",
        borderRadius: [20, 0],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    cutout: "85%",
  };

  return (
    <Card className={cn("flex flex-col justify-between border border-[#1F1F23] bg-[#131316] p-6 shadow-sm", className)}>
      <div>
        <h3 className="text-lg font-bold text-white">ROAS</h3>
        <p className="text-sm text-[#8E8E95]">Return on Ad Spend Overview</p>
      </div>

      <div className="relative mt-6 flex h-48 items-center justify-center">
        {/* Glow effect behind the chart */}
        <div className="absolute h-32 w-32 rounded-full bg-[#3D4BFF]/20 blur-2xl" />
        
        <Doughnut data={data} options={options} />
        
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white">{value.toFixed(1)}X</span>
          <span className="text-xs font-semibold text-[#8E8E95]">Target: {target.toFixed(1)}X</span>
        </div>
      </div>
    </Card>
  );
}
