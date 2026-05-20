"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
}

export default function Sidebar({ activeTab, setActiveTab, className }: SidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "gmv-max": true,
    "finance": true,
    "shopee": true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const NavItem = ({ 
    id, 
    label, 
    isNested = false, 
    isAction = false, 
    actionColor
  }: { 
    id: string, 
    label: string, 
    isNested?: boolean,
    isAction?: boolean,
    actionColor?: "cyan" | "pink"
  }) => {
    const isActive = activeTab === id;
    
    if (isAction) {
      return (
        <button
          onClick={() => setActiveTab(id)}
          className={cn(
            "group flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 my-1.5",
            actionColor === "cyan" 
              ? "border border-cyan-500/30 bg-cyan-950/10 text-zinc-300 hover:text-white" 
              : "border border-pink-500/30 bg-pink-950/10 text-zinc-300 hover:text-white"
          )}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              actionColor === "cyan" ? "bg-cyan-500" : "bg-pink-500"
            )} />
            <span>{label}</span>
          </div>
          <Sparkles className={cn(
            "h-4 w-4",
            actionColor === "cyan" ? "text-cyan-500" : "text-pink-500"
          )} />
        </button>
      );
    }

    return (
      <button
        onClick={() => setActiveTab(id)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all duration-200 relative",
          isActive
            ? "bg-[#11112B] text-white font-semibold" // Active state (blue-ish dark background)
            : "text-[#8E8E95] hover:text-[#F4F4F6]"
        )}
      >
        <div className="flex items-center gap-3 pl-2 w-full">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            isActive ? "bg-[#3D4BFF]" : "bg-[#2A2A32] group-hover:bg-[#4A4A52]" // Dot indicator
          )} />
          <span className="truncate">{label}</span>
        </div>
      </button>
    );
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-[#1F1F23] bg-[#0B0B0C] text-[#F4F4F6] transition-all duration-300 w-64 shrink-0",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
          <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
            Mendadak Tools
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto custom-scrollbar">
        
        {/* GMV MAX Section */}
        <div>
          <button 
            onClick={() => toggleSection("gmv-max")}
            className="flex w-full items-center justify-between px-2 py-2 text-sm font-bold text-[#F4F4F6] hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#8E8E95]" />
              <span>GMV MAX</span>
            </div>
            {openSections["gmv-max"] ? <ChevronDown className="h-4 w-4 text-[#8E8E95]" /> : <ChevronRight className="h-4 w-4 text-[#8E8E95]" />}
          </button>
          
          {openSections["gmv-max"] && (
            <div className="mt-1 space-y-0.5 border-l border-[#1F1F23] ml-4 pl-1">
              <NavItem id="overview" label="Dashboard" />
              <NavItem id="videos" label="Video Overview" />
              <NavItem id="input-data" label="Input Data" />
              <NavItem id="video-check" label="Video Check" />
              <NavItem id="riwayat" label="Riwayat Upload" />
              <NavItem id="ai-insight" label="AI Insight" />
              <div className="pr-2 pl-1 mt-2">
                <NavItem id="action-plan" label="Action Plan" isAction actionColor="cyan" />
                <NavItem id="winning-framework" label="Winning Framework" isAction actionColor="pink" />
              </div>
            </div>
          )}
        </div>

        {/* Finance Section */}
        <div>
          <button 
            onClick={() => toggleSection("finance")}
            className="flex w-full items-center justify-between px-2 py-2 text-sm font-bold text-[#F4F4F6] hover:text-white"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#8E8E95]" />
              <span>Finance</span>
            </div>
            {openSections["finance"] ? <ChevronDown className="h-4 w-4 text-[#8E8E95]" /> : <ChevronRight className="h-4 w-4 text-[#8E8E95]" />}
          </button>
          
          {openSections["finance"] && (
            <div className="mt-1 space-y-1 ml-4 border-l border-[#1F1F23] pl-2">
              
              {/* Shopee Sub-group */}
              <div>
                <button 
                  onClick={() => toggleSection("shopee")}
                  className="flex w-full items-center justify-between py-2 text-sm font-semibold text-[#F4F4F6] hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[#EE4D2D] text-[10px] font-bold text-white">
                      S
                    </div>
                    <span>Shopee</span>
                  </div>
                  {openSections["shopee"] ? <ChevronDown className="h-3 w-3 text-[#8E8E95]" /> : <ChevronRight className="h-3 w-3 text-[#8E8E95]" />}
                </button>
                {openSections["shopee"] && (
                  <div className="mt-1 space-y-0.5 border-l border-[#1F1F23] ml-2 pl-1">
                    <NavItem id="komisi-shopee" label="Komisi Shopee" isNested />
                    <NavItem id="laba-rugi-shopee" label="Laba Rugi" isNested />
                    <NavItem id="products" label="Analisa Produk" isNested />
                  </div>
                )}
              </div>

              {/* TikTok Shop Sub-group */}
              <div className="mt-2">
                <button 
                  className="flex w-full items-center justify-between py-2 text-sm font-semibold text-[#F4F4F6] hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-black text-white border border-[#333]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                    </div>
                    <span>TikTok Shop</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-[#8E8E95]" />
                </button>
              </div>

            </div>
          )}
        </div>

      </nav>
    </aside>
  );
}
