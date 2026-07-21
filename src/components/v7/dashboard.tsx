"use client";

/* v7 Dashboard — the whole account at a glance, in the v7 porcelain language.
   Every figure reads from src/lib/derived.ts (the single metrics source), the
   live channel number comes from the shared capacity store, and the resource
   hero switches on the billing model — one resource concept at a time.
   Professional SaaS wording; the coffee VISUAL identity stays. */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Ban, Check, CircleCheck, Clock,
  IndianRupee, Megaphone, Mic, Phone, PhoneCall, PhoneForwarded, PhoneOff,
  Plus, RotateCcw, Sparkles, Upload, Users, X,
} from "lucide-react";
import { CoffeeCup } from "@/components/coffee/coffee-cup";
import { BeanDot, LiveDot } from "@/components/coffee/bean-dot";
import { Donut } from "@/components/ui-bits/donut";
import { AreaChart } from "@/components/ui-bits/area-chart";
import { MiniSpark } from "@/components/ui-bits/mini-spark";
import { Chip, SectionCard, Meter, Equalizer, monoLabel, rowStagger, rowItem, EASE } from "./kit";
import {
  rangeMetrics, RANGE_LABEL, type RangeKey, dayDelta,
  activeCampaigns, bestCampaign, worstCampaign,
  agentQuality, weeklyGoal, complianceSnapshot,
  attentionItems, activityFeed, agoLabel, timeGreeting,
} from "@/lib/derived";
import { useBillingModel, setBillingModel, subscriptionPlan, meteredPlan, meteredRunwayDays } from "@/lib/billing";
import { useSharedCapacity, refreshCapacity } from "@/lib/capacity-store";
import { getProfile, getCredits, getLedger } from "@/lib/tab-mock";
import { CHANNELS, CAPACITY, HEALTHY_CEILING } from "@/lib/channel-mock";
import { currentUser, timeSeries } from "@/lib/data";
import { formatDuration, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ---------------- shared bits ---------------- */

const monoData = "font-[family-name:var(--font-data)] tabular-nums";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 1, label: "Today" },
  { key: 7, label: "7 days" },
  { key: 14, label: "14 days" },
];

const pillSolid = "inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-3.5 text-[13px] font-medium text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark";
const pillOutline = "inline-flex h-9 items-center gap-1.5 rounded-full border border-foam bg-porcelain px-3.5 text-[13px] font-medium text-mocha shadow-glass transition-colors hover:border-latte hover:text-coffee";

function Delta({ v, invert = false }: { v: number; invert?: boolean }) {
  if (!v) return <span className="text-[11px] text-muted-foreground">—</span>;
  const up = v > 0;
  const good = invert ? !up : up;
  return (
    <span className={cn("flex items-center gap-0.5 text-[11px] font-medium", good ? "text-success" : "text-danger")}>
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(Math.round(v))}
    </span>
  );
}

/** Card footer link, pinned to the bottom edge of a SectionCard. */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-1 border-t border-foam bg-cream/40 px-5 py-2.5 text-xs font-semibold text-caramel transition-colors hover:text-brand-dark">
      <span>{children}</span>
      <ArrowRight className="size-3.5" />
    </Link>
  );
}

/* Entrance stagger for card grids (skipped under reduced motion). */
function StaggerGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={rowStagger} initial={reduce ? false : "hidden"} animate="show">
      {children}
    </motion.div>
  );
}
function StaggerItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return <motion.div variants={rowItem} className={cn("min-w-0", className)}>{children}</motion.div>;
}

/* ---------------- 1. header band ---------------- */

function Header({ range, setRange, summary }: {
  range: RangeKey;
  setRange: (r: RangeKey) => void;
  summary: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [greeting, setGreeting] = useState("Good morning");
  const [firstName, setFirstName] = useState<string | null>(null);
  const [updatedMin, setUpdatedMin] = useState(0);

  useEffect(() => {
    setGreeting(timeGreeting());
    const profileFirst = getProfile().name?.trim().split(/\s+/)[0];
    setFirstName(profileFirst || currentUser.full_name.trim().split(/\s+/)[0] || null);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setUpdatedMin((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const onRefresh = () => { refreshCapacity(); setUpdatedMin(0); };

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}
      className="relative overflow-hidden rounded-2xl border border-foam p-5 shadow-glass sm:p-6"
      style={{ background: "linear-gradient(115deg, #fffdf9 0%, #f9efdd 58%, #f1e1c6 100%)" }}
    >
      {/* barely-there bean + steam wallpaper, same as the v7 banner */}
      <svg viewBox="0 0 200 160" aria-hidden className="pointer-events-none absolute -right-6 -top-10 h-[190%] opacity-[0.06]">
        <ellipse cx="130" cy="90" rx="52" ry="72" fill="var(--color-mocha)" transform="rotate(28 130 90)" />
        <path d="M105,32 Q140,90 152,148" stroke="var(--color-cream)" strokeWidth="7" fill="none" transform="rotate(28 130 90)" />
        <path d="M52 96 C 44 78, 62 72, 54 54 M76 90 C 68 74, 84 68, 76 50" stroke="var(--color-caramel)" strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>

      <div className="relative flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-[240px]">
          <div className={monoLabel}>Dashboard</div>
          <h1 className="mt-1 font-serif text-[26px] font-semibold leading-tight tracking-tight text-coffee">
            {greeting}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-mocha">{summary}</p>
          <Link href="/dashboard" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-mocha transition-colors hover:text-coffee">
            View current dashboard <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="flex flex-col items-start gap-2.5 sm:items-end">
          <div className="flex items-center gap-2">
            <span className={cn(monoLabel, "normal-case tracking-normal text-[11px]")}>
              {updatedMin === 0 ? "Updated just now" : `Updated ${updatedMin}m ago`}
            </span>
            <button type="button" onClick={onRefresh} aria-label="Refresh data"
              className="grid size-7 place-items-center rounded-full border border-foam bg-porcelain text-mocha shadow-glass transition-colors hover:border-latte hover:text-coffee">
              <RotateCcw className="size-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Date range" className="flex items-center rounded-full border border-foam bg-porcelain p-0.5 shadow-glass">
              {RANGES.map((r) => (
                <button key={r.key} type="button" onClick={() => setRange(r.key)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    range === r.key ? "bg-brand text-brand-foreground shadow-cta" : "text-mocha hover:text-coffee",
                  )}>
                  {r.label}
                </button>
              ))}
            </div>
            <Link href="/campaigns/quick" className={pillSolid}><Plus className="size-4" /> New campaign</Link>
            <Link href="/leads" className={pillOutline}><Upload className="size-4" /> Add leads</Link>
            <Link href="/voice-playground" className={pillOutline}><Mic className="size-4" /> Test call</Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ---------------- 2. resource hero (billing-model aware) ---------------- */

function ResourceHero({ model, credits }: { model: "subscription" | "metered" | "free"; credits: number }) {
  const reduce = useReducedMotion();
  // Always subscribe (hooks must be unconditional); identical to the topbar chip.
  const active = useSharedCapacity();

  const level =
    model === "subscription" ? active / CAPACITY
    : model === "metered" ? meteredPlan.minutesLeft / meteredPlan.planMinutes
    : credits / 50;

  const pct = Math.round((active / CAPACITY) * 100);
  const tone = level >= 1 ? "text-danger" : level >= HEALTHY_CEILING ? "text-warning" : "text-success";
  const barColor = level >= 1 ? "var(--color-danger)" : level >= HEALTHY_CEILING ? "var(--color-warning)" : undefined;

  const runway = meteredRunwayDays();
  const lowRunway = runway <= 7;

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.06, ease: EASE }}
      className="overflow-hidden rounded-2xl border border-foam shadow-glass"
      style={{ background: "linear-gradient(160deg, #fffdf9, #f9f0e1)" }}
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <div className="w-[104px] shrink-0"><CoffeeCup level={level} live /></div>

        {model === "subscription" && (
          <div className="min-w-0 flex-1">
            <div className={monoLabel}>Capacity</div>
            <div className="mt-1.5 flex items-end gap-2">
              <span className={cn("font-serif text-4xl font-semibold leading-none", monoData, tone)}>{active}</span>
              <span className="mb-0.5 text-sm text-muted-foreground">/ {CHANNELS} channels in use</span>
              <span className={cn("mb-0.5 ml-auto text-lg font-semibold", monoData, tone)}>{pct}%</span>
            </div>
            <div className="relative mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-foam">
              <div className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, pct)}%`, background: barColor ?? "linear-gradient(90deg,#6b4423,#b8763d)" }} />
              <div className="absolute top-0 h-full w-0.5 bg-coffee/40" style={{ left: `${HEALTHY_CEILING * 100}%` }} />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <LiveDot /> {CHANNELS - active} idle · live
            </div>
            <div className="mt-1 text-xs text-mocha">{subscriptionPlan.name} plan · flat fee</div>
          </div>
        )}

        {model === "metered" && (
          <>
            <div className="min-w-0 flex-1">
              <div className={monoLabel}>Minutes remaining</div>
              <div className="mt-1.5 flex items-end gap-2">
                <span className={cn("font-serif text-4xl font-semibold leading-none text-coffee", monoData)}>{meteredPlan.minutesLeft}</span>
                <span className="mb-0.5 text-sm text-muted-foreground">min remaining of {meteredPlan.planMinutes}</span>
              </div>
              <Meter pct={level * 100} color={lowRunway ? "var(--color-warning)" : undefined} className="mt-2.5 h-2.5" />
              <div className={cn("mt-2 text-xs", lowRunway ? "font-medium text-warning" : "text-muted-foreground")}>
                ≈{meteredPlan.avgDailyBurnMin} min/day — runs out in ~{runway} days
              </div>
              <div className="mt-1 text-xs text-mocha">Per-minute plan · ₹{meteredPlan.ratePerMin}/min</div>
            </div>
            <Link href="/plans" className={cn(pillSolid, "shrink-0 self-start sm:self-center")}>Top up</Link>
          </>
        )}

        {model === "free" && (
          <>
            <div className="min-w-0 flex-1">
              <div className={monoLabel}>Free credits</div>
              <div className="mt-1.5 flex items-end gap-2">
                <span className={cn("font-serif text-4xl font-semibold leading-none text-coffee", monoData)}>{credits}</span>
                <span className="mb-0.5 text-sm text-muted-foreground">of 50 free credits</span>
              </div>
              <Meter pct={level * 100} className="mt-2.5 h-2.5" />
              <div className="mt-2 text-xs text-muted-foreground">≈{(credits / 8).toFixed(1)} min of calling</div>
            </div>
            <Link href="/plans" className={cn(pillSolid, "shrink-0 self-start sm:self-center")}>Upgrade</Link>
          </>
        )}
      </div>

      {model !== "free" && (
        <footer className="flex flex-wrap items-center gap-2.5 border-t border-foam bg-cream/40 px-5 py-3">
          <span className={monoLabel}>Billing model — demo</span>
          <Chip active={model === "subscription"} onClick={() => setBillingModel("subscription")}>Flat fee · channels</Chip>
          <Chip active={model === "metered"} onClick={() => setBillingModel("metered")}>Per minute</Chip>
        </footer>
      )}
    </motion.section>
  );
}

/* ---------------- 3. KPI strip ---------------- */

function Kpi({ label, value, sub, spark, color, delta, invert, icon: Icon, href }: {
  label: string; value: string | number; sub: string; spark: number[];
  color: string; delta: number; invert?: boolean; icon: LucideIcon; href: string;
}) {
  return (
    <Link href={href}
      className="flex h-full flex-col rounded-2xl border border-foam bg-porcelain px-3.5 py-3 shadow-glass transition-shadow hover:shadow-glass-hover">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md"
            style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
            <Icon className="size-3" />
          </span>
          <span className="truncate text-xs text-muted-foreground">{label}</span>
        </div>
        <Delta v={delta} invert={invert} />
      </div>
      <div className="mt-2 flex items-end justify-between gap-1">
        <span className={cn("font-serif text-2xl font-semibold leading-none text-coffee", monoData)}>{value}</span>
        <MiniSpark data={spark} color={color} w={56} h={20} />
      </div>
      <div className="mt-auto pt-1.5 text-[11px] text-muted-foreground">{sub}</div>
    </Link>
  );
}

/* ---------------- 4b. needs attention ---------------- */

const attnIcon: Record<string, LucideIcon> = { handoff: PhoneForwarded, leads: Users, compliance: Ban };
const sevColor: Record<string, string> = { warning: "text-warning", danger: "text-danger" };

function AttentionCard() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = JSON.parse(sessionStorage.getItem("vb-attn-dismissed") || "[]");
      if (Array.isArray(raw)) setDismissed(raw.filter((v): v is string => typeof v === "string"));
    } catch { /* fresh session */ }
  }, []);

  const dismiss = (id: string) =>
    setDismissed((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try { sessionStorage.setItem("vb-attn-dismissed", JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });

  const open = attentionItems.filter((a) => !dismissed.includes(a.id));

  return (
    <SectionCard title="Needs attention" count={`${open.length} open`} className="flex h-full flex-col">
      {open.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-10 text-center">
          <CircleCheck className="size-6 text-success" />
          <p className="text-sm text-muted-foreground">Nothing needs you right now.</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-2 p-4">
          {open.map((a) => {
            const Icon = attnIcon[a.kind] ?? Ban;
            return (
              <li key={a.id} className="flex items-center gap-2.5 rounded-xl bg-oat/50 px-3 py-2">
                <Icon className={cn("size-4 shrink-0", sevColor[a.severity])} />
                <span className="flex-1 text-xs text-coffee">{a.text}</span>
                <Link href={a.href}
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-coffee px-2.5 py-1 text-[11px] font-medium text-cream transition-colors hover:bg-espresso">
                  {a.action} <ArrowRight className="size-2.5" />
                </Link>
                <button type="button" onClick={() => dismiss(a.id)} aria-label={`Dismiss: ${a.text}`}
                  className="shrink-0 rounded-full p-1 text-latte transition-colors hover:bg-foam/60 hover:text-coffee">
                  <X className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

/* ---------------- 4a. campaign performance ---------------- */

function CampaignCard() {
  return (
    <SectionCard title="Campaign performance" count={`${activeCampaigns.length} active`} className="flex h-full flex-col">
      {activeCampaigns.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">No campaigns are running right now.</p>
          <Link href="/campaigns/quick" className={pillSolid}><Plus className="size-4" /> New campaign</Link>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-foam/60">
            {activeCampaigns.map((c) => (
              <li key={c.id}>
                <Link href={`/campaigns/${c.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-oat/40">
                  <BeanDot color="var(--color-success)" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-coffee">{c.name}</span>
                      <Equalizer className="shrink-0" />
                      <span className={cn("ml-auto shrink-0 text-[11px] text-mocha", monoData)}>{c.slotsUsed}/{c.slotsCap} channels</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Meter pct={c.total_leads > 0 ? (c.leads_called / c.total_leads) * 100 : 0} className="flex-1" />
                      <span className={cn("shrink-0 text-[10px] text-latte", monoData)}>{c.leads_called}/{c.total_leads} leads</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className={cn("block font-serif text-lg font-semibold leading-none text-coffee", monoData)}>{Math.round(c.convPct)}%</span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">conv.</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {(bestCampaign || worstCampaign) && (
            <div className="flex flex-wrap gap-2 border-t border-foam/60 px-5 py-3">
              {bestCampaign && (
                <span className="inline-flex min-w-0 items-center rounded-full border border-success/25 bg-success/12 px-2.5 py-1 text-[11px] font-medium text-success">
                  <span className="truncate">Top: {bestCampaign.name} · {Math.round(bestCampaign.convPct)}%</span>
                </span>
              )}
              {worstCampaign && (
                <span className="inline-flex min-w-0 items-center rounded-full border border-warning/25 bg-warning/12 px-2.5 py-1 text-[11px] font-medium text-warning">
                  <span className="truncate">Lowest: {worstCampaign.name} · {Math.round(worstCampaign.convPct)}%</span>
                </span>
              )}
            </div>
          )}
        </>
      )}
      <FooterLink href="/v7/campaigns">All campaigns</FooterLink>
    </SectionCard>
  );
}

/* ---------------- 7. freemium first-run ---------------- */

function FirstRunPanel({ testCallDone }: { testCallDone: boolean }) {
  const reduce = useReducedMotion();
  // No "verify your number" step: calling numbers are provisioned and managed
  // by the platform, so there is nothing for the customer to verify.
  const steps = [
    { n: 1, title: "Make a test call", desc: "We'll call your phone so you can hear your agent live before any lead does.", href: "/voice-playground", done: testCallDone },
    { n: 2, title: "Create your first campaign", desc: "Pick an agent, set the goal and start calling.", href: "/campaigns/quick", done: false },
    { n: 3, title: "Add your leads", desc: "Upload a CSV or add them one by one.", href: "/leads", done: false },
  ];
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
      <SectionCard title="Get set up" count={`${steps.filter((s) => s.done).length} of ${steps.length} done`}>
        <div className="space-y-2.5 p-4 sm:p-5">
          <div className="flex items-center gap-2.5 rounded-xl bg-oat/50 px-4 py-2.5 text-xs text-mocha">
            <CircleCheck className="size-4 shrink-0 text-success" />
            Your calling number is ready — we provision and manage carrier-verified numbers for you, nothing to set up.
          </div>
          {steps.map((s) => (
            <Link key={s.n} href={s.href}
              className="flex items-center gap-4 rounded-xl border border-foam bg-cream/40 px-4 py-3.5 transition-colors hover:border-latte hover:bg-oat/40">
              <span className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full font-serif text-sm font-semibold",
                s.done ? "bg-caramel text-porcelain" : "border border-foam bg-porcelain text-mocha",
              )}>
                {s.done ? <Check className="size-4" /> : s.n}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-sm font-medium", s.done ? "text-mocha line-through decoration-latte" : "text-coffee")}>{s.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{s.desc}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-latte" />
            </Link>
          ))}
          <p className="px-1 pt-1 text-xs text-muted-foreground">Your dashboard fills in after your first call — no sample data here.</p>
        </div>
      </SectionCard>
    </motion.div>
  );
}

/* ---------------- the page ---------------- */

const actIcon: Record<string, LucideIcon> = {
  call: Phone, convert: Sparkles, handoff: PhoneForwarded, dnc: Ban, campaign: Megaphone,
};

export function V7Dashboard() {
  const { model } = useBillingModel();
  const [range, setRange] = useState<RangeKey>(1);
  const m = useMemo(() => rangeMetrics(range), [range]);
  // Sparks need a trend line even on "Today" (a 1-point series is just a dot):
  // use the 7-day window for context — its last point IS today's value, so the
  // spark always ends on the number shown.
  const sparkSrc = useMemo(() => (range === 1 ? rangeMetrics(7).s : m.s), [range, m]);

  // Freemium state (localStorage/sessionStorage → effect for SSR safety).
  const [credits, setCredits] = useState(0);
  const [ledgerCount, setLedgerCount] = useState<number | null>(null);
  const [testCallDone, setTestCallDone] = useState(false);
  useEffect(() => {
    const sync = () => {
      setCredits(getCredits());
      setLedgerCount(getLedger().length);
      try { setTestCallDone(!!sessionStorage.getItem("vb-poured")); } catch { /* private mode */ }
    };
    sync();
    window.addEventListener("vb-credits-change", sync);
    return () => window.removeEventListener("vb-credits-change", sync);
  }, []);

  // Deterministic initial (noon) so SSR + hydration agree; real clock after mount.
  const [comp, setComp] = useState(() => complianceSnapshot(new Date("2026-01-01T12:00:00")));
  useEffect(() => { setComp(complianceSnapshot()); }, []);

  const firstRun = model === "free" && ledgerCount !== null && ledgerCount <= 1;

  const goalCurrent = weeklyGoal.current;
  const goalHit = goalCurrent >= weeklyGoal.target;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {/* 1 — header band */}
      <Header range={range} setRange={setRange}
        summary={firstRun ? (
          <>No calls yet — your metrics appear here after your first call.</>
        ) : (
          <>
            <span className="font-semibold text-coffee">{m.calls}</span> calls ·{" "}
            <span className="font-semibold text-coffee">{m.connected}</span> connected ·{" "}
            <span className="font-semibold text-coffee">{m.conversions}</span> conversions — {RANGE_LABEL[range]}
          </>
        )} />

      {/* 2 — resource hero */}
      <ResourceHero model={model} credits={credits} />

      {firstRun ? (
        /* 7 — freemium first-run replaces the metric sections */
        <FirstRunPanel testCallDone={testCallDone} />
      ) : (
        <>
          {/* 3 — KPI strip */}
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <StaggerItem><Kpi label="Calls" value={m.calls} sub={RANGE_LABEL[range].toLowerCase()} spark={sparkSrc.calls}
              color="var(--color-caramel)" delta={dayDelta(sparkSrc.calls)} icon={Phone} href="/calls" /></StaggerItem>
            <StaggerItem><Kpi label="Connected" value={m.connected} sub={`${Math.round(m.connectRate * 100)}% connect rate`} spark={sparkSrc.connected}
              color="var(--color-success)" delta={dayDelta(sparkSrc.connected)} icon={PhoneCall} href="/calls" /></StaggerItem>
            <StaggerItem><Kpi label="Conversions" value={m.conversions} sub={`${Math.round(m.convRate * 100)}% of connected`} spark={sparkSrc.conversions}
              color="var(--color-info)" delta={dayDelta(sparkSrc.conversions)} icon={Sparkles} href="/leads" /></StaggerItem>
            <StaggerItem><Kpi label="Avg duration" value={formatDuration(m.avgDurationSec)} sub="per call" spark={sparkSrc.avgDuration}
              color="var(--color-mocha)" delta={dayDelta(sparkSrc.avgDuration)} icon={Clock} href="/analytics" /></StaggerItem>
            <StaggerItem><Kpi label="Not connected" value={m.notConnected} sub="needs retry" spark={sparkSrc.notConnected}
              color="var(--color-danger)" delta={dayDelta(sparkSrc.notConnected)} invert icon={PhoneOff} href="/calls" /></StaggerItem>
            <StaggerItem><Kpi label="Cost" value={formatINR(m.cost)}
              sub={m.costPerConversion ? `${formatINR(m.costPerConversion)} / conversion` : "no conversions yet"} spark={sparkSrc.cost}
              color="var(--color-latte)" delta={dayDelta(sparkSrc.cost)} invert icon={IndianRupee} href="/settings/billing" /></StaggerItem>
          </StaggerGrid>

          {/* 4 — campaigns · attention · outcome mix */}
          <StaggerGrid className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <StaggerItem><CampaignCard /></StaggerItem>
            <StaggerItem><AttentionCard /></StaggerItem>
            <StaggerItem>
              <SectionCard title="Outcome mix" className="flex h-full flex-col">
                <div className="flex flex-1 items-center justify-center px-5 py-4">
                  <Donut data={m.outcomeMix} size={124} thickness={15} centerLabel={RANGE_LABEL[range].toLowerCase()} />
                </div>
                <FooterLink href="/calls">View call log</FooterLink>
              </SectionCard>
            </StaggerItem>
          </StaggerGrid>

          {/* 5 — compliance · agent quality · weekly goal */}
          <StaggerGrid className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <StaggerItem>
              <SectionCard title="Compliance" className="flex h-full flex-col">
                <div className="flex-1 space-y-3.5 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 shrink-0 rounded-full", comp.windowOpen ? "bg-success" : "bg-danger")} />
                    <span className="text-sm font-medium text-coffee">{comp.windowOpen ? "Calling window open" : "Calling window closed"}</span>
                    <span className={cn("ml-auto text-[11px] text-mocha", monoData)}>{comp.windowLabel}</span>
                  </div>
                  <dl className="space-y-2">
                    {([
                      ["DNC scrubbed today", comp.dncScrubbedToday],
                      ["Blocked", comp.dncBlockedToday],
                      ["Consent coverage", `${Math.round(comp.consentCoverage * 100)}%`],
                    ] as const).map(([label, value]) => (
                      <div key={label} className="flex items-baseline justify-between gap-3">
                        <dt className={monoLabel}>{label}</dt>
                        <dd className={cn("text-sm font-medium text-coffee", monoData)}>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <FooterLink href="/compliance">Compliance centre</FooterLink>
              </SectionCard>
            </StaggerItem>

            <StaggerItem>
              <SectionCard title="Agent quality" className="flex h-full flex-col">
                <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-4">
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex items-end gap-1">
                      <span className={cn("font-serif text-4xl font-semibold leading-none text-coffee", monoData)}>{agentQuality.score}</span>
                      <span className="mb-0.5 text-sm text-muted-foreground">/100</span>
                    </div>
                    <MiniSpark data={agentQuality.trend} color="var(--color-steam)" w={88} h={28} />
                  </div>
                  <p className="text-xs text-muted-foreground">Average across campaigns — last 14 days</p>
                </div>
                <FooterLink href="/analytics">Analytics</FooterLink>
              </SectionCard>
            </StaggerItem>

            <StaggerItem>
              <SectionCard title="Weekly goal" className="flex h-full flex-col">
                <div className="flex flex-1 flex-col justify-center gap-2.5 px-5 py-4">
                  <div className="flex items-end gap-1.5">
                    <span className={cn("font-serif text-4xl font-semibold leading-none text-coffee", monoData)}>{goalCurrent}</span>
                    <span className="mb-0.5 text-sm text-muted-foreground">of {weeklyGoal.target}</span>
                  </div>
                  <Meter pct={Math.min(100, (goalCurrent / weeklyGoal.target) * 100)} color={goalHit ? "var(--color-success)" : undefined} />
                  <p className="text-xs text-muted-foreground">{weeklyGoal.label}</p>
                  {goalHit && <p className="text-xs font-medium text-success">Target hit 🎉</p>}
                </div>
              </SectionCard>
            </StaggerItem>
          </StaggerGrid>

          {/* 6 — call volume · recent activity */}
          <StaggerGrid className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            <StaggerItem>
              <SectionCard title={`Call volume — ${RANGE_LABEL[range]}`} count={range === 1 ? "7-day context" : undefined} className="flex h-full flex-col">
                <div className="flex-1 px-5 py-4">
                  <AreaChart
                    height={96}
                    data={timeSeries.slice(-Math.max(7, range))}
                    series={[
                      { key: "calls", label: "Started", color: "var(--color-caramel)" },
                      { key: "completed", label: "Connected", color: "var(--color-success)" },
                    ]}
                  />
                </div>
              </SectionCard>
            </StaggerItem>

            <StaggerItem>
              <SectionCard title="Recent activity" aside={<LiveDot />} className="flex h-full flex-col">
                <ul className="flex-1 divide-y divide-foam/60">
                  {activityFeed.map((e) => {
                    const Icon = actIcon[e.kind] ?? Phone;
                    return (
                      <li key={e.id}>
                        <Link href={e.href} className="flex items-center gap-2.5 px-5 py-2.5 transition-colors hover:bg-oat/40">
                          <Icon className="size-3.5 shrink-0 text-mocha" />
                          <span className="min-w-0 flex-1 truncate text-xs text-coffee">{e.text}</span>
                          <span className={cn("shrink-0 text-[10px] text-latte", monoData)}>{agoLabel(e.agoMin)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </SectionCard>
            </StaggerItem>
          </StaggerGrid>
        </>
      )}
    </div>
  );
}
