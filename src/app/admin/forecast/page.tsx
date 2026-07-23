"use client";

/* /admin/forecast — where the platform is heading: MRR projection, revenue
   at risk, and per-client wallet runway (who runs dry first). */

import { useRouter } from "next/navigation";
import { TrendingUp, AlertTriangle, Wallet, Clock3 } from "lucide-react";
import { CpHeader, StatTile, Card, mono, compactINR } from "@/components/admin/cp";
import { forecast, runways, runningDry } from "@/lib/admin-analytics";
import { clients, churnRiskOf, PLAN_META, STATUS_META } from "@/lib/clients-mock";
import { companyDetail, listDetail } from "@/lib/metric-details";

const projectedEnd = forecast.mrr[forecast.mrr.length - 1].v;
const runwayOf = new Map(runways.map((r) => [r.client.id, r]));

// ---- tile drill-downs ----
const projDetail = listDetail(
  "Projected MRR · 90d",
  compactINR(projectedEnd),
  "Month-by-month MRR trajectory — solid months are actual, projected months assume the current quick-ratio holds and at-risk wallets are topped up.",
  "By month",
  forecast.mrr.map((p) => ({
    name: `${p.m} · ${p.actual ? "actual" : "projected"}`,
    value: compactINR(p.v),
    pct: p.v,
    tint: p.actual ? "var(--color-mocha)" : "var(--color-caramel)",
    sub: p.actual ? undefined : `+${Math.round((p.v / forecast.mrr[0].v - 1) * 100)}% vs today`,
  })),
  [{ label: "Revenue", href: "/admin/revenue" }],
  `${compactINR(forecast.atRiskMrr)} of current MRR sits in high-churn accounts and is not discounted from this projection.`
);

const atRiskDetail = companyDetail({
  title: "MRR at risk",
  value: compactINR(forecast.atRiskMrr),
  description: "Monthly recurring revenue sitting in accounts flagged high churn-risk — the revenue lost if none of them are saved.",
  of: (c) => c.mrr,
  fmt: compactINR,
  pool: clients.filter((c) => churnRiskOf(c) === "high" && c.status !== "churned"),
  sub: (c) => `health ${c.health} · ${STATUS_META[c.status].label}`,
  flag: (c) => c.status === "past_due",
  note: "High risk = health below 45 · flagged rows are also past due.",
  links: [{ label: "All clients", href: "/admin/clients" }],
});

const dryDetail = companyDetail({
  title: "Running dry < 30d",
  value: `${runningDry.length}`,
  description: "Active metered clients whose prepaid wallet depletes within 30 days at their current daily burn — soonest to dry first.",
  of: (c) => runwayOf.get(c.id)?.days ?? 0,
  fmt: (n) => `${n}d`,
  pool: runningDry.map((r) => r.client),
  sub: (c) => `wallet ${compactINR(c.walletBalance)} · burn ${compactINR(runwayOf.get(c.id)?.burnPerDay ?? 0)}/day`,
  flag: (c) => (runwayOf.get(c.id)?.days ?? 0) < 15,
  includeZero: true,
  asc: true,
  label: "Days of wallet left",
  note: "Days = wallet balance ÷ daily burn · flagged rows run dry inside 15 days.",
});

const meteredDetail = companyDetail({
  title: "Clients metered",
  value: `${runways.length}`,
  description: "Every active usage-based client ranked by daily wallet burn — heavier burn means sooner top-ups.",
  of: (c) => runwayOf.get(c.id)?.burnPerDay ?? 0,
  fmt: (n) => `${compactINR(n)}/day`,
  pool: runways.map((r) => r.client),
  sub: (c) => `${PLAN_META[c.plan].label} · ${runwayOf.get(c.id)?.days ?? 0}d runway`,
  flag: (c) => (runwayOf.get(c.id)?.days ?? 0) < 30,
  includeZero: true,
  label: "By daily burn",
  note: "Flagged rows deplete their wallet within 30 days.",
});

export default function ForecastPage() {
  const router = useRouter();
  const maxV = Math.max(...forecast.mrr.map((p) => p.v));

  return (
    <div className="mx-auto max-w-[1300px] space-y-5">
      <CpHeader title="Forecast" subtitle="Projected revenue, at-risk MRR and the clients about to run their wallets dry." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={TrendingUp} label="Projected MRR · 90d" value={compactINR(projectedEnd)} sub={`from ${compactINR(forecast.mrr[0].v)} today`} tint="var(--color-success)" delta="+19%" detail={projDetail} />
        <StatTile icon={AlertTriangle} label="MRR at risk" value={compactINR(forecast.atRiskMrr)} sub="in high-churn accounts" tint="var(--color-danger)" detail={atRiskDetail} />
        <StatTile icon={Clock3} label="Running dry < 30d" value={runningDry.length} sub="wallet will deplete" tint="var(--color-warning)" detail={dryDetail} />
        <StatTile icon={Wallet} label="Clients metered" value={runways.length} sub="active usage-based" tint="var(--color-steam)" detail={meteredDetail} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="MRR projection" right={<span className={`${mono} text-[11px] text-latte`}>next 3 months</span>}>
          <div className="mt-2 flex h-52 items-end gap-4">
            {forecast.mrr.map((p) => (
              <div key={p.m} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[12px] font-semibold text-coffee tabular-nums">{compactINR(p.v)}</span>
                <div className="w-full rounded-t-lg" style={{ height: `${(p.v / maxV) * 175}px`, background: p.actual ? "linear-gradient(to top, var(--color-mocha), var(--color-caramel))" : "repeating-linear-gradient(45deg, color-mix(in srgb, var(--color-caramel) 40%, #fffdf9), color-mix(in srgb, var(--color-caramel) 40%, #fffdf9) 6px, color-mix(in srgb, var(--color-caramel) 20%, #fffdf9) 6px, color-mix(in srgb, var(--color-caramel) 20%, #fffdf9) 12px)", border: p.actual ? "none" : "1.5px dashed color-mix(in srgb, var(--color-caramel) 55%, transparent)" }} />
                <span className={`${mono} text-[10px] uppercase tracking-wide text-latte`}>{p.m}{p.actual ? "" : " ·proj"}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-oat/50 px-3.5 py-2.5 text-[12px] text-mocha">Projection assumes current quick-ratio holds and the {runningDry.length} at-risk wallets are topped up. Solid bars = actual, hatched = forecast.</p>
        </Card>

        <Card title="Wallet runway" right={<span className={`${mono} text-[11px] text-latte`}>soonest to dry</span>}>
          <div className="space-y-2.5">
            {runways.slice(0, 8).map((r) => {
              const tint = r.days < 15 ? "var(--color-danger)" : r.days < 30 ? "var(--color-warning)" : "var(--color-success)";
              return (
                <button key={r.client.id} onClick={() => router.push(`/admin/clients/${r.client.id}`)} className="flex w-full items-center gap-3 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-oat/40">
                  <span className="w-32 shrink-0 truncate text-[13px] font-medium text-coffee">{r.client.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (r.days / 60) * 100)}%`, background: tint }} /></div>
                  <span className="w-16 shrink-0 text-right text-[12px] font-semibold tabular-nums" style={{ color: tint }}>{r.days}d</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
