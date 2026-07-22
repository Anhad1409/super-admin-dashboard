"use client";

/* /admin/forecast — where the platform is heading: MRR projection, revenue
   at risk, and per-client wallet runway (who runs dry first). */

import { useRouter } from "next/navigation";
import { TrendingUp, AlertTriangle, Wallet, Clock3 } from "lucide-react";
import { CpHeader, StatTile, Card, mono, compactINR } from "@/components/admin/cp";
import { forecast, runways, runningDry } from "@/lib/admin-analytics";

export default function ForecastPage() {
  const router = useRouter();
  const maxV = Math.max(...forecast.mrr.map((p) => p.v));
  const projectedEnd = forecast.mrr[forecast.mrr.length - 1].v;

  return (
    <div className="mx-auto max-w-[1300px] space-y-5">
      <CpHeader title="Forecast" subtitle="Projected revenue, at-risk MRR and the clients about to run their wallets dry." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={TrendingUp} label="Projected MRR · 90d" value={compactINR(projectedEnd)} sub={`from ${compactINR(forecast.mrr[0].v)} today`} tint="var(--color-success)" delta="+19%" />
        <StatTile icon={AlertTriangle} label="MRR at risk" value={compactINR(forecast.atRiskMrr)} sub="in high-churn accounts" tint="var(--color-danger)" />
        <StatTile icon={Clock3} label="Running dry < 30d" value={runningDry.length} sub="wallet will deplete" tint="var(--color-warning)" />
        <StatTile icon={Wallet} label="Clients metered" value={runways.length} sub="active usage-based" tint="var(--color-steam)" />
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
