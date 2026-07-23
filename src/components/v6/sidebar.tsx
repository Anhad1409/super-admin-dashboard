"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Search, ChevronDown, ShieldAlert, ArrowLeft } from "lucide-react";
import { nav, navGroups, adminNav, adminNavGroups } from "@/config/nav";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WalletMeter } from "@/components/wallet/wallet-meter";
import { VoiceBrewMark, VoiceBrewLogo } from "@/components/layout/voicebrew-logo";

export function V6Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const adminMode = pathname.startsWith("/admin");
  const [collapsed, setCollapsed] = useState(false);
  // Operate & Analyze always open; AI Studio & Admin are collapsible (default closed).
  const COLLAPSIBLE = new Set(["studio", "admin"]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    operate: true, analyze: true, studio: false, admin: false,
    cp: true, governance: true, team: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("vox-sidebar-collapsed");
    if (saved) setCollapsed(saved === "1");
    const g = localStorage.getItem("vox-nav-groups");
    if (g) setOpenGroups((prev) => ({ ...prev, ...JSON.parse(g) }));
  }, []);

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("vox-nav-groups", JSON.stringify(next));
      return next;
    });
  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem("vox-sidebar-collapsed", c ? "0" : "1");
      return !c;
    });
  };

  const isActive = (href: string) => {
    if (href === "/admin/clients") return pathname === "/admin/clients" || pathname.startsWith("/admin/clients/");
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  };

  const activeNav = adminMode ? adminNav : nav;
  const activeGroups = adminMode ? adminNavGroups : navGroups;

  return (
    <aside
      data-tour="nav"
      className={cn(
        "z-20 flex h-full shrink-0 flex-col border-r bg-porcelain transition-[width] duration-300 ease-out",
        adminMode ? "border-espresso/25" : "border-sidebar-border",
        collapsed ? "w-[68px]" : "w-52"
      )}
    >
      {/* brand */}
      <div className={cn("flex h-16 items-center px-4", collapsed && "justify-center px-0")}>
        {collapsed ? <VoiceBrewMark className="size-8 text-coffee" /> : <VoiceBrewLogo />}
      </div>

      {adminMode ? (
        /* super-admin mode banner + exit */
        <div className="mx-3 mb-2">
          <div className={cn("flex items-center gap-2 rounded-xl px-2.5 py-2 text-cream", collapsed && "justify-center px-0")}
            style={{ background: "linear-gradient(135deg, #2a1a0f, #3d2817)" }}>
            <ShieldAlert className="size-4 shrink-0 text-caramel" />
            {!collapsed && (
              <span className="leading-tight">
                <span className="block text-[12px] font-semibold">Control Plane</span>
                <span className="block font-[family-name:var(--font-data)] text-[8.5px] uppercase tracking-[0.14em] text-caramel">Super Admin</span>
              </span>
            )}
          </div>
          <button onClick={() => router.push("/dashboard")}
            className={cn("mt-1.5 flex w-full items-center gap-2 rounded-xl border border-foam bg-cream px-2.5 py-1.5 text-[12px] font-medium text-mocha transition-colors hover:border-latte hover:text-coffee", collapsed && "justify-center px-0")}>
            <ArrowLeft className="size-3.5 shrink-0" />
            {!collapsed && <span>Exit to client app</span>}
          </button>
        </div>
      ) : (
        /* search / command-palette trigger */
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
          className={cn(
            "mx-3 mb-2 flex items-center gap-2 rounded-xl border border-foam bg-oat/60 px-2.5 py-1.5 text-[13px] text-muted-foreground hover:bg-foam",
            collapsed && "justify-center px-0"
          )}
        >
          <Search className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span>Search…</span>
              <kbd className="ml-auto rounded bg-porcelain px-1.5 py-0.5 text-[10px] font-medium text-mocha shadow-sm">⌘K</kbd>
            </>
          )}
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 py-2 [scrollbar-width:thin]">
        {activeGroups.map((group) => {
          const isCollapsible = COLLAPSIBLE.has(group.key);
          const groupOpen = collapsed || !isCollapsible || openGroups[group.key];
          return (
          <div key={group.key} className="flex flex-col gap-0.5">
            {!collapsed && (
              isCollapsible ? (
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="flex items-center gap-1 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-text hover:text-mocha"
                >
                  {group.label}
                  <ChevronDown className={cn("size-3 transition-transform", !openGroups[group.key] && "-rotate-90")} />
                </button>
              ) : (
                <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-text">
                  {group.label}
                </div>
              )
            )}
            {collapsed && <div className="mx-auto mb-1 h-px w-6 bg-sidebar-border" />}
            {groupOpen && activeNav.filter((n) => n.group === group.key).map((item) => {
              const href = item.href;
              const active = isActive(href);
              const Icon = item.icon;
              const link = (
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-[7px] text-[13px] font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-mocha/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={2} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger render={link} />
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{link}</div>
              );
            })}
          </div>
          );
        })}
      </nav>

      {/* minute-balance wallet — client app only */}
      {!adminMode && (
        <div className="mt-1 border-t border-sidebar-border pt-2">
          <WalletMeter collapsed={collapsed} />
        </div>
      )}

      {/* collapse toggle */}
      <button
        onClick={toggle}
        className={cn(
          "m-3 flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-muted-foreground hover:bg-foam",
          collapsed && "justify-center px-0"
        )}
      >
        {collapsed ? <PanelLeftOpen className="size-4" /> : <><PanelLeftClose className="size-4" /> <span>Collapse</span></>}
      </button>
    </aside>
  );
}
