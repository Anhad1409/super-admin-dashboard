"use client";

/* /admin/alerts — the anomaly & threshold feed: billing, churn, quality,
   compliance, wallet and usage signals across the platform. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ShieldAlert, Bell, Activity, ChevronRight } from "lucide-react";
import { CpHeader, StatTile, Card, Tag, mono } from "@/components/admin/cp";
import { alerts, alertCounts, SEVERITY_META, type Severity } from "@/lib/admin-analytics";

const FILTERS = ["All", "critical", "warning", "info"] as const;

export default function AlertsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const rows = useMemo(() => filter === "All" ? alerts : alerts.filter((a) => a.severity === filter), [filter]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <CpHeader title="Alerts" subtitle="Threshold breaches and anomalies across every client — triaged by severity."
        right={<span className={`${mono} flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${alertCounts.critical ? "border-danger/40 bg-danger/12 text-danger" : "border-success/40 bg-success/15 text-success"}`}>
          <Bell className="size-3.5" /> {alerts.length} active</span>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={ShieldAlert} label="Critical" value={alertCounts.critical} sub="act today" tint="var(--color-danger)" />
        <StatTile icon={AlertTriangle} label="Warning" value={alertCounts.warning} sub="review this week" tint="var(--color-warning)" />
        <StatTile icon={Activity} label="Info" value={alertCounts.info} sub="worth watching" tint="var(--color-steam)" />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full border px-2.5 py-1 text-[12px] font-medium capitalize transition-colors ${filter === f ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-mocha hover:border-latte"}`}>
              {f}{f !== "All" && <span className="ml-1 tabular-nums text-latte">{alerts.filter((a) => a.severity === (f as Severity)).length}</span>}
            </button>
          ))}
        </div>
        <ul className="space-y-2">
          {rows.map((a) => {
            const meta = SEVERITY_META[a.severity];
            return (
              <li key={a.id}>
                <button onClick={() => router.push(`/admin/clients/${a.client.id}`)} className="flex w-full items-start gap-3 rounded-xl border border-foam bg-cream/40 p-3.5 text-left transition-colors hover:border-latte hover:bg-oat/40">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${meta.tint} 14%, #fffdf9)`, color: `color-mix(in srgb, ${meta.tint} 78%, #2a1a0f)` }}>
                    <AlertTriangle className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-coffee">{a.title}</span>
                      <Tag c={meta.tint}>{meta.label}</Tag>
                      <span className={`${mono} rounded bg-oat/70 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-mocha`}>{a.kind}</span>
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-mocha"><span className="font-medium text-coffee">{a.client.name}</span> — {a.detail}</div>
                    <div className={`${mono} mt-1 text-[10px] uppercase tracking-wide text-latte`}>{a.when}</div>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-latte" />
                </button>
              </li>
            );
          })}
          {rows.length === 0 && <li className="py-10 text-center text-sm text-muted-foreground">No {filter} alerts. All clear.</li>}
        </ul>
      </Card>
    </div>
  );
}
