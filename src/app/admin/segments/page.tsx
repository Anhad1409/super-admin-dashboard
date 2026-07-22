"use client";

/* /admin/segments — group orgs into cohorts (by use case, by plan) and
   compare KPIs across segments instead of one flat list. */

import { useState } from "react";
import { Layers, IndianRupee, Gauge, HeartPulse } from "lucide-react";
import { CpHeader, StatTile, Card, mono, compactINR } from "@/components/admin/cp";
import { segmentsByUseCase, segmentsByPlan, type Segment } from "@/lib/admin-analytics";
import { platform } from "@/lib/clients-mock";

function SegmentGrid({ segs }: { segs: Segment[] }) {
  const maxMrr = Math.max(...segs.map((s) => s.mrr), 1);
  const maxCalls = Math.max(...segs.map((s) => s.calls), 1);
  return (
    <div className="space-y-4">
      {/* MRR + calls bars */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="MRR by segment">
          <div className="space-y-3">
            {[...segs].sort((a, b) => b.mrr - a.mrr).map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="flex w-32 shrink-0 items-center gap-2 truncate text-[13px] font-medium text-coffee"><span className="size-2.5 rounded-full" style={{ background: s.tint }} />{s.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full" style={{ width: `${(s.mrr / maxMrr) * 100}%`, background: s.tint }} /></div>
                <span className="w-16 shrink-0 text-right text-[12.5px] text-mocha tabular-nums">{compactINR(s.mrr)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Call volume by segment">
          <div className="space-y-3">
            {[...segs].sort((a, b) => b.calls - a.calls).map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="flex w-32 shrink-0 items-center gap-2 truncate text-[13px] font-medium text-coffee"><span className="size-2.5 rounded-full" style={{ background: s.tint }} />{s.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${(s.calls / maxCalls) * 100}%` }} /></div>
                <span className="w-16 shrink-0 text-right text-[12.5px] text-mocha tabular-nums">{(s.calls / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* comparison table */}
      <Card title="Segment scorecard">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
              <th className="py-2.5 font-medium">Segment</th><th className="text-right font-medium">Clients</th><th className="text-right font-medium">MRR</th><th className="text-right font-medium">Calls</th><th className="text-right font-medium">Avg connect</th><th className="pl-3 text-right font-medium">Avg health</th>
            </tr></thead>
            <tbody>
              {segs.map((s) => (
                <tr key={s.key} className="border-b border-foam/60 last:border-0">
                  <td className="py-3"><span className="flex items-center gap-2 text-[13px] font-semibold text-coffee"><span className="size-2.5 rounded-full" style={{ background: s.tint }} />{s.label}</span></td>
                  <td className="text-right text-[12.5px] text-mocha tabular-nums">{s.count}</td>
                  <td className="text-right text-[12.5px] font-semibold text-coffee tabular-nums">{compactINR(s.mrr)}</td>
                  <td className="text-right text-[12.5px] text-mocha tabular-nums">{(s.calls / 1000).toFixed(1)}k</td>
                  <td className="text-right text-[12.5px] tabular-nums" style={{ color: s.avgConnect >= 65 ? "var(--color-success)" : "var(--color-warning)" }}>{s.avgConnect}%</td>
                  <td className="pl-3 text-right text-[12.5px] font-semibold tabular-nums" style={{ color: s.avgHealth >= 70 ? "var(--color-success)" : s.avgHealth >= 50 ? "var(--color-warning)" : "var(--color-danger)" }}>{s.avgHealth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function SegmentsPage() {
  const [dim, setDim] = useState<"useCase" | "plan">("useCase");
  const segs = dim === "useCase" ? segmentsByUseCase : segmentsByPlan;
  const best = [...segs].sort((a, b) => b.avgHealth - a.avgHealth)[0];

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Segments" subtitle="Slice the platform into cohorts and compare — revenue, volume and health per group."
        right={<div className="flex items-center rounded-full border border-espresso/20 bg-oat/40 p-0.5">
          {(["useCase", "plan"] as const).map((d) => (
            <button key={d} onClick={() => setDim(d)} className={`${mono} rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${dim === d ? "bg-cream text-coffee shadow-glass" : "text-latte hover:text-mocha"}`}>{d === "useCase" ? "By use case" : "By plan"}</button>
          ))}
        </div>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Layers} label="Segments" value={segs.length} sub={dim === "useCase" ? "by use case" : "by plan tier"} tint="var(--color-steam)" />
        <StatTile icon={IndianRupee} label="Total MRR" value={compactINR(platform.mrr)} sub="across segments" tint="var(--color-caramel)" />
        <StatTile icon={HeartPulse} label="Healthiest segment" value={best.label} sub={`avg health ${best.avgHealth}`} tint="var(--color-success)" />
        <StatTile icon={Gauge} label="Platform connect" value={`${platform.avgConnect}%`} sub="blended" tint="var(--color-mango)" />
      </div>

      <SegmentGrid segs={segs} />
    </div>
  );
}
