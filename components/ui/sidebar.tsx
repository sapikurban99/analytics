"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Globe,
  Lock,
  ShoppingBag,
  Tv,
  Store,
  Play,
  Users,
  LineChart,
  DollarSign,
  Megaphone,
  PieChart,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
}

interface NavItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isNested?: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavItem = ({
  id,
  label,
  icon,
  isNested = false,
  activeTab,
  setActiveTab,
}: NavItemProps) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all duration-200 relative",
        isActive
          ? "bg-[#11112B] text-white font-semibold"
          : "text-[#8E8E95] hover:text-[#F4F4F6]"
      )}
    >
      <div className="flex items-center gap-3 pl-2 w-full">
        {icon && <span className="shrink-0">{icon}</span>}
        <div className={cn(
          "h-1.5 w-1.5 rounded-full transition-colors shrink-0",
          isActive ? "bg-[#3D4BFF]" : "bg-[#2A2A32] group-hover:bg-[#4A4A52]"
        )} />
        <span className="truncate">{label}</span>
      </div>
    </button>
  );
};

const ChannelIcon = ({ platform }: { platform: string }) => {
  if (platform === "tiktok") {
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-black text-white border border-[#333]">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      </div>
    );
  }
  if (platform === "shopee") {
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[#EE4D2D] text-[10px] font-bold text-white">
        S
      </div>
    );
  }
  if (platform === "website") {
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-emerald-600 text-[10px] font-bold text-white">
        W
      </div>
    );
  }
  if (platform === "meta") {
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[#1877F2] text-[10px] font-bold text-white">
        M
      </div>
    );
  }
  return null;
};

export default function Sidebar({ activeTab, setActiveTab, className }: SidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "overview-section": true,
    "channel-section": true,
    "tiktok-section": true,
    "shopee-section": true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderNavItem = (id: string, label: string, icon?: React.ReactNode, isNested = false) => (
    <NavItem
      id={id}
      label={label}
      icon={icon}
      isNested={isNested}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );

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
            Omnichannel Dashboard
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto custom-scrollbar">

        {/* Main Navigation 1: Overview */}
        <div>
          <button
            onClick={() => toggleSection("overview-section")}
            className="flex w-full items-center justify-between px-2 py-2 text-sm font-bold text-[#F4F4F6] hover:text-white"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#8E8E95]" />
              <span>Overview</span>
            </div>
            {openSections["overview-section"] ? <ChevronDown className="h-4 w-4 text-[#8E8E95]" /> : <ChevronRight className="h-4 w-4 text-[#8E8E95]" />}
          </button>

          {openSections["overview-section"] && (
            <div className="mt-1 space-y-0.5 border-l border-[#1F1F23] ml-4 pl-1">
              <NavItem
                id="overview"
                label="Performance Sales Summary Multi-Channel"
                icon={<LayoutDashboard className="h-3.5 w-3.5 text-[#8E8E95]" />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <NavItem
                id="product-performance"
                label="Product Performance"
                icon={<ShoppingBag className="h-3.5 w-3.5 text-[#8E8E95]" />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          )}
        </div>

        {/* Main Navigation 2: Channel */}
        <div>
          <button
            onClick={() => toggleSection("channel-section")}
            className="flex w-full items-center justify-between px-2 py-2 text-sm font-bold text-[#F4F4F6] hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#8E8E95]" />
              <span>Channel</span>
            </div>
            {openSections["channel-section"] ? <ChevronDown className="h-4 w-4 text-[#8E8E95]" /> : <ChevronRight className="h-4 w-4 text-[#8E8E95]" />}
          </button>

          {openSections["channel-section"] && (
            <div className="mt-1 space-y-1 ml-4 border-l border-[#1F1F23] pl-2">

              {/* TikTok Shop Sub-group */}
              <div>
                <button
                  onClick={() => toggleSection("tiktok-section")}
                  className="flex w-full items-center justify-between py-2 text-sm font-semibold text-[#F4F4F6] hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <ChannelIcon platform="tiktok" />
                    <span>TikTok Shop</span>
                  </div>
                  {openSections["tiktok-section"] ? <ChevronDown className="h-3 w-3 text-[#8E8E95]" /> : <ChevronRight className="h-3 w-3 text-[#8E8E95]" />}
                </button>
                {openSections["tiktok-section"] && (
                  <div className="mt-1 space-y-0.5 border-l border-[#1F1F23] ml-2 pl-1">
                    <NavItem id="tiktok-overview" label="#1 TikTok Overview" icon={<LineChart className="h-3 w-3 text-[#8E8E95]" />} isNested activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem id="tiktok-product" label="#2 Product Analyz" icon={<ShoppingBag className="h-3 w-3 text-[#8E8E95]" />} isNested activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem id="tiktok-channel" label="#3 Channel Analyz" icon={<PieChart className="h-3 w-3 text-[#8E8E95]" />} isNested activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem id="tiktok-affiliate" label="#4 Affiliate Analyz" icon={<Users className="h-3 w-3 text-[#8E8E95]" />} isNested activeTab={activeTab} setActiveTab={setActiveTab} />
                  </div>
                )}
              </div>

              {/* Shopee Sub-group */}
              <div className="mt-2">
                <button
                  onClick={() => toggleSection("shopee-section")}
                  className="flex w-full items-center justify-between py-2 text-sm font-semibold text-[#F4F4F6] hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <ChannelIcon platform="shopee" />
                    <span>Shopee</span>
                  </div>
                  {openSections["shopee-section"] ? <ChevronDown className="h-3 w-3 text-[#8E8E95]" /> : <ChevronRight className="h-3 w-3 text-[#8E8E95]" />}
                </button>
                {openSections["shopee-section"] && (
                  <div className="mt-1 space-y-0.5 border-l border-[#1F1F23] ml-2 pl-1">
                    <NavItem id="shopee-overview" label="#1 Shopee Overview" icon={<LineChart className="h-3 w-3 text-[#8E8E95]" />} isNested activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem id="shopee-product" label="#2 Product Analyz" icon={<ShoppingBag className="h-3 w-3 text-[#8E8E95]" />} isNested activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem id="shopee-channel" label="#3 Channel Analyz" icon={<PieChart className="h-3 w-3 text-[#8E8E95]" />} isNested activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem id="shopee-affiliate" label="#4 Affiliate Analyz" icon={<Users className="h-3 w-3 text-[#8E8E95]" />} isNested activeTab={activeTab} setActiveTab={setActiveTab} />
                  </div>
                )}
              </div>

              {/* Website Overview */}
              <div className="mt-2">
                <NavItem id="website" label="Website Overview" icon={<Globe className="h-3.5 w-3.5 text-[#8E8E95]" />} activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>

              {/* Meta Ads */}
              <div className="mt-2">
                <NavItem id="meta-ads" label="Meta Ads Performance" icon={<Megaphone className="h-3.5 w-3.5 text-[#8E8E95]" />} activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>

            </div>
          )}
        </div>

      </nav>

      {/* Admin Panel Access */}
      <div className="p-3 border-t border-[#1F1F23]/60 bg-[#0B0B0C]/50 shrink-0">
        <Link
          href="/admin"
          className="group flex w-full items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-400 hover:text-white transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Kelola Data (Admin)</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-cyan-400/70 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </aside>
  );
}
