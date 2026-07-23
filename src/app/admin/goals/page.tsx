"use client";

/* /admin/goals — per-organisation goals, bifurcated by use case. Each org's
   north-star metric differs (recovery / verification / qualified-lead /
   activation); we track attainment (actual vs target) and roll it up. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Target, CheckCircle2, AlertTriangle, Gauge } from "lucide-react";
import { CpHeader, StatTile, Card, mono } from "@/components/admin/cp";
import { orgGoals, goalRollup, goalsFor, GOAL_META, type GoalType } from "@/lib/admin-analytics";
import { companyDetail, listDetail } from "@/lib/metric-details";

const FILTERS = ["All", "collections", "kyc", "leadgen", "onboarding"] as const;

function attColor(a: number) { return a >= 100 ? "var(--color-success)" : a >= 85 ? "var(--color-warning)" : "var(--color-danger)"; }

export default function GoalsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const rows = useMemo(() => filter === "All" ? orgGoals : orgGoals.filter((g) => g.type === filter), [filter]);

  const attDetail = {
    title: "Average goal attainment", value: `${goalRollup.avgAttainment}%`,
    description: "Actual vs target across every live org, blended. Each org's target is set for its use case, so this is apples-to-apples.",
    breakdowns: [{ label: "By use case", rows: goalRollup.byType.map((t) => ({ name: GOAL_META[t.type].label, sub: `${t.count}`, value: `${t.avgAttainment}%`, pct: t.avgAttainment, tint: GOAL_META[t.type].tint })) }],
  };

  const goalSub = (id: string) => { const g = goalsFor(id); return g ? `${GOAL_META[g.type].label} · ${g.actual}% vs ${g.target}% target` : undefined; };

  const onTrackDetail = companyDetail({
    title: "Orgs on track", value: `${goalRollup.onTrack}`,
    description: "Every org at or above 100% of its own use-case target this month — attainment shown per company, best first.",
    pool: orgGoals.filter((g) => g.attainment >= 100).map((g) => g.client),
    of: (c) => goalsFor(c.id)?.attainment ?? 0, fmt: (n) => `${n}%`,
    sub: (c) => goalSub(c.id), label: "By company · attainment",
  });

  const behindDetail = companyDetail({
    title: "Orgs behind target", value: `${goalRollup.atRisk}`,
    description: "Orgs under 85% attainment on their own goal, worst first — these need an intervention before the next renewal conversation.",
    pool: orgGoals.filter((g) => g.attainment < 85).map((g) => g.client),
    of: (c) => goalsFor(c.id)?.attainment ?? 0, fmt: (n) => `${n}%`,
    asc: true, flag: () => true,
    sub: (c) => goalSub(c.id), label: "By company · attainment",
  });

  const useCaseDetail = listDetail(
    "Use cases tracked", `${goalRollup.byType.length}`,
    "Distinct goal types live across the client base — each measured on its own north-star metric with its own target.",
    "By use case",
    goalRollup.byType.map((t) => ({
      name: GOAL_META[t.type].label, value: `${t.count} orgs`, pct: t.count, tint: GOAL_META[t.type].tint,
      sub: `${GOAL_META[t.type].metric} · ${t.avgAttainment}% avg attainment`, flag: t.avgAttainment < 85,
    })),
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Goals by organisation" subtitle="Every client measured against the metric that matters for its use case — not one flat KPI." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Gauge} label="Avg attainment" value={`${goalRollup.avgAttainment}%`} sub="actual vs target · all orgs" tint="var(--color-caramel)" detail={attDetail} />
        <StatTile icon={CheckCircle2} label="On track" value={goalRollup.onTrack} sub="at or above target" tint="var(--color-success)" detail={onTrackDetail} />
        <StatTile icon={AlertTriangle} label="Behind target" value={goalRollup.atRisk} sub="under 85% attainment" tint="var(--color-danger)" detail={behindDetail} />
        <StatTile icon={Target} label="Use cases tracked" value={goalRollup.byType.length} sub="distinct goal types" tint="var(--color-steam)" detail={useCaseDetail} />
      </div>

      {/* by use case */}
      <Card title="Attainment by use case">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {goalRollup.byType.map((t) => (
            <div key={t.type} className="rounded-2xl border border-foam bg-cream/40 p-4">
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: GOAL_META[t.type].tint }} /><span className="text-[13px] font-semibold text-coffee">{GOAL_META[t.type].label}</span></div>
              <div className="mt-2 font-serif text-[24px] font-semibold tabular-nums" style={{ color: attColor(t.avgAttainment) }}>{t.avgAttainment}%</div>
              <div className={`${mono} text-[10px] uppercase tracking-wide text-latte`}>{GOAL_META[t.type].metric} · {t.count} orgs</div>
            </div>
          ))}
        </div>
      </Card>

      {/* per-org table */}
      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full border px-2.5 py-1 text-[12px] font-medium capitalize transition-colors ${filter === f ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-mocha hover:border-latte"}`}>
              {f === "All" ? "All" : GOAL_META[f as GoalType].label}
            </button>
          ))}
          <span className={`${mono} ml-auto text-[10px] uppercase tracking-wide text-latte`}>worst attainment first</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
              <th className="py-2.5 font-medium">Client</th><th className="font-medium">Goal</th><th className="text-right font-medium">Target</th><th className="text-right font-medium">Actual</th><th className="px-3 font-medium">Attainment</th><th className="text-right font-medium">Call target</th>
            </tr></thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.client.id} onClick={() => router.push(`/admin/clients/${g.client.id}`)} className="cursor-pointer border-b border-foam/60 last:border-0 hover:bg-oat/30">
                  <td className="py-3 text-[13px] font-medium text-coffee">{g.client.name}</td>
                  <td><span className="inline-flex items-center gap-1.5 text-[12.5px] text-mocha"><span className="size-2 rounded-full" style={{ background: GOAL_META[g.type].tint }} />{g.metric}</span></td>
                  <td className="text-right text-[12.5px] text-latte tabular-nums">{g.target}%</td>
                  <td className="text-right text-[12.5px] font-semibold text-coffee tabular-nums">{g.actual}%</td>
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full" style={{ width: `${Math.min(100, g.attainment)}%`, background: attColor(g.attainment) }} /></div>
                      <span className="w-9 text-right text-[12px] font-semibold tabular-nums" style={{ color: attColor(g.attainment) }}>{g.attainment}%</span>
                    </div>
                  </td>
                  <td className="text-right text-[12px] text-mocha tabular-nums">{(g.callActual / 1000).toFixed(1)}k / {(g.callTarget / 1000).toFixed(0)}k</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
