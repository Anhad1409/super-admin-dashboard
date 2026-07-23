"use client";

/* /admin/system — platform health: service status, latency, uptime and
   the active incident feed. */

import { ServerCog, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { CpHeader, StatTile, Card, Tag, mono } from "@/components/admin/cp";
import { services, incidents, HEALTH_META } from "@/lib/admin-mock";
import { listDetail } from "@/lib/metric-details";

const INC_TONE = { investigating: "var(--color-danger)", monitoring: "var(--color-warning)", resolved: "var(--color-success)" } as const;

export default function SystemPage() {
  const operational = services.filter((s) => s.status === "operational").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const overall = degraded === 0 ? "All systems operational" : `${degraded} service${degraded > 1 ? "s" : ""} degraded`;
  const avgUptime = (services.reduce((s, x) => s + x.uptime, 0) / services.length).toFixed(2);

  const svcDetail = listDetail("Services operational", `${operational} / ${services.length}`,
    "Every service in the stack with its live status and latency.", "By service",
    services.map((x) => ({
      name: x.name, value: HEALTH_META[x.status].label, tint: HEALTH_META[x.status].tint,
      sub: `${x.kind} · ${x.latencyMs}ms`, flag: x.status !== "operational",
    })));
  const uptimeDetail = listDetail("Avg uptime · 30d", `${avgUptime}%`,
    "Uptime per service, weakest first — the blended average hides the stragglers.", "By service · lowest first",
    [...services].sort((a, b) => a.uptime - b.uptime).map((x) => ({
      name: x.name, value: `${x.uptime}%`, pct: x.uptime, tint: HEALTH_META[x.status].tint,
      sub: x.kind, flag: x.uptime < 99,
    })));
  const incDetail = listDetail("Open incidents", String(incidents.filter((i) => i.status !== "resolved").length),
    "The incident feed — open items first.", "Incidents",
    [...incidents].sort((a, b) => Number(a.status === "resolved") - Number(b.status === "resolved")).map((i) => ({
      name: i.title, value: i.status, tint: i.status === "resolved" ? "var(--color-success)" : i.status === "investigating" ? "var(--color-danger)" : "var(--color-warning)",
      sub: `${i.service} · ${i.when}`, flag: i.status !== "resolved",
    })));

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="System health" subtitle="The infrastructure behind every call — status, latency and incidents."
        right={<span className={`${mono} flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${degraded ? "border-warning/40 bg-warning/15 text-warning" : "border-success/40 bg-success/15 text-success"}`}>
          <span className="size-2 rounded-full" style={{ background: degraded ? "var(--color-warning)" : "var(--color-success)" }} /> {overall}</span>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={CheckCircle2} label="Services operational" value={`${operational} / ${services.length}`} sub={degraded ? `${degraded} degraded` : "no issues"} tint="var(--color-success)" detail={svcDetail} />
        <StatTile icon={Activity} label="Avg uptime · 30d" value={`${avgUptime}%`} sub="across all services" tint="var(--color-steam)" detail={uptimeDetail} />
        <StatTile icon={AlertTriangle} label="Open incidents" value={incidents.filter((i) => i.status !== "resolved").length} sub={`${incidents.filter((i) => i.status === "resolved").length} resolved recently`} tint="var(--color-mango)" detail={incDetail} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Services">
          <div className="space-y-1">
            {services.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-oat/40">
                <div className="flex items-center gap-2.5">
                  <span className="size-2.5 rounded-full" style={{ background: HEALTH_META[s.status].tint }} />
                  <div><div className="text-[13px] font-medium text-coffee">{s.name}</div><div className={`${mono} text-[10px] uppercase tracking-wide text-latte`}>{s.kind}</div></div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-[12px] text-mocha tabular-nums">{s.latencyMs}ms</span>
                  <span className="w-12 text-[12px] text-latte tabular-nums">{s.uptime}%</span>
                  <Tag c={HEALTH_META[s.status].tint}>{HEALTH_META[s.status].label}</Tag>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Incident feed">
          <ul className="space-y-3">
            {incidents.map((inc, i) => (
              <li key={i} className="rounded-xl border border-foam bg-cream/50 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-coffee">{inc.title}</span>
                  <Tag c={INC_TONE[inc.status]}>{inc.status[0].toUpperCase() + inc.status.slice(1)}</Tag>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{inc.note}</p>
                <div className={`${mono} mt-1.5 flex items-center gap-2 text-[10px] uppercase tracking-wide text-latte`}><span>{inc.service}</span><span>·</span><span>{inc.when}</span></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
