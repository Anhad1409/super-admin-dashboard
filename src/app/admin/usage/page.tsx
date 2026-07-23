"use client";

/* /admin/usage — platform-wide telephony & AI usage: calls, minutes,
   connect trends, provider health, and the heaviest clients. */

import { PhoneCall, Clock3, Radio, Gauge, ArrowUpRight } from "lucide-react";
import { CpHeader, StatTile, Card, Tag, mono, monoLabel } from "@/components/admin/cp";
import { clients, platform, PLAN_META } from "@/lib/clients-mock";
import { services, HEALTH_META } from "@/lib/admin-mock";
import { companyDetail, listDetail } from "@/lib/metric-details";

export default function UsagePage() {
  // platform-wide 14-day volume = sum of client sparks
  const series = Array.from({ length: 14 }, (_, i) => clients.reduce((s, c) => s + (c.spark[i] || 0), 0));
  const max = Math.max(...series, 1);
  const top = [...clients].filter((c) => c.callsMonth > 0).sort((a, b) => b.callsMonth - a.callsMonth).slice(0, 6);
  const topMax = top[0]?.callsMonth || 1;
  const telephony = services.filter((s) => ["Voice gateway", "Speech-to-text", "Text-to-speech", "Language model", "Call orchestration"].includes(s.name));

  const callsDetail = companyDetail({
    title: "Calls this month",
    value: platform.callsMonth.toLocaleString("en-IN"),
    description: "Every call the platform placed this calendar month, bifurcated by company — heaviest dialers first.",
    of: (c) => c.callsMonth,
    sub: (c) => PLAN_META[c.plan].label,
    flag: (c) => c.status === "past_due",
    note: "Past-due accounts are flagged — their dialing continues until suspension.",
    links: [{ label: "All clients", href: "/admin/clients" }],
  });
  const minutesDetail = companyDetail({
    title: "Minutes this month",
    value: `${(platform.minutesMonth / 1000).toFixed(0)}k`,
    description: "Talk time consumed per company this month — billing follows minutes, not call count.",
    of: (c) => c.minutesMonth,
    sub: (c) => (c.callsMonth > 0 ? `${(c.minutesMonth / c.callsMonth).toFixed(1)} min / call` : undefined),
    flag: (c) => c.status === "past_due",
  });
  const connectDetail = companyDetail({
    title: "Avg connect rate",
    value: `${platform.avgConnect}%`,
    description: "Answered vs dialed per company — the headline number is a straight average across live clients.",
    of: (c) => c.connectPct,
    fmt: (n) => `${n}%`,
    sub: (c) => `${c.callsMonth.toLocaleString("en-IN")} calls`,
    flag: (c) => c.connectPct < 55,
    note: "Below 55% usually means stale number lists or DND-heavy segments — flagged rows need list hygiene.",
  });
  const channelsDetail = listDetail(
    "Channels live now",
    "7 / 10",
    "Concurrent call capacity across the telephony pool — each channel carries one live call.",
    "Channel pool",
    [
      { name: "In use", value: "7", pct: 7, tint: "var(--color-mango)", sub: "carrying live calls" },
      { name: "Free headroom", value: "3", pct: 3, tint: "var(--color-steam)", sub: "ready to dial" },
    ],
    undefined,
    "Peak this week hit 9 / 10 during the 11:00–13:00 dial window — consider adding channels before festive campaigns.",
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Usage & telephony" subtitle="Every call the platform placed — volume, connect rate and the provider stack behind it." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={PhoneCall} label="Calls this month" value={platform.callsMonth.toLocaleString("en-IN")} sub="across all clients" tint="var(--color-mango)" delta="+8.1%" detail={callsDetail} />
        <StatTile icon={Clock3} label="Minutes this month" value={`${(platform.minutesMonth / 1000).toFixed(0)}k`} sub="≈ 6,100 hrs of talk time" tint="var(--color-caramel)" detail={minutesDetail} />
        <StatTile icon={Gauge} label="Avg connect rate" value={`${platform.avgConnect}%`} sub="answered / dialed" tint="var(--color-steam)" detail={connectDetail} />
        <StatTile icon={Radio} label="Channels live now" value="7 / 10" sub="concurrent call capacity" tint="var(--color-blueberry)" detail={channelsDetail} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card title="Platform call volume" right={<span className={`${mono} text-[11px] text-latte`}>last 14 days</span>}>
          <div className="mt-1 flex h-44 items-end gap-1.5">
            {series.map((v, i) => (
              <div key={i} className="group relative flex-1">
                <div className="w-full rounded-t-md bg-gradient-to-t from-mocha to-caramel" style={{ height: `${(v / max) * 160}px` }} />
                <span className={`${mono} pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-espresso px-1.5 py-0.5 text-[9px] text-cream opacity-0 transition-opacity group-hover:opacity-100`}>{v.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between"><span className={`${mono} text-[10px] text-latte`}>14d ago</span><span className={`${mono} text-[10px] text-latte`}>today</span></div>
        </Card>

        <Card title="Provider stack">
          <div className="space-y-2.5">
            {telephony.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-coffee">{s.name}</div>
                  <div className={`${mono} truncate text-[10px] uppercase tracking-wide text-latte`}>{s.kind}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="text-[12px] text-mocha tabular-nums">{s.latencyMs}ms</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: HEALTH_META[s.status].tint }}>
                    <span className="size-2 rounded-full" style={{ background: HEALTH_META[s.status].tint }} /> {s.uptime}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Heaviest clients by volume">
        <div className="space-y-3">
          {top.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-[13px] font-medium text-coffee">{c.name}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foam">
                <div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${(c.callsMonth / topMax) * 100}%` }} />
              </div>
              <span className="w-16 shrink-0 text-right text-[12.5px] text-mocha tabular-nums">{(c.callsMonth / 1000).toFixed(1)}k</span>
              <span className="w-12 shrink-0 text-right text-[12px] text-latte tabular-nums">{c.connectPct}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
