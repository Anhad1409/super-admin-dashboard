"use client";

import { Activity, PhoneCall, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { useLiveCapacity } from "@/lib/use-live-capacity";
import { CHANNELS, baselineActive, liveCampaigns } from "@/lib/channel-mock";
import { cn } from "@/lib/utils";

const alerts = [
  { tone: "warning", text: "EMI Reminders nearing channel cap (2/3)", at: "just now" },
  { tone: "success", text: "Connect rate up 6pts in the last 15 min", at: "3m ago" },
  { tone: "info", text: "Outreach campaign resumed after pause", at: "12m ago" },
];

export default function LiveAnalyticsPage() {
  const active = useLiveCapacity(baselineActive);
  const pct = Math.round((active / CHANNELS) * 100);
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Live Analytics" subtitle="Real-time concurrency, connect rate & alerts"
        actions={<span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-medium text-success"><span className="size-1.5 animate-pulse rounded-full bg-success" /> Live</span>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Calls in flight" value={active} icon={PhoneCall} sub={`of ${CHANNELS} channels`} />
        <StatCard label="Channel load" value={`${pct}%`} icon={Zap} sub={pct >= 85 ? "near capacity" : "healthy"} />
        <StatCard label="Connect rate" value="61%" icon={TrendingUp} sub="live, last 15m" />
        <StatCard label="Answer time" value="2.4s" icon={Activity} sub="avg pickup" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* leaderboard */}
        <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <h3 className="mb-3 font-serif text-lg font-semibold text-coffee">Live by campaign</h3>
          <div className="space-y-3">
            {liveCampaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-44 truncate text-sm font-medium text-coffee">{c.name}</div>
                <div className="flex-1"><div className="h-2 w-full overflow-hidden rounded-full bg-foam"><div className={cn("h-full rounded-full", c.status === "running" ? "bg-gradient-to-r from-mocha to-caramel" : "bg-latte")} style={{ width: `${(c.slotsUsed / c.slotsCap) * 100}%` }} /></div></div>
                <div className="w-16 text-right font-data text-xs text-coffee">{c.slotsUsed}/{c.slotsCap} ch</div>
                <span className={cn("w-16 text-right text-xs font-medium", c.status === "running" ? "text-success" : c.status === "paused" ? "text-warning" : "text-muted-foreground")}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* alerts */}
        <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <h3 className="mb-3 font-serif text-lg font-semibold text-coffee">Alerts</h3>
          <ul className="space-y-2">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-xl border border-foam bg-card p-3">
                <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", a.tone === "warning" ? "text-warning" : a.tone === "success" ? "text-success" : "text-mocha")} />
                <div className="flex-1"><div className="text-sm text-coffee">{a.text}</div><div className="text-[11px] text-muted-foreground">{a.at}</div></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
