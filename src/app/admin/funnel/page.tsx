"use client";

/* /admin/funnel — the activation funnel: signup → live → paid, with the
   drop-off at each step and the headline conversion metrics. */

import { UserPlus, Rocket, CreditCard, Clock3 } from "lucide-react";
import { CpHeader, StatTile, Card, mono } from "@/components/admin/cp";
import { funnel, funnelStats } from "@/lib/admin-analytics";

export default function FunnelPage() {
  const top = funnel[0].count;
  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <CpHeader title="Activation funnel" subtitle="Where new signups turn into live, paying clients — and where they fall away." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={UserPlus} label="Signups · 90d" value={funnel[0].count} sub="top of funnel" tint="var(--color-steam)" />
        <StatTile icon={Rocket} label="Activation rate" value={`${funnelStats.activation}%`} sub="signup → live" tint="var(--color-caramel)" />
        <StatTile icon={CreditCard} label="Trial → paid" value={`${funnelStats.trialToPaid}%`} sub="conversion" tint="var(--color-success)" />
        <StatTile icon={Clock3} label="Median time to live" value={funnelStats.medianTimeToLive} sub="from signup" tint="var(--color-blueberry)" />
      </div>

      <Card title="Funnel" right={<span className={`${mono} text-[11px] text-latte`}>last 90 days</span>}>
        <div className="space-y-2.5">
          {funnel.map((s, i) => {
            const pctOfTop = Math.round((s.count / top) * 100);
            const prev = i === 0 ? s.count : funnel[i - 1].count;
            const stepConv = Math.round((s.count / prev) * 100);
            const dropped = prev - s.count;
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-medium text-coffee">{s.label} <span className="text-latte">· {s.hint}</span></span>
                  <span className="tabular-nums text-mocha">{s.count.toLocaleString("en-IN")} <span className="text-latte">({pctOfTop}%)</span></span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-7 flex-1 overflow-hidden rounded-lg bg-foam">
                    <div className="flex h-full items-center rounded-lg bg-gradient-to-r from-mocha to-caramel pl-2.5" style={{ width: `${Math.max(pctOfTop, 6)}%` }}>
                      {pctOfTop > 12 && <span className="text-[10px] font-semibold text-cream tabular-nums">{s.count.toLocaleString("en-IN")}</span>}
                    </div>
                  </div>
                  {i > 0 && (
                    <span className={`${mono} w-28 shrink-0 text-right text-[10px] uppercase tracking-wide`} style={{ color: stepConv >= 70 ? "var(--color-success)" : stepConv >= 50 ? "var(--color-warning)" : "var(--color-danger)" }}>
                      {stepConv}% kept · −{dropped.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 rounded-lg bg-oat/50 px-3.5 py-2.5 text-[12px] text-mocha">
          Biggest drop-off: <span className="font-semibold text-coffee">Heard a sample call → Built first campaign</span> ({Math.round((funnel[4].count / funnel[3].count) * 100)}% kept). Worth a nudge sequence for clients who tasted but haven&apos;t built.
        </p>
      </Card>
    </div>
  );
}
