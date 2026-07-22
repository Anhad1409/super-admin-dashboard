"use client";

/* /admin/geography — where the platform's calls come from: clients and call
   volume broken down by Indian state. */

import { MapPin, Building2, PhoneCall } from "lucide-react";
import { CpHeader, StatTile, Card, mono } from "@/components/admin/cp";
import { geography } from "@/lib/admin-analytics";
import { platform } from "@/lib/clients-mock";

export default function GeographyPage() {
  const maxCalls = Math.max(...geography.map((g) => g.calls), 1);
  const topState = geography[0];
  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <CpHeader title="Geography" subtitle="Clients and call volume by state — where demand concentrates across India." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={MapPin} label="States live" value={geography.length} sub="across India" tint="var(--color-steam)" />
        <StatTile icon={Building2} label="Top region" value={topState.state} sub={`${topState.clients} clients · ${(topState.calls / 1000).toFixed(0)}k calls`} tint="var(--color-caramel)" />
        <StatTile icon={PhoneCall} label="Calls this month" value={platform.callsMonth.toLocaleString("en-IN")} sub="platform-wide" tint="var(--color-mango)" />
      </div>

      <Card title="Call volume by state">
        <div className="space-y-3">
          {geography.map((g) => (
            <div key={g.state} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-[13px] font-medium text-coffee">{g.state}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-foam">
                <div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${(g.calls / maxCalls) * 100}%` }} />
              </div>
              <span className="w-16 shrink-0 text-right text-[12.5px] text-mocha tabular-nums">{(g.calls / 1000).toFixed(1)}k</span>
              <span className={`${mono} w-20 shrink-0 text-right text-[11px] uppercase tracking-wide text-latte`}>{g.clients} client{g.clients > 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {geography.slice(0, 6).map((g) => {
          const share = Math.round((g.calls / platform.callsMonth) * 100);
          return (
            <div key={g.state} className="rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
              <div className="flex items-center gap-2"><MapPin className="size-4 text-caramel" /><span className="text-[14px] font-semibold text-coffee">{g.state}</span></div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-[22px] font-semibold text-coffee tabular-nums">{(g.calls / 1000).toFixed(1)}k</span>
                <span className={`${mono} text-[10px] uppercase tracking-wide text-latte`}>calls · {share}% share</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{g.clients} client organisation{g.clients > 1 ? "s" : ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
