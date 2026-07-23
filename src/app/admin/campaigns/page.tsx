"use client";

/* /admin/campaigns — every campaign across every client in one board:
   status, volume, connect and conversions. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Play, Calendar, CheckCircle2, Search } from "lucide-react";
import { CpHeader, StatTile, Card, Tag, mono } from "@/components/admin/cp";
import { campaigns, activeCampaignCount, campaignsFor, type PlatCampaign } from "@/lib/admin-analytics";
import { companyDetail } from "@/lib/metric-details";
import type { Client } from "@/lib/clients-mock";

const STATUS_TONE: Record<PlatCampaign["status"], string> = {
  active: "var(--color-success)", scheduled: "var(--color-info)", paused: "var(--color-warning)", completed: "var(--color-latte)",
};
const FILTERS = ["All", "active", "scheduled", "paused", "completed"] as const;

// per-client extractors for the KPI drill-downs
const activeOf = (c: Client) => campaignsFor(c.id).filter((x) => x.status === "active").length;
const leadsOf = (c: Client) => campaignsFor(c.id).reduce((s, x) => s + x.leads, 0);
const convOf = (c: Client) => campaignsFor(c.id).reduce((s, x) => s + x.conversions, 0);

export default function CampaignsPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const rows = useMemo(() => campaigns.filter((c) => {
    if (q && !`${c.name} ${c.client.name}`.toLowerCase().includes(q.toLowerCase())) return false;
    return filter === "All" ? true : c.status === filter;
  }).sort((a, b) => b.leads - a.leads), [q, filter]);

  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
  const totalConv = campaigns.reduce((s, c) => s + c.conversions, 0);

  const totalDetail = companyDetail({
    title: "Total campaigns",
    value: String(campaigns.length),
    description: "Every campaign on the platform — live, scheduled, paused or completed — broken down by the client running it.",
    of: (c) => campaignsFor(c.id).length,
    sub: (c) => { const a = activeOf(c); return a ? `${a} active` : "none active"; },
    label: "Campaigns by client",
  });
  const activeDetail = companyDetail({
    title: "Active now",
    value: String(activeCampaignCount),
    description: "Campaigns dialing today, per client — clients with nothing currently live are hidden.",
    of: activeOf,
    sub: (c) => `${campaignsFor(c.id).filter((x) => x.status === "active").reduce((s, x) => s + x.leads, 0).toLocaleString("en-IN")} leads dialing`,
    label: "Active campaigns by client",
  });
  const leadsDetail = companyDetail({
    title: "Leads in flight",
    value: totalLeads.toLocaleString("en-IN"),
    description: "Queued plus dialed leads across all campaigns, bifurcated by client.",
    of: leadsOf,
    sub: (c) => { const k = campaignsFor(c.id).length; return `${k} campaign${k === 1 ? "" : "s"}`; },
    label: "Leads by client",
  });
  const convDetail = companyDetail({
    title: "Conversions",
    value: totalConv.toLocaleString("en-IN"),
    description: "Successful outcomes across every campaign — flagged clients convert under 15% of their leads.",
    of: convOf,
    sub: (c) => { const L = leadsOf(c); return L ? `${Math.round((convOf(c) / L) * 100)}% of leads` : undefined; },
    flag: (c) => { const L = leadsOf(c); return L > 0 && convOf(c) / L < 0.15; },
    label: "Conversions by client",
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Campaigns" subtitle="Every campaign running across the platform — one cross-client board." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Megaphone} label="Total campaigns" value={campaigns.length} sub="across all clients" tint="var(--color-caramel)" detail={totalDetail} />
        <StatTile icon={Play} label="Active now" value={activeCampaignCount} sub="dialing today" tint="var(--color-success)" detail={activeDetail} />
        <StatTile icon={Calendar} label="Leads in flight" value={totalLeads.toLocaleString("en-IN")} sub="queued + dialed" tint="var(--color-steam)" detail={leadsDetail} />
        <StatTile icon={CheckCircle2} label="Conversions" value={totalConv.toLocaleString("en-IN")} sub={`${Math.round((totalConv / totalLeads) * 100)}% of leads`} tint="var(--color-mango)" detail={convDetail} />
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-latte" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaigns…" className="h-9 w-56 rounded-full border border-foam bg-cream pl-8 pr-3 text-[13px] text-coffee outline-none focus:border-caramel" />
          </div>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full border px-2.5 py-1 text-[12px] font-medium capitalize transition-colors ${filter === f ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-mocha hover:border-latte"}`}>
                {f}{f !== "All" && <span className="ml-1 tabular-nums text-latte">{campaigns.filter((c) => c.status === f).length}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
              <th className="py-2.5 font-medium">Campaign</th><th className="font-medium">Client</th><th className="font-medium">Status</th><th className="text-right font-medium">Leads</th><th className="text-right font-medium">Connect</th><th className="text-right font-medium">Conversions</th><th className="pl-3 text-right font-medium">Conv %</th>
            </tr></thead>
            <tbody>
              {rows.map((c) => {
                const convPct = c.leads ? Math.round((c.conversions / c.leads) * 100) : 0;
                return (
                  <tr key={c.id} onClick={() => router.push(`/admin/clients/${c.client.id}`)} className="cursor-pointer border-b border-foam/60 last:border-0 hover:bg-oat/30">
                    <td className="py-3">
                      <div className="text-[13px] font-medium text-coffee">{c.name}</div>
                      <div className={`${mono} text-[10px] text-latte`}>{c.id}</div>
                    </td>
                    <td className="text-[12.5px] text-mocha">{c.client.name}</td>
                    <td><Tag c={STATUS_TONE[c.status]}>{c.status[0].toUpperCase() + c.status.slice(1)}</Tag></td>
                    <td className="text-right text-[12.5px] text-mocha tabular-nums">{c.leads.toLocaleString("en-IN")}</td>
                    <td className="text-right text-[12.5px] text-mocha tabular-nums">{c.connectPct}%</td>
                    <td className="text-right text-[12.5px] text-coffee tabular-nums">{c.conversions.toLocaleString("en-IN")}</td>
                    <td className="pl-3 text-right text-[12.5px] font-semibold tabular-nums" style={{ color: convPct >= 25 ? "var(--color-success)" : convPct >= 15 ? "var(--color-warning)" : "var(--color-danger)" }}>{convPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
