"use client";

/* /admin/geography — where the platform's calls come from: clients and call
   volume broken down by Indian state. */

import { MapPin, Building2, PhoneCall } from "lucide-react";
import { CpHeader, StatTile, Card, mono } from "@/components/admin/cp";
import { geography, stateOf } from "@/lib/admin-analytics";
import { clients, platform, PLAN_META } from "@/lib/clients-mock";
import { companyDetail, listDetail } from "@/lib/metric-details";

export default function GeographyPage() {
  const maxCalls = Math.max(...geography.map((g) => g.calls), 1);
  const topState = geography[0];

  const statesDetail = listDetail(
    "States live",
    String(geography.length),
    "Every Indian state with at least one live client organisation, ranked by the call volume it generates.",
    "By state",
    geography.map((g, i) => ({
      name: g.state,
      value: `${(g.calls / 1000).toFixed(1)}k calls`,
      pct: g.calls,
      tint: i === 0 ? "var(--color-mango)" : "var(--color-caramel)",
      sub: `${g.clients} client${g.clients > 1 ? "s" : ""} · ${Math.round((g.calls / platform.callsMonth) * 100)}% share`,
      flag: g.clients === 1,
    })),
    [{ label: "All clients", href: "/admin/clients" }],
    "Single-client states are flagged — their entire volume rests on one account.",
  );
  const topRegionDetail = companyDetail({
    title: "Top region",
    value: topState.state,
    description: `${topState.state} leads the map — ${topState.clients} client organisations generating ${Math.round((topState.calls / platform.callsMonth) * 100)}% of platform call volume this month.`,
    of: (c) => c.callsMonth,
    pool: clients.filter((c) => c.status !== "churned" && stateOf(c.id) === topState.state),
    fmt: (n) => `${n.toLocaleString("en-IN")} calls`,
    sub: (c) => PLAN_META[c.plan].label,
    flag: (c) => c.status === "past_due",
    label: `Companies in ${topState.state}`,
    links: [{ label: "All clients", href: "/admin/clients" }],
  });
  const callsDetail = companyDetail({
    title: "Calls this month",
    value: platform.callsMonth.toLocaleString("en-IN"),
    description: "Every call the platform placed this calendar month, bifurcated by company — each row links to the client page.",
    of: (c) => c.callsMonth,
    sub: (c) => `${stateOf(c.id)} · ${PLAN_META[c.plan].label}`,
    flag: (c) => c.status === "past_due",
    note: "Past-due accounts are flagged — their dialing continues until suspension.",
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Geography" subtitle="Clients and call volume by state — where demand concentrates across India." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={MapPin} label="States live" value={geography.length} sub="across India" tint="var(--color-steam)" detail={statesDetail} />
        <StatTile icon={Building2} label="Top region" value={topState.state} sub={`${topState.clients} clients · ${(topState.calls / 1000).toFixed(0)}k calls`} tint="var(--color-caramel)" detail={topRegionDetail} />
        <StatTile icon={PhoneCall} label="Calls this month" value={platform.callsMonth.toLocaleString("en-IN")} sub="platform-wide" tint="var(--color-mango)" detail={callsDetail} />
      </div>

      <Card title="Call volume by state">
        <div className="space-y-3">
          {geography.map((g) => (
            <div key={g.state} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-[13px] font-medium text-coffee">{g.state}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-foam">
                <div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${(g.calls / maxCalls) * 100}%` }} />
              </div>
              <span className="w-16 shrink-0 text-right text-[12.5px] text-mocha tabular-nums">{(g.calls / 1000).toFixed(1)}k</span>
              <span className={`${mono} w-20 shrink-0 text-right text-[11px] uppercase tracking-wide text-latte`}>{g.clients} client{g.clients > 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {geography.slice(0, 6).map((g) => {
          const share = Math.round((g.calls / platform.callsMonth) * 100);
          return (
            <div key={g.state} className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
              <div className="flex items-center gap-2"><MapPin className="size-4 text-caramel" /><span className="text-[14px] font-semibold text-coffee">{g.state}</span></div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-[24px] font-semibold text-coffee tabular-nums">{(g.calls / 1000).toFixed(1)}k</span>
                <span className={`${mono} text-[10px] uppercase tracking-wide text-latte`}>calls · {share}% share</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{g.clients} client organisation{g.clients > 1 ? "s" : ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
