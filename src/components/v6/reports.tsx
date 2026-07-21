"use client";

import type { LucideIcon } from "lucide-react";
import { Phone, Megaphone, Filter, Sparkles, Gauge, List, ShieldCheck, Wallet, Download, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { reportsCatalog } from "@/lib/ops-mock";
import { toast } from "@/components/notifications/toaster";
import { Button } from "@/components/ui/button";

const icons: Record<string, LucideIcon> = {
  phone: Phone, megaphone: Megaphone, filter: Filter, sparkles: Sparkles,
  gauge: Gauge, list: List, shield: ShieldCheck, wallet: Wallet,
};
const catColor: Record<string, string> = {
  Operations: "var(--color-caramel)", Leads: "var(--color-blueberry)", Quality: "var(--color-matcha)",
  Capacity: "var(--color-mango)", Compliance: "var(--color-danger)", Finance: "var(--color-mocha)",
};

export function V6Reports() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Reports" subtitle="Run, schedule and export — pick a report to begin" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportsCatalog.map((r) => {
          const Icon = icons[r.icon] ?? List;
          const color = catColor[r.cat] ?? "var(--color-caramel)";
          return (
            <div key={r.id} className="group flex flex-col rounded-2xl border border-foam bg-porcelain p-5 shadow-glass transition-shadow hover:shadow-glass-hover">
              <div className="flex items-start justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}><Icon className="size-5" /></span>
                <span className="rounded-full bg-oat/70 px-2 py-0.5 text-[11px] font-medium text-mocha">{r.cat}</span>
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold text-coffee">{r.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{r.desc}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => toast({ title: "Report ready", body: `“${r.name}” generated — downloading CSV.`, severity: "success" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Download className="size-3.5" /> Run</Button>
                <Button size="sm" variant="outline" onClick={() => toast({ title: "Scheduled", body: `“${r.name}” will run daily at 8:00 IST.`, severity: "info" })} className="gap-1.5 text-mocha"><CalendarClock className="size-3.5" /> Schedule</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
