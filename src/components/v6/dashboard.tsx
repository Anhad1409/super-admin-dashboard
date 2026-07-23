"use client";

import Link from "next/link";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  PhoneForwarded, Users, Ban, ArrowRight, ArrowLeftRight, ArrowUpRight, ArrowDownRight,
  Phone, PhoneCall, Sparkles, Clock, PhoneOff, IndianRupee, RotateCcw,
  ChevronRight, ChevronLeft, Flame, Thermometer, Snowflake,
} from "lucide-react";
import { CoffeeCup } from "@/components/coffee/coffee-cup";
import { CupGlyph } from "@/components/coffee/cup-glyph";
import { LiveDot, BeanDot } from "@/components/coffee/bean-dot";
import { AreaChart } from "@/components/ui-bits/area-chart";
import { Donut } from "@/components/ui-bits/donut";
import { MiniSpark } from "@/components/ui-bits/mini-spark";
import { HelpHint } from "@/components/ui-bits/help-hint";
import { Tour, type TourStep } from "@/components/onboarding/tour";
import { useLiveCapacity } from "@/lib/use-live-capacity";
import { cn } from "@/lib/utils";
import {
  CHANNELS, SLOTS_PER_CHANNEL, CAPACITY, HEALTHY_CEILING, baselineActive,
  connectRate, conversionsToday, liveCampaigns, attention, outcomeMix, type LiveCampaign,
} from "@/lib/channel-mock";
import { overviewStats, timeSeries } from "@/lib/data";
import { formatDuration, formatINR } from "@/lib/format";

const card = "rounded-2xl border border-foam bg-porcelain/95 p-3.5 shadow-glass";

const TOUR: TourStep[] = [
  { sel: '[data-tour="nav"]', title: "Navigate anywhere", body: "Move between Operate, Analyze, AI Studio and Admin. Press ⌘K (Ctrl K on Windows) for instant search." },
  { sel: '[data-tour="capacity"]', title: "Your live capacity", body: "This cup shows call-slots in use vs your purchased channels — keep it under 85% for spike headroom." },
  { sel: '[data-tour="kpis"]', title: "Today at a glance", body: "Key metrics with trends. Click any card to flip it and dive into the detail." },
  { sel: '[data-tour="attention"]', title: "What needs you", body: "Handoffs, low-lead campaigns and compliance flags surface here with quick actions." },
  { sel: '[data-tour="bell"]', title: "Stay in the loop", body: "Real-time alerts land in your notification centre. That's the tour — enjoy your coffee!" },
];
const sevColor: Record<string, string> = { info: "text-info", warning: "text-warning", danger: "text-danger" };
const kindIcon = { handoff: PhoneForwarded, leads: Users, compliance: Ban };

function Delta({ v }: { v: number }) {
  if (!v) return <span className="text-[11px] text-muted-foreground">—</span>;
  const up = v > 0;
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-medium ${up ? "text-success" : "text-danger"}`}>
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{Math.abs(v)}
    </span>
  );
}

function Kpi({ label, value, sub, spark, color, delta, icon: Icon, details, href }: {
  label: string; value: string | number; sub: string; spark: number[]; color: string; delta: number; icon: LucideIcon; details: { label: string; value: string }[]; href: string;
}) {
  const [flip, setFlip] = useState(false);
  return (
    <div className="h-[104px] [perspective:900px]">
      <div className={cn("relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none", flip && "[transform:rotateY(180deg)]")}>
        {/* front */}
        <button type="button" onClick={() => setFlip(true)} title="Click for details"
          className="absolute inset-0 flex cursor-pointer flex-col overflow-hidden rounded-xl border border-foam bg-porcelain px-3 py-2.5 text-left [backface-visibility:hidden] hover:shadow-glass-hover">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex size-5 items-center justify-center rounded-md" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}><Icon className="size-3" /></span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <Delta v={delta} />
          </div>
          <div className="mt-0.5 flex items-end justify-between gap-1">
            <span className="font-serif text-2xl font-semibold leading-none text-coffee tabular-nums">{value}</span>
            <MiniSpark data={spark} color={color} />
          </div>
          <div className="mt-auto text-[11px] text-muted-foreground">{sub}</div>
        </button>
        {/* back */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-xl border px-3 py-2 [transform:rotateY(180deg)] [backface-visibility:hidden]"
          style={{ borderColor: color, background: `color-mix(in srgb, ${color} 9%, var(--color-porcelain))` }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-coffee">{label}</span>
            <button onClick={() => setFlip(false)} aria-label="Flip back" className="text-muted-foreground hover:text-coffee"><RotateCcw className="size-3" /></button>
          </div>
          <div className="mt-1 flex-1 space-y-0.5">
            {details.map((d) => (
              <div key={d.label} className="flex items-center justify-between gap-2 text-[10.5px] leading-tight">
                <span className="truncate text-muted-foreground">{d.label}</span>
                <span className="shrink-0 font-medium tabular-nums text-coffee">{d.value}</span>
              </div>
            ))}
          </div>
          <Link href={href} className="inline-flex items-center gap-1 text-[10.5px] font-semibold" style={{ color }}>View details <ArrowRight className="size-3" /></Link>
        </div>
      </div>
    </div>
  );
}

function LiveCampaignsFlip() {
  const [sel, setSel] = useState<LiveCampaign | null>(null);
  return (
    <div className="[perspective:1200px]">
      <div className={cn("relative h-[168px] w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none", sel && "[transform:rotateY(180deg)]")}>
        {/* front: campaign list */}
        <ul className="absolute inset-0 space-y-1 [backface-visibility:hidden]">
          {liveCampaigns.map((c) => {
            const running = c.status === "running";
            const fill = c.slotsCap ? (c.slotsUsed / c.slotsCap) * 100 : 0;
            return (
              <li key={c.id}>
                <button onClick={() => setSel(c)} className="flex w-full items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-left transition-colors hover:bg-oat/50">
                  <BeanDot color={running ? "var(--color-caramel)" : "var(--color-latte)"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5"><span className="truncate text-sm font-medium text-coffee">{c.name}</span>{running && <LiveDot />}</div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${fill}%` }} /></div>
                  </div>
                  <div className="text-right text-xs"><div className="font-medium tabular-nums text-coffee">{c.slotsUsed}/{c.slotsCap}</div><div className="capitalize text-muted-foreground">{c.status}</div></div>
                  <ChevronRight className="size-4 shrink-0 text-latte" />
                </button>
              </li>
            );
          })}
        </ul>
        {/* back: selected campaign detail */}
        <div className="absolute inset-0 flex flex-col [transform:rotateY(180deg)] [backface-visibility:hidden]">
          {sel && (
            <>
              <div className="mb-2 flex items-center gap-2">
                <button onClick={() => setSel(null)} className="flex items-center gap-1 text-xs font-medium text-mocha hover:text-coffee"><ChevronLeft className="size-4" /> Back</button>
                <span className="ml-auto truncate text-sm font-semibold text-coffee">{sel.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([["Hot", sel.hot, Flame, "var(--color-warning)"], ["Warm", sel.warm, Thermometer, "var(--color-caramel)"], ["Cold", sel.cold, Snowflake, "var(--color-info)"]] as const).map(([lbl, val, Ic, col]) => (
                  <div key={lbl} className="rounded-xl bg-oat/50 p-2 text-center">
                    <Ic className="mx-auto size-4" style={{ color: col }} />
                    <div className="mt-1 font-serif text-xl font-semibold text-coffee tabular-nums">{val}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{lbl}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Reached</span><span className="font-medium text-coffee">{sel.reached} / {sel.total}</span></div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-success to-matcha" style={{ width: `${sel.total ? (sel.reached / sel.total) * 100 : 0}%` }} /></div>
              </div>
              <Link href="/campaigns" className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-caramel">View full campaign <ArrowRight className="size-3" /></Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ title, dot, help }: { title: string; dot: string; help: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full" style={{ background: dot }} />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-mocha">{title}</h2>
      </div>
      <HelpHint text={help} side="left" />
    </div>
  );
}

export function V6Dashboard() {
  const active = useLiveCapacity(baselineActive);
  const o = overviewStats;
  const level = active / CAPACITY;
  const pct = Math.round(level * 100);
  const engaged = Math.min(CHANNELS, Math.ceil(active / SLOTS_PER_CHANNEL));
  const idle = CHANNELS - engaged;
  const tone = level >= 1 ? "text-danger" : level >= HEALTHY_CEILING ? "text-warning" : "text-success";
  const barColor = level >= 1 ? "var(--color-danger)" : level >= HEALTHY_CEILING ? "var(--color-warning)" : undefined;

  const callsS = timeSeries.map((p) => p.calls);
  const compS = timeSeries.map((p) => p.completed);
  const d = (a: number[]) => (a.length > 1 ? a[a.length - 1] - a[a.length - 2] : 0);

  return (
    <div className="mx-auto max-w-7xl space-y-3">
      {/* warm welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-foam p-3"
        style={{ background: "linear-gradient(110deg, #fff6e6 0%, #f7ead2 48%, #efddc0 100%)" }}>
        <svg className="pointer-events-none absolute -right-2 -top-6 h-32 w-64 opacity-[0.13]" viewBox="0 0 240 130" aria-hidden>
          <g stroke="var(--color-mocha)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6">
            <path d="M150,34 q-7,-11 0,-22" /><path d="M168,34 q7,-11 0,-22" /><path d="M186,34 q-6,-10 0,-20" />
          </g>
          <ellipse cx="60" cy="96" rx="20" ry="27" fill="var(--color-mocha)" transform="rotate(28 60 96)" />
          <ellipse cx="92" cy="104" rx="20" ry="27" fill="var(--color-caramel)" transform="rotate(-12 92 104)" />
        </svg>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-coffee">
              Good morning, Arnika <CupGlyph className="size-6" />
            </h1>
            <p className="mt-0.5 text-sm text-mocha">
              <span className="font-semibold text-coffee">{active}/{CAPACITY}</span> slots brewing ·
              <span className="font-semibold text-coffee"> {o.total_calls}</span> calls today ·
              <span className="font-semibold text-coffee"> {conversionsToday}</span> activations
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => window.dispatchEvent(new CustomEvent("start-tour"))} className="inline-flex items-center gap-1.5 rounded-full bg-coffee px-3 py-1 text-xs font-medium text-cream hover:bg-espresso">
              Take a tour
            </button>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-full border border-latte/50 bg-porcelain/70 px-3 py-1 text-xs font-medium text-mocha hover:bg-porcelain">
              <ArrowLeftRight className="size-3.5" /> see original
            </Link>
          </div>
        </div>
      </section>

      {/* Row A: capacity hero + KPI strip */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <section data-tour="capacity" className={`${card} lg:col-span-2`} style={{ background: "linear-gradient(160deg, #fffdf9, #f9f0e1)" }}>
          <SectionHead title="Capacity now" dot="var(--color-success)" help="Live call-slots in use vs your purchased channel capacity. 1 channel = up to 3 concurrent calls; healthy stays under 85% for spike headroom." />
          <div className="flex items-center gap-4">
            <div className="w-[92px] shrink-0"><CoffeeCup level={level} live /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-end gap-2">
                <span className={`font-serif text-4xl font-semibold leading-none ${tone}`}>{active}</span>
                <span className="mb-0.5 text-sm text-muted-foreground">/ {CAPACITY} slots</span>
                <span className={`mb-0.5 ml-auto text-lg font-semibold ${tone}`}>{pct}%</span>
              </div>
              <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-foam">
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min(100, pct)}%`, background: barColor ?? "linear-gradient(90deg,#6b4423,#b8763d)" }} />
                <div className="absolute top-0 h-full w-0.5 bg-coffee/40" style={{ left: `${HEALTHY_CEILING * 100}%` }} />
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[11px]">
                <LiveDot /><span className="text-muted-foreground">{engaged}/{CHANNELS} channels · {idle} idle · live</span>
              </div>
            </div>
          </div>
        </section>

        <section data-tour="kpis" className="lg:col-span-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Kpi label="Total Calls" value={o.total_calls} sub="today" spark={callsS} color="var(--color-caramel)" delta={d(callsS)} icon={Phone} href="/calls"
              details={[{ label: "vs yesterday", value: "+12" }, { label: "Peak hour · 11am", value: "31" }, { label: "Top · Outreach", value: "44" }]} />
            <Kpi label="Connected" value={o.calls_completed} sub={`${Math.round(connectRate * 100)}% connect`} spark={compS} color="var(--color-success)" delta={d(compS)} icon={PhoneCall} href="/calls"
              details={[{ label: "Connect rate", value: `${Math.round(connectRate * 100)}%` }, { label: "Best · EMI Rem.", value: "68%" }, { label: "Avg ring", value: "6s" }]} />
            <Kpi label="Activations" value={conversionsToday} sub="conversions today" spark={[3, 5, 4, 7, 6, 9, conversionsToday]} color="var(--color-info)" delta={3} icon={Sparkles} href="/leads"
              details={[{ label: "Conv. rate", value: "18%" }, { label: "Top · EMI Rem.", value: "7" }, { label: "Hot leads", value: "27" }]} />
            <Kpi label="Avg Duration" value={formatDuration(o.avg_call_duration)} sub="per call" spark={timeSeries.map((p) => p.avg_duration)} color="var(--color-mocha)" delta={0} icon={Clock} href="/analytics"
              details={[{ label: "Longest", value: "3m 21s" }, { label: "Shortest", value: "0m 15s" }, { label: "Talk ratio", value: "62%" }]} />
            <Kpi label="Failed" value={o.calls_failed} sub="needs retry" spark={[8, 6, 9, 5, 7, 4, o.calls_failed % 12]} color="var(--color-danger)" delta={-2} icon={PhoneOff} href="/calls"
              details={[{ label: "Not answered", value: "14" }, { label: "Busy", value: "8" }, { label: "Queued retry", value: "22" }]} />
            <Kpi label="Cost (admin)" value={formatINR(o.total_cost)} sub="spend today" spark={timeSeries.map((p) => p.cost)} color="var(--color-latte)" delta={0} icon={IndianRupee} href="/settings/billing"
              details={[{ label: "This week", value: "₹2,410" }, { label: "Avg / campaign", value: "₹108" }, { label: "Channels", value: "10" }]} />
          </div>
        </section>
      </div>

      {/* Row B */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section className={card}>
          <SectionHead title="Live campaigns" dot="var(--color-caramel)" help="Campaigns dialing now. Click any campaign to flip to its lead breakdown (hot/warm/cold) and reach." />
          <LiveCampaignsFlip />
        </section>

        <section data-tour="attention" className={card}>
          <SectionHead title="Needs attention" dot="var(--color-warning)" help="Things that need a human: handoff requests from agents, campaigns low on leads, and compliance/DNC flags." />
          <ul className="space-y-2">
            {attention.map((a) => {
              const Icon = kindIcon[a.kind as keyof typeof kindIcon] ?? Ban;
              return (
                <li key={a.id} className="flex items-center gap-2.5 rounded-xl bg-oat/50 px-3 py-2">
                  <Icon className={`size-4 shrink-0 ${sevColor[a.severity]}`} />
                  <span className="flex-1 text-xs text-coffee">{a.text}</span>
                  <button className="inline-flex items-center gap-0.5 rounded-full bg-coffee px-2 py-0.5 text-[11px] font-medium text-cream hover:bg-espresso">{a.action} <ArrowRight className="size-2.5" /></button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={card}>
          <SectionHead title="Outcome mix" dot="var(--color-info)" help="How today's connected calls ended — reached, callback scheduled, dropped, or failed." />
          <Donut data={outcomeMix} size={118} thickness={15} />
        </section>
      </div>

      {/* Row C */}
      <section className={card}>
        <SectionHead title="Calls in flight — last 14 days" dot="var(--color-mocha)" help="Calls started vs connected per day. Hover any point for the daily breakdown." />
        <AreaChart
          height={80}
          data={timeSeries}
          series={[
            { key: "calls", label: "Started", color: "var(--color-caramel)" },
            { key: "completed", label: "Connected", color: "var(--color-success)" },
          ]}
        />
      </section>

      <Tour steps={TOUR} />
    </div>
  );
}
