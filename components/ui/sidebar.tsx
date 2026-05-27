"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Globe,
  Lock,
  ShoppingBag,
  LineChart,
  PieChart,
  Users,
  Megaphone,
  Monitor,
  X,
  TrendingUp,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const NavItem = ({
  id,
  label,
  activeTab,
  setActiveTab,
  indent = false,
}: {
  id: string;
  label: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  indent?: boolean;
}) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg px-4 py-2 text-[13px] transition-all duration-200 cursor-pointer",
        isActive
          ? "bg-[#3D4BFF]/10 text-[#3D4BFF] font-semibold dark:bg-[#3D4BFF]/20 dark:text-white"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      )}
    >
      <div className={cn(
        "h-1.5 w-1.5 rounded-full transition-colors shrink-0",
        isActive ? "bg-[#3D4BFF]" : "bg-border group-hover:bg-muted-foreground/50"
      )} />
      <span className="truncate">{label}</span>
    </button>
  );
};

const ChannelIcon = ({ platform }: { platform: string }) => {
  if (platform === "tiktok") {
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-black text-white border border-[#333] shrink-0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      </div>
    );
  }
  if (platform === "shopee") {
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[#EE4D2D] text-[10px] font-bold text-white shrink-0">S</div>
    );
  }
  if (platform === "website") {
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-emerald-600 text-[10px] font-bold text-white shrink-0">W</div>
    );
  }
  if (platform === "meta") {
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[#1877F2] text-[10px] font-bold text-white shrink-0">M</div>
    );
  }
  return null;
};

export default function Sidebar({ activeTab, setActiveTab, isOpen = false, onClose }: SidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    channel: true,
    tiktok: true,
    shopee: true,
    website: false,
    meta: false,
  });

  const toggle = (s: string) => setOpenSections(p => ({ ...p, [s]: !p[s] }));

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card text-foreground transition-transform duration-300 w-64 shrink-0 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse" />
            <span className="text-sm font-bold tracking-tight whitespace-nowrap">Omnichannel Dashboard</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-3 px-3 py-4 overflow-y-auto custom-scrollbar">

          {/* OVERVIEW */}
          <div>
            <button onClick={() => toggle("overview")} className="flex w-full items-center justify-between px-2 py-2 text-sm font-bold text-foreground cursor-pointer">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span>OVERVIEW</span>
              </div>
              {openSections.overview ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>
            {openSections.overview && (
              <div className="mt-1 space-y-0.5 ml-4 border-l border-border pl-2">
                <NavItem id="overview-sales" label="Performance Sales" activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavItem id="overview-product" label="Performance Product" activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            )}
          </div>

          {/* CHANNEL */}
          <div>
            <button onClick={() => toggle("channel")} className="flex w-full items-center justify-between px-2 py-2 text-sm font-bold text-foreground cursor-pointer">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>CHANNEL</span>
              </div>
              {openSections.channel ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>
            {openSections.channel && (
              <div className="mt-1 space-y-1 ml-4 border-l border-border pl-2">

                {/* Tiktokshop */}
                <div>
                  <button onClick={() => toggle("tiktok")} className="flex w-full items-center justify-between py-2 text-sm font-semibold cursor-pointer">
                    <div className="flex items-center gap-2"><ChannelIcon platform="tiktok" /><span>TikTok Shop</span></div>
                    {openSections.tiktok ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                  </button>
                  {openSections.tiktok && (
                    <div className="mt-1 space-y-0.5 ml-2 border-l border-border pl-2">
                      <NavItem id="tiktok-overview" label="#1 Overview" activeTab={activeTab} setActiveTab={setActiveTab} />
                      <NavItem id="tiktok-product" label="#2 Product Analyz" activeTab={activeTab} setActiveTab={setActiveTab} />
                      <NavItem id="tiktok-channel" label="#3 Channel Analyz" activeTab={activeTab} setActiveTab={setActiveTab} />
                      <NavItem id="tiktok-affiliate" label="#4 Affiliate Analyz" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  )}
                </div>

                {/* Shopee */}
                <div className="mt-1">
                  <button onClick={() => toggle("shopee")} className="flex w-full items-center justify-between py-2 text-sm font-semibold cursor-pointer">
                    <div className="flex items-center gap-2"><ChannelIcon platform="shopee" /><span>Shopee</span></div>
                    {openSections.shopee ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                  </button>
                  {openSections.shopee && (
                    <div className="mt-1 space-y-0.5 ml-2 border-l border-border pl-2">
                      <NavItem id="shopee-overview" label="#1 Overview" activeTab={activeTab} setActiveTab={setActiveTab} />
                      <NavItem id="shopee-product" label="#2 Product Analyz" activeTab={activeTab} setActiveTab={setActiveTab} />
                      <NavItem id="shopee-channel" label="#3 Channel Analyz" activeTab={activeTab} setActiveTab={setActiveTab} />
                      <NavItem id="shopee-affiliate" label="#4 Affiliate Analyz" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  )}
                </div>

                {/* Website */}
                <div className="mt-1">
                  <button onClick={() => toggle("website")} className="flex w-full items-center justify-between py-2 text-sm font-semibold cursor-pointer">
                    <div className="flex items-center gap-2"><ChannelIcon platform="website" /><span>Website</span></div>
                    {openSections.website ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                  </button>
                  {openSections.website && (
                    <div className="mt-1 space-y-0.5 ml-2 border-l border-border pl-2">
                      <NavItem id="website-overview" label="#1 Overview" activeTab={activeTab} setActiveTab={setActiveTab} />
                      <NavItem id="website-product" label="#2 Product Analyz" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="mt-1">
                  <button onClick={() => toggle("meta")} className="flex w-full items-center justify-between py-2 text-sm font-semibold cursor-pointer">
                    <div className="flex items-center gap-2"><ChannelIcon platform="meta" /><span>Meta</span></div>
                    {openSections.meta ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                  </button>
                  {openSections.meta && (
                    <div className="mt-1 space-y-0.5 ml-2 border-l border-border pl-2">
                      <NavItem id="meta-cpas" label="#1 Meta CPAS" activeTab={activeTab} setActiveTab={setActiveTab} />
                      <NavItem id="meta-website" label="#2 Meta Website" activeTab={activeTab} setActiveTab={setActiveTab} />
                      <NavItem id="meta-traffic" label="#3 Meta Traffic" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </nav>

        <div className="p-3 border-t border-border/60 bg-muted/20 shrink-0">
          <Link href="/admin" className="group flex w-full items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-500 dark:text-cyan-400 transition-all duration-200">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              <span>Kelola Data (Admin)</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-cyan-500/70 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </aside>
    </>
  );
}
