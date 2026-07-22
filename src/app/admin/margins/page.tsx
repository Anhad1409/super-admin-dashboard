"use client";

/* /admin/margins — platform unit economics: revenue vs COGS, gross margin,
   blended cost per minute by provider, and per-client profitability. */

import { useRouter } from "next/navigation";
import { IndianRupee, TrendingUp, Percent, Coins, ChevronRight, AlertTriangle } from "lucide-react";
import { CpHeader, StatTile, Card, mono, compactINR } from "@/components/admin/cp";
import { margins, costModel, economics, COST_PER_MIN } from "@/lib/admin-analytics";

export default function MarginsPage() {
  const router = useRouter();
  const maxCost = Math.max(...costModel.map((c) => c.perMin));

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Unit economics" subtitle="What the platform earns after the cost of every talk-minute — revenue, COGS and margin." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={IndianRupee} label="Billed revenue" value={compactINR(margins.revenue)} sub="subscription + usage" tint="var(--color-caramel)" />
        <StatTile icon={Coins} label="Cost of revenue" value={compactINR(margins.cogs)} sub={`₹${COST_PER_MIN.toFixed(2)} / talk-minute`} tint="var(--color-mocha)" />
        <StatTile icon={TrendingUp} label="Gross profit" value={compactINR(margins.grossProfit)} sub="this month" tint="var(--color-success)" />
        <StatTile icon={Percent} label="Gross margin" value={`${margins.grossMarginPct}%`} sub={`${margins.thin.length} thin-margin clients`} tint="var(--color-steam)" delta="+2 pts" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Cost per minute" right={<span className={`${mono} text-[11px] text-latte`}>blended ₹{COST_PER_MIN.toFixed(2)}</span>}>
          <div className="space-y-3">
            {costModel.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-2 text-coffee"><span className="size-2.5 rounded-full" style={{ background: c.tint }} />{c.name}</span>
                  <span className="font-medium text-mocha tabular-nums">₹{c.perMin.toFixed(2)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full" style={{ width: `${(c.perMin / maxCost) * 100}%`, background: c.tint }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-oat/50 px-3.5 py-2.5">
            <span className={`${mono} text-[10px] uppercase tracking-[0.14em] text-mocha`}>Price / min</span>
            <span className="text-[13px] font-semibold text-coffee tabular-nums">₹{margins.pricePerMin.toFixed(2)} <span className="text-success">· ₹{(margins.pricePerMin - COST_PER_MIN).toFixed(2)} margin</span></span>
          </div>
        </Card>

        <Card title="Profitability by client" right={<span className={`${mono} text-[11px] text-latte`}>revenue − COGS</span>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
                <th className="py-2 font-medium">Client</th><th className="text-right font-medium">Revenue</th><th className="text-right font-medium">COGS</th><th className="text-right font-medium">Margin</th><th className="pl-3 font-medium">%</th>
              </tr></thead>
              <tbody>
                {economics.map((e) => (
                  <tr key={e.client.id} onClick={() => router.push(`/admin/clients/${e.client.id}`)} className="cursor-pointer border-b border-foam/60 last:border-0 hover:bg-oat/30">
                    <td className="py-2.5 text-[13px] font-medium text-coffee">{e.client.name}</td>
                    <td className="text-right text-[12.5px] text-mocha tabular-nums">{compactINR(e.revenue)}</td>
                    <td className="text-right text-[12.5px] text-latte tabular-nums">{compactINR(e.cogs)}</td>
                    <td className="text-right text-[12.5px] font-semibold tabular-nums" style={{ color: e.margin < 0 ? "var(--color-danger)" : "var(--color-coffee)" }}>{e.margin < 0 ? "−" : ""}{compactINR(Math.abs(e.margin))}</td>
                    <td className="pl-3">
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold tabular-nums" style={{ color: e.marginPct < 40 ? "var(--color-warning)" : "var(--color-success)" }}>
                        {e.marginPct < 40 && <AlertTriangle className="size-3" />}{e.marginPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
