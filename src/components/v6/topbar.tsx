"use client";

import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { organization } from "@/lib/data";
import { CapacityChip } from "@/components/layout/capacity-chip";
import { TopbarUser } from "@/components/layout/topbar-user";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { V6NotificationBell } from "@/components/v6/notification-bell";
import { TopbarGuide } from "@/components/setup-guide/topbar-guide";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function V6Topbar() {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-sidebar-border bg-porcelain/90 px-6 backdrop-blur-sm">
      {admin ? (
        <span className="flex items-center gap-2 rounded-full border border-espresso/20 bg-oat/50 px-3 py-1.5 font-[family-name:var(--font-data)] text-[11px] font-medium uppercase tracking-[0.12em] text-mocha">
          All clients · platform view
        </span>
      ) : (
        <CapacityChip />
      )}

      <div className="flex items-center gap-3">
        <ModeToggle />
        {!admin && <TopbarGuide />}
        <V6NotificationBell />

        {/* org switcher */}
        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 transition-colors hover:bg-accent/50">
          <span className="flex size-7 items-center justify-center rounded-full bg-caramel text-xs font-semibold text-cream">
            {initials(organization.name)}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-xs font-semibold text-coffee">{organization.name}</span>
            <span className="block text-[10px] text-success">Active</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>

        {/* user */}
        <TopbarUser />
      </div>
    </header>
  );
}
