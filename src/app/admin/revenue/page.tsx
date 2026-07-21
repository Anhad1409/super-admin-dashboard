"use client";

/* /admin/revenue — platform revenue: MRR/ARR, expansion vs churn, revenue
   by plan, and the recent invoice run. */

import { IndianRupee, TrendingUp, TrendingDown, Users, Receipt, ArrowUpRight } from "lucide-react";
import { toast } from "@/components/notifications/toaster";
import { CpHeader, StatTile, Card, Tag, compactINR, mono, monoLabel } from "@/components/admin/cp";
import { platform, planMix, mrrSeries, PLAN_META } from "@/lib/clients-mock";
import { revenue, invoices } from "@/lib/admin-mock";

function MrrChart() {
  const w = 640, h = 170, pad = 8;
  const vals = mrrSeries.map((p) => p.v);
  const max = Math.max(...vals), min = Math.min(...vals) * 0.9;
  const x = (i: number) => pad + (i / (mrrSeries.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2 - 14);
  const line = mrrSeries.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.v)}`).join(" ");
  const area = `${line} L${x(mrrSeries.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 170 }}>
      <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--color-caramel)" stopOpacity="0.28" /><stop offset="1" stopColor="var(--color-caramel)" stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill="url(#rev)" />
      <path d={line} fill="none" stroke="var(--color-caramel)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {mrrSeries.map((p, i) => (
        <g key={p.m}>
          {i === mrrSeries.length - 1 && <circle cx={x(i)} cy={y(p.v)} r="4" fill="var(--color-caramel)" stroke="#fffdf9" strokeWidth="2" />}
          <text x={x(i)} y={h - 1} textAnchor="middle" className={mono} fontSize="9" fill="var(--color-latte)">{p.m}</text>
        </g>
      ))}
    </svg>
  );
}

const INVOICE_TONE = { paid: "var(--color-success)", pending: "var(--color-warning)", overdue: "var(--color-danger)" } as const;

export default function RevenuePage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Revenue" subtitle="Recurring revenue, expansion and collections across every client." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={IndianRupee} label="Monthly recurring revenue" value={compactINR(revenue.mrr)} sub={`${compactINR(revenue.arr)} ARR`} tint="var(--color-caramel)" delta="+4.4%" />
        <StatTile icon={Users} label="Avg revenue / account" value={compactINR(revenue.arpa)} sub={`${platform.active} paying clients`} tint="var(--color-steam)" />
        <StatTile icon={TrendingUp} label="Expansion this month" value={compactINR(revenue.expansionMrr)} sub="upgrades + add-ons" tint="var(--color-success)" delta={`+${compactINR(revenue.netNewMrr)} net new`} />
        <StatTile icon={TrendingDown} label="Churn + downgrade" value={compactINR(revenue.churnedMrr)} sub={`${compactINR(revenue.overdue)} overdue`} tint="var(--color-danger)" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Card title="MRR growth" right={<span className={`${mono} text-[11px] text-latte`}>12 months</span>}>
          <MrrChart />
        </Card>
        <Card title="Revenue by plan">
          <div className="space-y-2.5">
            {planMix.filter((p) => p.mrr > 0).sort((a, b) => b.mrr - a.mrr).map((p) => {
              const pct = Math.round((p.mrr / revenue.mrr) * 100);
              return (
                <div key={p.plan}>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="flex items-center gap-2 text-coffee"><span className="size-2.5 rounded-full" style={{ background: PLAN_META[p.plan].tint }} />{PLAN_META[p.plan].label} <span className="text-latte">· {p.count}</span></span>
                    <span className="font-medium text-mocha tabular-nums">{compactINR(p.mrr)} · {pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: PLAN_META[p.plan].tint }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="Recent invoices" right={<button onClick={() => toast({ title: "Export", body: "Invoice run exported to CSV.", severity: "success" })} className="inline-flex items-center gap-1 text-[12px] font-medium text-caramel hover:underline">Export <ArrowUpRight className="size-3" /></button>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
              <th className="py-2.5 font-medium">Invoice</th><th className="font-medium">Client</th><th className="font-medium">Date</th><th className="text-right font-medium">Amount</th><th className="pl-4 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-foam/60 last:border-0">
                  <td className={`${mono} py-3 text-[11px] text-mocha`}>{inv.id}</td>
                  <td className="text-[13px] font-medium text-coffee">{inv.client.name}</td>
                  <td className="text-[12px] text-muted-foreground">{inv.date}</td>
                  <td className="text-right text-[13px] font-semibold text-coffee tabular-nums">₹{inv.amount.toLocaleString("en-IN")}</td>
                  <td className="pl-4"><Tag c={INVOICE_TONE[inv.status]}>{inv.status[0].toUpperCase() + inv.status.slice(1)}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
