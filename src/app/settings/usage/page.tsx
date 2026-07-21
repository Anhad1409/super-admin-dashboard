"use client";

/* Settings → Usage & Metering — per-period call volume, minutes and cost.
   Figures derive from the shared timeSeries so they reconcile app-wide. */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, BarChart3, Phone, Clock, TrendingUp, ActivitySquare, RotateCcw } from "lucide-react";
import { timeSeries } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { toast } from "@/components/notifications/toaster";
import { GlazedTile, ACCENT } from "@/components/settings/glaze";

const monoLabel = "font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-mocha";
const PERIODS = ["2026-07", "2026-06", "2026-05"];

export default function UsagePage() {
  const [period, setPeriod] = useState(PERIODS[0]);

  // deterministic per-period scale so switching months visibly changes data
  const scale = 1 + PERIODS.indexOf(period) * 0.35;
  const totals = useMemo(() => {
    const calls = Math.round(timeSeries.reduce((s, p) => s + p.calls, 0) * 4.6 * scale);
    const minutes = Math.round(timeSeries.reduce((s, p) => s + (p.avg_duration * p.calls) / 60, 0) * 4.6 * scale);
    const charged = timeSeries.reduce((s, p) => s + p.cost, 0) * 4.6 * scale;
    return { calls, minutes, charged, cogs: charged * 0.38 };
  }, [scale]);

  const KPIS = [
    { icon: Phone, label: "Total Calls", value: totals.calls.toLocaleString("en-IN"), sub: "in this period", c: "var(--color-caramel)" },
    { icon: Clock, label: "Total Minutes", value: totals.minutes.toLocaleString("en-IN"), sub: "ceil per call", c: "var(--color-steam)" },
    { icon: TrendingUp, label: "Amount Charged", value: formatINR(totals.charged), sub: "debited from wallet", c: "var(--color-mango)" },
    { icon: ActivitySquare, label: "COGS", value: formatINR(totals.cogs), sub: "internal cost (admin)", c: "var(--color-mocha)" },
  ];

  const bars = [
    { label: "Calls", v: totals.calls },
    { label: "Minutes", v: totals.minutes },
  ];
  const maxBar = Math.max(...bars.map((b) => b.v), 1);

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to Settings</Link>

      <h1 className="flex items-center gap-3 font-serif text-3xl font-semibold tracking-tight text-coffee"><GlazedTile icon={BarChart3} tint={ACCENT.money} size="lg" /> Usage &amp; Metering</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Per-period call volume, minutes, and cost breakdown.</p>

      <div className="mt-5 flex items-center gap-2">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="h-9 rounded-full border border-foam bg-porcelain px-3.5 text-[13px] text-coffee shadow-glass outline-none focus:border-caramel">
          {PERIODS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <button onClick={() => toast({ title: "Refreshed", body: `Usage recomputed for ${period}.`, severity: "info" })}
          aria-label="Refresh" className="grid size-9 place-items-center rounded-full border border-foam bg-porcelain text-mocha shadow-glass hover:border-latte hover:text-coffee">
          <RotateCcw className="size-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="flex items-center gap-2"><GlazedTile icon={k.icon} tint={k.c} size="sm" /><span className={monoLabel}>{k.label}</span></div>
            <div className="mt-2 font-serif text-[26px] font-semibold leading-none text-coffee tabular-nums">{k.value}</div>
            <div className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      <section className="mt-5 rounded-2xl border border-foam bg-porcelain p-6 shadow-glass">
        <h2 className="font-serif text-lg font-semibold text-coffee">Usage Breakdown</h2>
        <p className="text-xs text-muted-foreground">Quantity by category for {period}</p>
        <div className="mt-6 flex h-56 items-end justify-around gap-10 border-b border-foam px-6">
          {bars.map((b) => (
            <div key={b.label} className="flex w-40 flex-col items-center gap-2">
              <span className="font-data text-xs text-mocha tabular-nums">{b.v.toLocaleString("en-IN")}</span>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-mocha to-caramel transition-all duration-500" style={{ height: `${(b.v / maxBar) * 180}px` }} />
              <span className="pb-0 text-sm text-coffee">{b.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Minutes are billed per started minute (ceil per call) at ₹8/min on metered plans; flat-fee plans meter for reporting only.</p>
      </section>
    </div>
  );
}
