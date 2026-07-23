"use client";

/* AI Learning Engine — self-learning insights from call analysis.
   Analysis cycles generate insights; each moves pending → approved → applied
   (or rejected). All state is client-side mock; KPIs derive from it live. */

import { useEffect, useRef, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Clock,
  Inbox,
  Lightbulb,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip, monoLabel } from "@/components/v7/kit";
import { EmptyState } from "@/components/ui-bits/empty-state";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

type InsightStatus = "pending" | "approved" | "applied" | "rejected";
type Severity = "high" | "medium" | "low";

interface Insight {
  id: number;
  title: string;
  rationale: string;
  confidence: number;
  severity: Severity;
  status: InsightStatus;
}

interface Cycle {
  id: number;
  trigger: "manual" | "scheduled";
  calls: number;
  found: number;
  started: string;
  status: "completed";
}

const SEED_CYCLES: Cycle[] = [
  { id: 3, trigger: "scheduled", calls: 412, found: 3, started: "Jul 14, 02:00", status: "completed" },
  { id: 2, trigger: "manual", calls: 268, found: 2, started: "Jul 11, 15:42", status: "completed" },
  { id: 1, trigger: "scheduled", calls: 390, found: 4, started: "Jul 08, 02:00", status: "completed" },
];

const GENERATED_INSIGHTS: Omit<Insight, "id" | "status">[] = [
  {
    title: "Shorten the opening line",
    rationale:
      "Calls where the greeting exceeds 9s show 2.1× higher hangup rate. Suggest trimming the campaign greeting.",
    confidence: 87,
    severity: "high",
  },
  {
    title: "Move callbacks to 4–6 pm",
    rationale: "Callback-agreed leads answer 34% more often in the 16:00–18:00 window.",
    confidence: 74,
    severity: "medium",
  },
];

const SEVERITY_DOT: Record<Severity, string> = {
  high: "bg-danger",
  medium: "bg-warning",
  low: "bg-info",
};

const TABS = ["Dashboard", "Insights", "Cycles"] as const;
const FILTERS = ["All", "Pending", "Approved", "Applied", "Rejected"] as const;

function nowLabel() {
  const d = new Date();
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d
    .toTimeString()
    .slice(0, 5)}`;
}

export default function LearningPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Dashboard");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>(SEED_CYCLES);
  const [analyzing, setAnalyzing] = useState(false);
  const nextId = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const counts = {
    pending: insights.filter((i) => i.status === "pending").length,
    approved: insights.filter((i) => i.status === "approved").length,
    applied: insights.filter((i) => i.status === "applied").length,
    rejected: insights.filter((i) => i.status === "rejected").length,
  };

  const triggerAnalysis = () => {
    setAnalyzing(true);
    timer.current = setTimeout(() => {
      setCycles((prev) => [
        {
          id: Math.max(...prev.map((c) => c.id)) + 1,
          trigger: "manual",
          calls: 180 + prev.length * 47,
          found: GENERATED_INSIGHTS.length,
          started: nowLabel(),
          status: "completed",
        },
        ...prev,
      ]);
      setInsights((prev) => [
        ...GENERATED_INSIGHTS.map((g) => ({ ...g, id: nextId.current++, status: "pending" as const })),
        ...prev,
      ]);
      setAnalyzing(false);
      toast({
        title: "Analysis complete",
        body: `${GENERATED_INSIGHTS.length} new insights are awaiting review.`,
        severity: "success",
      });
    }, 1800);
  };

  const setStatus = (id: number, status: InsightStatus) =>
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

  const approve = (i: Insight) => {
    setStatus(i.id, "approved");
    toast({ title: "Insight approved", body: `"${i.title}" is ready to apply.`, severity: "success" });
  };
  const reject = (i: Insight) => {
    setStatus(i.id, "rejected");
    toast({ title: "Insight rejected", body: `"${i.title}" removed from the review queue.`, severity: "info" });
  };
  const apply = (i: Insight) => {
    setStatus(i.id, "applied");
    toast({ title: "Change applied", body: `"${i.title}" has been pushed to the agent configuration.`, severity: "success" });
  };

  const KPIS = [
    { icon: RefreshCw, label: "Total Cycles", value: cycles.length, sub: "analysis runs" },
    { icon: Lightbulb, label: "Total Insights", value: insights.length, sub: "all statuses" },
    { icon: Clock, label: "Pending Review", value: counts.pending, sub: "Awaiting approval" },
    { icon: CheckCircle2, label: "Approved", value: counts.approved, sub: "ready to apply" },
    { icon: Zap, label: "Applied", value: counts.applied, sub: "Changes implemented" },
  ];

  const reviewQueue = insights.filter((i) => i.status === "pending" || i.status === "approved");
  const filtered =
    filter === "All" ? insights : insights.filter((i) => i.status === filter.toLowerCase());

  const insightActions = (i: Insight) => {
    if (i.status === "pending")
      return (
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" onClick={() => approve(i)} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">Approve</Button>
          <Button size="sm" variant="outline" onClick={() => reject(i)} className="border-foam text-mocha hover:text-coffee">Reject</Button>
        </div>
      );
    if (i.status === "approved")
      return (
        <Button size="sm" onClick={() => apply(i)} className="shrink-0 gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">
          <Zap className="size-3.5" /> Apply change
        </Button>
      );
    return (
      <span
        className={cn(
          "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
          i.status === "applied"
            ? "border-success/30 bg-success/10 text-success"
            : "border-danger/30 bg-danger/10 text-danger",
        )}
      >
        {i.status === "applied" ? "Applied" : "Rejected"}
      </span>
    );
  };

  const insightRow = (i: Insight) => (
    <div key={i.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
      <span className={cn("size-2 shrink-0 rounded-full", SEVERITY_DOT[i.severity])} aria-label={`${i.severity} severity`} />
      <div className="min-w-[220px] flex-1">
        <p className="text-sm font-medium text-coffee">{i.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{i.rationale}</p>
      </div>
      <span className="shrink-0 font-[family-name:var(--font-data)] text-[11px] text-mocha tabular-nums">{i.confidence}%</span>
      {insightActions(i)}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-serif text-3xl font-semibold tracking-tight text-coffee">
            <Brain className="size-6 text-caramel" /> AI Learning Engine
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Self-learning insights from call analysis and test sessions.</p>
        </div>
        <Button disabled={analyzing} onClick={triggerAnalysis} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">
          {analyzing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          {analyzing ? "Analyzing…" : "Trigger Analysis"}
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Chip key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Chip>
        ))}
      </div>

      {tab === "Dashboard" && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {KPIS.map((k) => (
              <div key={k.label} className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
                <div className="flex items-center gap-2">
                  <k.icon className="size-4 text-caramel" />
                  <span className={monoLabel}>{k.label}</span>
                </div>
                <div className="mt-2 font-serif text-[24px] font-semibold leading-none text-coffee tabular-nums">{k.value}</div>
                <div className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</div>
              </div>
            ))}
          </div>

          <section className="mt-5 rounded-2xl border border-foam bg-porcelain shadow-glass">
            <header className="border-b border-foam px-5 py-4">
              <h2 className="font-serif text-lg font-semibold text-coffee">Recent Insights Pending Review</h2>
              <p className="text-xs text-muted-foreground">Approve to queue a change, reject to dismiss.</p>
            </header>
            {reviewQueue.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No insights yet"
                hint="Trigger an analysis cycle to generate AI-powered insights from your calls."
              />
            ) : (
              <div className="divide-y divide-foam">{reviewQueue.map(insightRow)}</div>
            )}
          </section>
        </>
      )}

      {tab === "Insights" && (
        <section className="rounded-2xl border border-foam bg-porcelain shadow-glass">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-foam px-5 py-4">
            <h2 className="font-serif text-lg font-semibold text-coffee">All Insights</h2>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <Chip
                  key={f}
                  active={filter === f}
                  onClick={() => setFilter(f)}
                  count={f === "All" ? insights.length : counts[f.toLowerCase() as keyof typeof counts]}
                >
                  {f}
                </Chip>
              ))}
            </div>
          </header>
          {filtered.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={insights.length === 0 ? "No insights yet" : `No ${filter.toLowerCase()} insights`}
              hint={
                insights.length === 0
                  ? "Trigger an analysis cycle to generate AI-powered insights from your calls."
                  : "Switch filters or run another analysis cycle."
              }
            />
          ) : (
            <div className="divide-y divide-foam">{filtered.map(insightRow)}</div>
          )}
        </section>
      )}

      {tab === "Cycles" && (
        <section className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
          <header className="border-b border-foam px-5 py-4">
            <h2 className="font-serif text-lg font-semibold text-coffee">Analysis Cycles</h2>
            <p className="text-xs text-muted-foreground">Every run of the learning engine, newest first.</p>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-foam">
                  {["#", "Trigger", "Calls analyzed", "Insights found", "Started", "Status"].map((h) => (
                    <th key={h} className={cn("px-5 py-2.5 font-normal", monoLabel)}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-foam">
                {cycles.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-[family-name:var(--font-data)] text-[12px] text-mocha tabular-nums">{c.id}</td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                        c.trigger === "manual" ? "border-caramel/30 bg-caramel/10 text-caramel" : "border-foam bg-oat text-mocha",
                      )}>
                        {c.trigger}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-coffee tabular-nums">{c.calls.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-coffee tabular-nums">{c.found}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.started}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
