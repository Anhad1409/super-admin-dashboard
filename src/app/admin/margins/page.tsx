"use client";

/* /admin/margins — platform unit economics: revenue vs COGS, gross margin,
   blended cost per minute by provider, and per-client profitability. */

import { useRouter } from "next/navigation";
import { IndianRupee, TrendingUp, Percent, Coins, ChevronRight, AlertTriangle } from "lucide-react";
import { CpHeader, StatTile, Card, mono, compactINR } from "@/components/admin/cp";
import { margins, costModel, economics, COST_PER_MIN } from "@/lib/admin-analytics";
import { companyDetail } from "@/lib/metric-details";

const eco = new Map(economics.map((e) => [e.client.id, e]));
const ecoPool = economics.map((e) => e.client);
const signedINR = (n: number) => (n < 0 ? `−${compactINR(Math.abs(n))}` : compactINR(n));

export default function MarginsPage() {
  const router = useRouter();
  const maxCost = Math.max(...costModel.map((c) => c.perMin));

  const revenueDetail = companyDetail({
    title: "Billed revenue",
    value: compactINR(margins.revenue),
    description: "Subscription plus overage-minute revenue billed this month, split across every paying client.",
    pool: ecoPool,
    of: (c) => eco.get(c.id)?.revenue ?? 0,
    fmt: compactINR,
    sub: (c) => `${eco.get(c.id)!.marginPct}% margin`,
    includeZero: true,
  });
  const cogsDetail = companyDetail({
    title: "Cost of revenue",
    value: compactINR(margins.cogs),
    description: `Talk-minutes consumed times the blended ₹${COST_PER_MIN.toFixed(2)}/min provider cost, per client.`,
    pool: ecoPool,
    of: (c) => eco.get(c.id)?.cogs ?? 0,
    fmt: compactINR,
    sub: (c) => `${c.minutesMonth.toLocaleString("en-IN")} min`,
    includeZero: true,
  });
  const profitDetail = companyDetail({
    title: "Gross profit",
    value: compactINR(margins.grossProfit),
    description: "Revenue minus COGS per client this month — flagged rows are running at a loss.",
    pool: ecoPool,
    of: (c) => eco.get(c.id)?.margin ?? 0,
    fmt: signedINR,
    sub: (c) => `${eco.get(c.id)!.marginPct}% margin`,
    flag: (c) => (eco.get(c.id)?.margin ?? 0) < 0,
    includeZero: true,
  });
  const marginPctDetail = companyDetail({
    title: "Gross margin",
    value: `${margins.grossMarginPct}%`,
    description: "Gross margin per client, thinnest first — flagged rows sit below the 40% watch line.",
    pool: ecoPool,
    of: (c) => eco.get(c.id)?.marginPct ?? 0,
    fmt: (n) => `${n}%`,
    sub: (c) => `${compactINR(eco.get(c.id)!.revenue)} revenue`,
    flag: (c) => (eco.get(c.id)?.marginPct ?? 0) < 40,
    asc: true,
    includeZero: true,
    note: `${margins.thin.length} clients under 40% margin`,
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Unit economics" subtitle="What the platform earns after the cost of every talk-minute — revenue, COGS and margin." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={IndianRupee} label="Billed revenue" value={compactINR(margins.revenue)} sub="subscription + usage" tint="var(--color-caramel)" detail={revenueDetail} />
        <StatTile icon={Coins} label="Cost of revenue" value={compactINR(margins.cogs)} sub={`₹${COST_PER_MIN.toFixed(2)} / talk-minute`} tint="var(--color-mocha)" detail={cogsDetail} />
        <StatTile icon={TrendingUp} label="Gross profit" value={compactINR(margins.grossProfit)} sub="this month" tint="var(--color-success)" detail={profitDetail} />
        <StatTile icon={Percent} label="Gross margin" value={`${margins.grossMarginPct}%`} sub={`${margins.thin.length} thin-margin clients`} tint="var(--color-steam)" delta="+2 pts" detail={marginPctDetail} />
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
                <th className="py-2.5 font-medium">Client</th><th className="text-right font-medium">Revenue</th><th className="text-right font-medium">COGS</th><th className="text-right font-medium">Margin</th><th className="pl-3 font-medium">%</th>
              </tr></thead>
              <tbody>
                {economics.map((e) => (
                  <tr key={e.client.id} onClick={() => router.push(`/admin/clients/${e.client.id}`)} className="cursor-pointer border-b border-foam/60 last:border-0 hover:bg-oat/30">
                    <td className="py-3 text-[13px] font-medium text-coffee">{e.client.name}</td>
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
