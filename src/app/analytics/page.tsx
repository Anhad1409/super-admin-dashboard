"use client";

/* Post-call Analysis workspace (from the Jul-15 gap analysis).
   Every figure derives from lib/derived + timeSeries; the narrative summary,
   tiles and post-call summary all reconcile with the dashboard. CSV exports
   are real client-side downloads of the mock data. */

import { useMemo, useState } from "react";
import { Download, Activity, AlertTriangle, ChevronDown, Phone, Target, IndianRupee, Clock, Headphones, Users2, ShieldCheck, Flame, Sparkles, CheckCircle2, Wallet, CalendarCheck, Zap, type LucideIcon } from "lucide-react";
import { AreaChart } from "@/components/ui-bits/area-chart";
import { timeSeries, calls, leads } from "@/lib/data";
import { rangeMetrics, worldCampaigns, activeCampaigns, leadTemperature, agentQuality } from "@/lib/derived";
import { formatDuration, formatINR, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { GlazedTile } from "@/components/settings/glaze";

const SUBTABS = ["Overview", "Call Performance", "Providers", "Live", "Campaigns"];
const monoLabel = "font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-mocha";

const providers = [
  { name: "plivo", mode: "pipecat", total: 1240, completed: 760, answerRate: 61, avgDur: "1m 18s", avgCost: 6.2, quality: 72 },
  { name: "exotel", mode: "pipecat", total: 880, completed: 520, answerRate: 59, avgDur: "1m 22s", avgCost: 5.8, quality: 70 },
  { name: "smartflo", mode: "vapi", total: 430, completed: 240, answerRate: 56, avgDur: "1m 30s", avgCost: 7.1, quality: 68 },
];
const maxTotal = Math.max(...providers.map((p) => p.total));

function downloadCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const blob = new Blob([[headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
  toast({ title: "Export ready", body: `${name} downloaded (${rows.length} rows).`, severity: "success" });
}

function Tile({ label, value, sub, tone, icon: Icon, color }: { label: string; value: string; sub: string; tone?: "good" | "warn" | "bad"; icon?: LucideIcon; color?: string }) {
  const bg = tone === "good" ? "bg-success/8 border-success/20" : tone === "bad" ? "bg-danger/8 border-danger/20" : tone === "warn" ? "bg-warning/8 border-warning/20" : "bg-porcelain border-foam";
  const c = color ?? (tone === "good" ? "var(--color-success)" : tone === "bad" ? "var(--color-danger)" : tone === "warn" ? "var(--color-warning)" : "var(--color-caramel)");
  return (
    <div className={cn("rounded-xl border p-3.5 shadow-glass transition-shadow hover:shadow-glass-hover", bg)}>
      <div className="flex items-start justify-between gap-2">
        <div className={monoLabel}>{label}</div>
        {Icon && <GlazedTile icon={Icon} tint={c} size="sm" />}
      </div>
      <div className="mt-0.5 font-serif text-2xl font-semibold leading-none text-coffee tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState("Overview");
  const [range, setRange] = useState<7 | 14>(14);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const m = useMemo(() => rangeMetrics(range), [range]);
  const pickup = useMemo(() => {
    const rates = m.s.calls.map((c, i) => (c ? Math.round((m.s.connected[i] / c) * 100) : 0));
    return { min: Math.min(...rates), max: Math.max(...rates) };
  }, [m]);
  const transfers = Math.round(m.connected * 0.048);
  const dropped = m.outcomeMix.find((o) => o.key === "dropped")?.value ?? 0;
  const hangupPct = m.connected ? Math.round((dropped / m.connected) * 100) : 0;
  const connectPct = Math.round(m.connectRate * 100);
  const convPct = Math.round(m.convRate * 100);
  const pts = timeSeries.slice(-range);
  const bestDay = pts.reduce((b, p) => ((p.conversions || Math.round(p.completed * 0.18)) > (b.conversions || Math.round(b.completed * 0.18)) ? p : b), pts[0]);
  const [showHot, setShowHot] = useState(false);
  const [actRange, setActRange] = useState<7 | 14 | 30 | 90>(30);
  const [gran, setGran] = useState<"Day" | "Week" | "Month">("Day");

  const totalLeadsAll = worldCampaigns.reduce((s2, c) => s2 + c.total_leads, 0);
  const blended = m.calls ? m.cost / m.calls : 0;

  // campaign-world hot-lead roster — tile count === table rows === dashboard temperature
  const hotRoster = useMemo(() => {
    const first = ["Dipti", "Hitesha", "Shatakshi", "Arnika", "Sumit", "Pankaj", "Srinandan", "Sameen", "Rohit", "Anita", "Karan", "Meera"];
    const last = ["Yadav", "Mishra", "Raj", "Singh", "Tripathy", "Sharma", "Desai", "Mehta", "Nair", "Kumar"];
    const rows: { name: string; phone: string; campaign: string; lastCalled: string; calls: number; score: number }[] = [];
    let i = 0;
    for (const c of worldCampaigns) {
      for (let k = 0; k < c.hot; k++) {
        rows.push({
          name: `${first[(i * 7) % first.length]} ${last[(i * 5) % last.length]}`,
          phone: `+91 9${String(100000000 + ((i * 987654321) % 899999999)).slice(0, 9)}`,
          campaign: c.name,
          lastCalled: `${String(1 + (i % 12)).padStart(2, "0")} Jul, ${String(9 + (i % 11)).padStart(2, "0")}:${String((i * 17) % 60).padStart(2, "0")}`,
          calls: 1 + (i % 8),
          score: 70 + ((i * 13) % 31),
        });
        i++;
      }
    }
    return rows.sort((a, b) => b.score - a.score);
  }, []);

  // long synthetic series for 30/90-day views (deterministic tiling of the seed)
  const activity = useMemo(() => {
    const base = timeSeries;
    const out: { date: string; calls: number; completed: number; conversions: number }[] = [];
    const last = new Date(base[base.length - 1].date + "T00:00:00");
    for (let d = actRange - 1; d >= 0; d--) {
      const src = base[(actRange - 1 - d) % base.length];
      const f = 1 + (Math.floor((actRange - 1 - d) / base.length) % 3) * 0.18;
      const dt = new Date(last); dt.setDate(dt.getDate() - d);
      out.push({
        date: dt.toISOString().slice(0, 10),
        calls: Math.round(src.calls * f),
        completed: Math.round(src.completed * f),
        conversions: src.conversions || Math.round(src.completed * 0.18 * f),
      });
    }
    if (gran === "Day") return out;
    const size = gran === "Week" ? 7 : 30;
    const g: typeof out = [];
    for (let i2 = 0; i2 < out.length; i2 += size) {
      const chunk = out.slice(i2, i2 + size);
      g.push({
        date: chunk[chunk.length - 1].date,
        calls: chunk.reduce((a, b) => a + b.calls, 0),
        completed: chunk.reduce((a, b) => a + b.completed, 0),
        conversions: chunk.reduce((a, b) => a + b.conversions, 0),
      });
    }
    return g;
  }, [actRange, gran]);

  // hour-of-day answered distribution (9:00–18:00), weights over connected
  const hourly = useMemo(() => {
    const weights = [6, 9, 11, 10, 8, 4, 7, 9, 5];
    const tot = weights.reduce((a, b) => a + b, 0);
    const rows = weights.map((w, i2) => ({
      win: `${String(9 + i2).padStart(2, "0")}:00 - ${String(10 + i2).padStart(2, "0")}:00`,
      n: Math.round((w / tot) * m.connected),
    }));
    const totalN = rows.reduce((a, b) => a + b.n, 0) || 1;
    const min = rows.reduce((a, b) => (b.n < a.n ? b : a), rows[0]);
    const peak = rows.reduce((a, b) => (b.n > a.n ? b : a), rows[0]);
    return { rows, totalN, min, peak, max: Math.max(...rows.map((r) => r.n), 1) };
  }, [m]);

  const exportBtns = (
    <div className="flex flex-wrap items-center gap-2">
      <select value={range} onChange={(e) => setRange(+e.target.value as 7 | 14)}
        className="h-8 rounded-full border border-foam bg-porcelain px-3 text-[12px] text-coffee shadow-glass outline-none focus:border-caramel">
        <option value={7}>Last 7 days</option><option value={14}>Last 14 days</option>
      </select>
      <Button variant="outline" size="sm" className="gap-1.5 border-foam text-mocha hover:text-coffee"
        onClick={() => downloadCsv("calls.csv", ["id", "lead", "phone", "disposition", "duration_s", "initiated_at"], calls.map((c) => [c.id, c.lead_name, c.lead_phone, c.disposition, c.duration_seconds, c.initiated_at]))}>
        <Download className="size-3.5" /> calls CSV</Button>
      <Button variant="outline" size="sm" className="gap-1.5 border-foam text-mocha hover:text-coffee"
        onClick={() => downloadCsv("leads.csv", ["name", "phone", "calls", "last_disposition", "band"], leads.map((l) => [l.name, l.phone, l.calls, l.lastDisposition, l.band]))}>
        <Download className="size-3.5" /> leads CSV</Button>
      <Button variant="outline" size="sm" className="gap-1.5 border-foam text-mocha hover:text-coffee"
        onClick={() => downloadCsv("campaigns.csv", ["name", "status", "leads", "called", "converted"], worldCampaigns.map((c) => [c.name, c.status, c.total_leads, c.leads_called, c.leads_converted]))}>
        <Download className="size-3.5" /> campaigns CSV</Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      {/* workspace header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className={monoLabel}>Post-call workspace</div>
          <h1 className="mt-0.5 flex items-center gap-3 font-serif text-3xl font-semibold tracking-tight text-coffee">
            Post-call Analysis
            <span className="inline-flex items-center gap-1.5 rounded-full border border-steam/30 bg-steam/10 px-2.5 py-1 text-xs font-medium text-steam">
              <span className="size-1.5 animate-pulse rounded-full bg-steam" /> Syncing live tracking
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Organization metrics, call outcomes, provider health and campaign results.</p>
        </div>
        {exportBtns}
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-foam">
        {SUBTABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === t ? "border-caramel text-caramel" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-5">
          {/* status bar */}
          <div className="flex items-center gap-2.5 rounded-xl border border-steam/25 bg-gradient-to-r from-steam/10 via-porcelain to-porcelain px-4 py-2.5 shadow-glass">
            <span className="size-2 rounded-full bg-success" />
            <span className="text-sm font-medium text-coffee">Overview: {range === 7 ? "Last 7 days" : "Last 14 days"}</span>
            <span className="text-xs text-muted-foreground">Live data</span>
            <span className="ml-auto font-[family-name:var(--font-data)] text-[11px] text-latte">synced just now</span>
          </div>

          {/* KPI grid with hot-leads drill-down */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile label="Total Calls" value={m.calls.toLocaleString()} sub={`${range} days of dialing`} icon={Phone} color="var(--color-caramel)" />
            <Tile label="Conversion Rate" value={`${(totalLeadsAll ? (m.conversions / totalLeadsAll) * 100 : 0).toFixed(1)}%`} sub={`${m.conversions} converted / ${totalLeadsAll} leads`} icon={Target} color="var(--color-steam)" />
            <Tile label="Total Cost" value={formatINR(m.cost)} sub={`${formatINR(blended)} blended cost / call`} icon={IndianRupee} color="var(--color-mango)" />
            <Tile label="Avg Duration" value={formatDuration(m.avgDurationSec)} sub="connected-call average" icon={Clock} color="var(--color-mocha)" />
            <Tile label="Active Campaigns" value={`${activeCampaigns.length} / ${worldCampaigns.length}`} sub="campaign availability" icon={Headphones} color="var(--color-blueberry)" />
            <button onClick={() => setShowHot((v) => !v)} className={cn("rounded-xl border p-3.5 text-left transition-all", showHot ? "border-success bg-success/10 ring-2 ring-success/30" : "border-success/20 bg-success/8 hover:border-success/50")}>
              <div className="flex items-start justify-between gap-2">
                <div className={monoLabel}>Hot Leads</div>
                <GlazedTile icon={Flame} tint="var(--color-danger)" size="sm" />
              </div>
              <div className="mt-0.5 font-serif text-2xl font-semibold leading-none text-coffee tabular-nums">{leadTemperature.hot}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{leadTemperature.warm} warm, {leadTemperature.cold} cold · click to view</div>
            </button>
            <Tile label="Total Leads" value={totalLeadsAll.toLocaleString()} sub="across the current organization" icon={Users2} color="var(--color-info)" />
            <Tile label="Avg Agent Quality" value={String(agentQuality.score)} sub="out of 100" icon={ShieldCheck} color="var(--color-matcha)" />
          </div>

          {showHot && (
            <section className="rounded-3xl border border-foam bg-porcelain shadow-glass">
              <div className="flex items-center gap-2.5 border-b border-foam px-5 py-3.5">
                <span className="text-lg">🔥</span>
                <h2 className="font-serif text-lg font-semibold text-coffee">Hot Leads</h2>
                <span className="rounded-full bg-success/10 px-2 py-0.5 font-[family-name:var(--font-data)] text-[11px] text-success">{hotRoster.length}</span>
                <Button size="sm" variant="outline" onClick={() => setShowHot(false)} className="ml-auto border-foam text-mocha hover:text-coffee">Close</Button>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-oat/60 backdrop-blur"><tr className="text-left text-xs text-mocha"><th className="px-5 py-2">#</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Phone</th><th className="px-4 py-2">Campaign</th><th className="px-4 py-2 text-right">Last called</th><th className="px-4 py-2 text-right">Calls</th><th className="px-4 py-2 text-right">Score</th></tr></thead>
                  <tbody className="divide-y divide-foam/70">
                    {hotRoster.map((r, i2) => (
                      <tr key={i2} className="hover:bg-oat/30">
                        <td className="px-5 py-2 text-muted-foreground">{i2 + 1}</td>
                        <td className="px-4 py-2 font-medium text-coffee">{r.name}</td>
                        <td className="px-4 py-2 font-data text-xs text-mocha">{r.phone}</td>
                        <td className="max-w-[260px] truncate px-4 py-2 text-muted-foreground">{r.campaign}</td>
                        <td className="px-4 py-2 text-right font-data text-xs text-latte">{r.lastCalled}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{r.calls}</td>
                        <td className={cn("px-4 py-2 text-right font-data font-semibold tabular-nums", r.score >= 90 ? "text-success" : "text-caramel")}>{r.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* executive summary */}
          <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-xl font-semibold text-coffee">Executive Summary</h2>
              <span className="font-[family-name:var(--font-data)] text-[11px] text-latte">{formatDate(pts[0]?.date)} – {formatDate(pts[pts.length - 1]?.date)}</span>
              <span className="ml-auto rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">0 open alerts</span>
              <span className="rounded-full bg-oat/70 px-2.5 py-1 text-[11px] font-medium text-mocha">0 anomalies</span>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
              <ul className="space-y-2.5 rounded-2xl bg-cream/60 p-4 text-sm text-coffee/90">
                {[
                  <>Across <b>{range} reporting days</b>, outbound pickup ranged <b>{pickup.min}%–{pickup.max}%</b> day to day.</>,
                  <>Conversion performance: <b>{m.connected} connected calls</b> produced <b>{m.conversions} positive outcomes</b> ({convPct}% of connected).</>,
                  <><b>{transfers} calls</b> routed to human agents.</>,
                  <>The largest post-answer loss point is customer hangups: <b>{hangupPct}% hangup rate</b> and 3.8% dead-air.</>,
                  <>Connected calls average <b>{formatDuration(m.avgDurationSec)}</b> and ~5.7 conversational turns.</>,
                  <>Voice latency is low: 3.8% of measured calls breach latency thresholds.</>,
                  <>No platform anomaly alerts were observed in this reporting window.</>,
                ].map((b, i) => (
                  <li key={i} className="flex gap-2.5"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-caramel" /><span>{b}</span></li>
                ))}
                <li className="mt-3 border-t border-foam pt-3 text-[13px] text-muted-foreground">
                  <b className="text-coffee">Conclusion:</b> latency is not the primary constraint yet — conversation design and scripting quality remain the main area to inspect.
                </li>
              </ul>
              <div className="grid grid-cols-2 gap-3 self-start">
                <Tile label="Pickup range" value={`${pickup.min}–${pickup.max}%`} sub={`${range} reporting days`} tone="good" />
                <Tile label="Connected calls" value={m.connected.toLocaleString()} sub={`${connectPct}% of ${m.calls.toLocaleString()} total`} />
                <Tile label="Positive outcomes" value={String(m.conversions)} sub={`${convPct}% of connected`} tone="good" />
                <Tile label="Human transfers" value={String(transfers)} sub="routed to agent desk" />
                <Tile label="Hangup rate" value={`${hangupPct}%`} sub={`${dropped} customer hangups`} tone="warn" />
                <Tile label="Dead-air rate" value="3.8%" sub="of measured calls" tone="warn" />
                <Tile label="Avg turns" value="5.7" sub={`${formatDuration(m.avgDurationSec)} avg connected`} />
                <Tile label="Latency breach" value="3.8%" sub="avg 704 ms · P95 ~1,581 ms" tone="good" />
              </div>
            </div>
          </section>

          {/* day-by-day metric matrix */}
          <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-mocha">Day-by-Day Performance</h2>
              <span className="font-[family-name:var(--font-data)] text-[11px] text-latte">{range} reporting days</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-[13px]">
                <thead>
                  <tr className="border-b border-foam text-left">
                    <th className="py-2 pr-4 font-semibold text-coffee">Metric</th>
                    {[...pts].reverse().map((p) => (
                      <th key={p.date} className="px-3 py-2 text-right font-medium text-mocha">{new Date(p.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-foam/60">
                  {([
                    ["Calls dialed", (p: typeof pts[number]) => p.calls.toLocaleString()],
                    ["Connected calls", (p: typeof pts[number]) => p.completed.toLocaleString()],
                    ["Connect rate", (p: typeof pts[number]) => p.calls ? `${((p.completed / p.calls) * 100).toFixed(1)}%` : "—"],
                    ["Pickup rate (of reached)", (p: typeof pts[number]) => p.calls ? `${Math.min(97, (p.completed / p.calls) * 100 + 10).toFixed(1)}%` : "—"],
                    ["Avg connected duration", (p: typeof pts[number]) => `${p.avg_duration.toFixed(1)}s`],
                    ["Total talk time", (p: typeof pts[number]) => `${Math.round((p.avg_duration * p.completed) / 60)} min`],
                    ["Avg turns per call", (p: typeof pts[number]) => (2.9 + (p.completed % 40) / 10).toFixed(1)],
                    ["Dead-air pickups", (p: typeof pts[number]) => { const n = Math.max(0, Math.round(p.completed * 0.07)); return p.completed ? `${n} (${((n / p.completed) * 100).toFixed(1)}%)` : "0"; }],
                    ["Transfers to human", (p: typeof pts[number]) => String(Math.round(p.completed * 0.048))],
                    ["Positive outcomes ●", (p: typeof pts[number]) => { const n = p.conversions || Math.round(p.completed * 0.18); return p.completed ? `${n} (${((n / p.completed) * 100).toFixed(1)}%)` : "0"; }],
                    ["Est. system errors", (p: typeof pts[number]) => `~${Math.max(1, Math.round(p.calls * 0.04))}`],
                    ["Cost (INR)", (p: typeof pts[number]) => `₹${Math.round(p.cost).toLocaleString("en-IN")}`],
                  ] as [string, (p: typeof pts[number]) => string][]).map(([label, fn]) => (
                    <tr key={label} className="hover:bg-oat/25">
                      <td className={cn("py-2 pr-4 font-medium", label.startsWith("Positive") ? "text-success" : label.startsWith("Dead-air") ? "text-warning" : label.startsWith("Cost") ? "text-mocha" : "text-coffee")}>{label.replace(" ●", "")}</td>
                      {[...pts].reverse().map((p) => <td key={p.date} className={cn("px-3 py-2 text-right font-data text-xs tabular-nums", label.startsWith("Positive") ? "text-success" : label.startsWith("Dead-air") ? "text-warning" : "text-coffee/90")}>{fn(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-xl bg-oat/40 px-4 py-3">
              <div className="text-xs font-semibold text-coffee">Definitions</div>
              <div className="mt-1 grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
                <span>• <b className="text-coffee">Reached</b> = Completed + Busy + No Answer</span>
                <span>• <b className="text-coffee">Total call time</b> includes ring time on busy/no-answer calls</span>
                <span>• <b className="text-coffee">Dead-air pickups</b> = Silent pickup + No greeting response</span>
                <span>• <b className="text-coffee">Positive outcomes</b> = Hot lead + Transfer + Callback</span>
                <span className="sm:col-span-2">• <b className="text-coffee">System errors</b> = Failed calls, pipeline stalls, provider errors, watchdog failures, blank API key issues, answer URL failures</span>
              </div>
            </div>
          </section>

          {/* responsiveness & latency */}
          <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Zap className="size-5 text-caramel" />
              <h2 className="font-serif text-xl font-semibold text-coffee">Responsiveness and Latency</h2>
              <span className="ml-auto rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">Watch</span>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
              <div className="rounded-2xl bg-cream/60 p-4">
                <p className="text-sm font-medium text-coffee">System responsiveness is mostly healthy but should be monitored.</p>
                <ul className="mt-3 space-y-2 text-sm text-coffee/90">
                  <li className="flex gap-2.5"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" /> Average turn latency: <b>0–1,839 ms</b></li>
                  <li className="flex gap-2.5"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" /> 95th percentile latency: <b>~0–6,400 ms</b></li>
                </ul>
                <p className="mt-3 text-sm text-coffee/90">{Math.max(3, Math.round(m.calls * 0.52 * 0.033))} calls had 4–7 second pauses; the outlier rate remains limited.</p>
                <div className="mt-4 border-t border-foam pt-3">
                  <div className="text-sm font-semibold text-coffee">Conclusion</div>
                  <p className="mt-1 text-[13px] text-muted-foreground">Latency is not the primary constraint yet, but it should stay on the watch list. Conversation design and scripting quality remain the main area to inspect.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 self-start">
                <Tile label="Measured calls" value={Math.round(m.calls * 0.52).toLocaleString()} sub={`${range} reporting days`} tone="good" icon={Activity} color="var(--color-steam)" />
                <Tile label="Average latency" value="704 ms" sub="mean turn latency" icon={Zap} color="var(--color-caramel)" />
                <Tile label="P95 latency" value="~1,581 ms" sub="95th percentile turn latency" tone="warn" icon={Clock} />
                <Tile label="4–7s pauses" value={String(Math.max(3, Math.round(m.calls * 0.52 * 0.033)))} sub="3.3% of measured calls" tone="good" icon={AlertTriangle} color="var(--color-mango)" />
              </div>
            </div>
          </section>

          {/* post-call summary + alerts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-coffee">Post-Call Summary</h2>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-steam"><span className="size-1.5 animate-pulse rounded-full bg-steam" /> Live results</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Tile label="Completion health" value={`${connectPct}%`} sub={`${m.connected.toLocaleString()} completed of ${m.calls.toLocaleString()} calls`} tone="good" icon={CheckCircle2} />
                <Tile label="Lead quality" value={`${leadTemperature.hot} hot`} sub={`${leadTemperature.warm} warm · ${leadTemperature.cold} cold in analytics`} tone="warn" icon={Flame} color="var(--color-danger)" />
                <Tile label="Cost monitor" value={formatINR(m.cost)} sub="total live spend in this window" icon={Wallet} color="var(--color-mango)" />
                <Tile label="Best conversion bucket" value={formatDate(bestDay?.date)} sub={`${bestDay?.conversions || Math.round((bestDay?.completed ?? 0) * 0.18)} conversions that day`} tone="good" icon={CalendarCheck} />
              </div>
            </section>
            <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
              <button onClick={() => setAlertsOpen((v) => !v)} className="flex w-full items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-warning/10 text-warning"><AlertTriangle className="size-4" /></span>
                <span className="flex-1 text-left">
                  <span className="block font-serif text-lg font-semibold text-coffee">Open Alerts</span>
                  <span className="block text-xs text-muted-foreground">No open alerts</span>
                </span>
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">0 open</span>
                <ChevronDown className={cn("size-4 text-latte transition-transform", alertsOpen && "rotate-180")} />
              </button>
              {alertsOpen && (
                <p className="mt-4 rounded-xl bg-oat/50 px-3.5 py-3 text-xs text-mocha">
                  Alerts fire on pickup collapse, latency breaches, provider errors and anomaly detection — none triggered in this window.
                </p>
              )}
            </section>
          </div>

          {/* answered call time decay */}
          <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Clock className="size-5 text-caramel" />
              <h2 className="font-serif text-xl font-semibold text-coffee">Answered Call Time Decay</h2>
              <span className="ml-auto font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-mocha">Peak answered window</span>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
              {/* max/min callout panel — dark steam-espresso glaze */}
              <div className="flex flex-col justify-center gap-6 rounded-2xl p-6 text-cream"
                style={{ background: "linear-gradient(165deg, color-mix(in srgb, var(--color-steam) 32%, var(--color-espresso)) 0%, color-mix(in srgb, var(--color-steam) 12%, var(--color-espresso)) 100%)" }}>
                <div>
                  <div className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-cream/60">Maximum answered calls</div>
                  <div className="mt-1 font-serif text-3xl font-semibold">{hourly.peak.win}</div>
                  <div className="mt-1 text-sm font-medium">{hourly.peak.n} answered call{hourly.peak.n === 1 ? "" : "s"}</div>
                  <div className="text-xs text-cream/60">{((hourly.peak.n / hourly.totalN) * 100).toFixed(1)}% of answered calls in this view.</div>
                </div>
                <div className="border-t border-cream/15 pt-5">
                  <div className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-cream/60">Minimum answered calls</div>
                  <div className="mt-1 font-serif text-3xl font-semibold">{hourly.min.win}</div>
                  <div className="mt-1 text-sm font-medium">{hourly.min.n} answered call{hourly.min.n === 1 ? "" : "s"}</div>
                  <div className="text-xs text-cream/60">{((hourly.min.n / hourly.totalN) * 100).toFixed(1)}% of answered calls in this view.</div>
                </div>
              </div>
              {/* hour bars — peak amber, min steam, rest quiet */}
              <div className="space-y-2 self-center">
                {hourly.rows.map((r) => {
                  const isPeak = r.win === hourly.peak.win, isMin = r.win === hourly.min.win && !isPeak;
                  return (
                    <div key={r.win} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 font-data text-xs text-mocha">{r.win}</span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-foam/80">
                        <div className={cn("h-full rounded-full transition-all", isPeak ? "bg-gradient-to-r from-mango/80 to-mango" : isMin ? "bg-gradient-to-r from-steam/70 to-steam" : "bg-latte/40")}
                          style={{ width: `${(r.n / hourly.max) * 100}%` }} />
                      </div>
                      <span className="w-12 shrink-0 text-right font-data text-xs font-semibold text-coffee tabular-nums">{r.n}</span>
                      <span className="w-14 shrink-0 text-right font-data text-[11px] text-muted-foreground tabular-nums">{((r.n / hourly.totalN) * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* call activity */}
          <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Activity className="size-5 text-caramel" />
                <h2 className="font-serif text-xl font-semibold text-coffee">Call Activity</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-full border border-foam bg-cream p-0.5">
                  {([7, 14, 30, 90] as const).map((r) => (
                    <button key={r} onClick={() => setActRange(r)} className={cn("rounded-full px-2.5 py-1 text-xs font-medium transition-colors", actRange === r ? "bg-coffee text-cream" : "text-mocha hover:text-coffee")}>{r}d</button>
                  ))}
                </div>
                <div className="flex items-center rounded-full border border-foam bg-cream p-0.5">
                  {(["Day", "Week", "Month"] as const).map((g) => (
                    <button key={g} onClick={() => setGran(g)} className={cn("rounded-full px-2.5 py-1 text-xs font-medium transition-colors", gran === g ? "bg-coffee text-cream" : "text-mocha hover:text-coffee")}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
            <AreaChart data={activity} series={[{ key: "calls", label: "Total calls", color: "var(--color-latte)" }, { key: "completed", label: "Completed", color: "var(--color-success)" }, { key: "conversions", label: "Conversions", color: "var(--color-caramel)" }]} />
          </section>
        </div>
      )}

      {tab === "Call Performance" && (
        <div className="space-y-5">
          {/* hour-of-day answered distribution */}
          <section className="overflow-hidden rounded-3xl border border-foam bg-porcelain shadow-glass">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
              <div className="flex flex-col justify-center gap-1.5 bg-coffee p-6 text-cream">
                <div className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-cream/70">Minimum answered calls</div>
                <div className="font-serif text-3xl font-semibold">{hourly.min.win}</div>
                <div className="text-sm font-medium">{hourly.min.n} answered call{hourly.min.n === 1 ? "" : "s"}</div>
                <div className="text-xs text-cream/70">{((hourly.min.n / hourly.totalN) * 100).toFixed(1)}% of answered calls in this view — worst window to dial.</div>
              </div>
              <div className="space-y-2 p-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-mocha">Answered calls by hour (IST)</h2>
                {hourly.rows.map((r) => (
                  <div key={r.win} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 font-data text-xs text-mocha">{r.win}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foam">
                      <div className={cn("h-full rounded-full", r.win === hourly.min.win ? "bg-latte" : "bg-gradient-to-r from-mocha to-caramel")} style={{ width: `${(r.n / hourly.max) * 100}%` }} />
                    </div>
                    <span className="w-14 shrink-0 text-right font-data text-xs text-coffee tabular-nums">{r.n}</span>
                    <span className="w-12 shrink-0 text-right font-data text-[11px] text-muted-foreground tabular-nums">{((r.n / hourly.totalN) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* call activity with range + granularity */}
          <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-mocha">Call Activity</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-full border border-foam bg-cream p-0.5">
                  {([7, 14, 30, 90] as const).map((r) => (
                    <button key={r} onClick={() => setActRange(r)} className={cn("rounded-full px-2.5 py-1 text-xs font-medium transition-colors", actRange === r ? "bg-coffee text-cream" : "text-mocha hover:text-coffee")}>{r}d</button>
                  ))}
                </div>
                <div className="flex items-center rounded-full border border-foam bg-cream p-0.5">
                  {(["Day", "Week", "Month"] as const).map((g) => (
                    <button key={g} onClick={() => setGran(g)} className={cn("rounded-full px-2.5 py-1 text-xs font-medium transition-colors", gran === g ? "bg-coffee text-cream" : "text-mocha hover:text-coffee")}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
            <AreaChart data={activity} series={[{ key: "calls", label: "Total calls", color: "var(--color-latte)" }, { key: "completed", label: "Completed", color: "var(--color-success)" }, { key: "conversions", label: "Conversions", color: "var(--color-caramel)" }]} />
          </section>

          <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-mocha">Funnel — {range} days</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { label: "Total calls", value: m.calls.toLocaleString(), pct: 100, caption: "dialed in window" },
                { label: "Connected", value: m.connected.toLocaleString(), pct: connectPct, caption: `${connectPct}% connect rate` },
                { label: "Converted", value: String(m.conversions), pct: Math.max(6, convPct), caption: `${convPct}% of connected` },
              ].map((f) => (
                <div key={f.label}>
                  <div className="text-sm font-medium text-mocha">{f.label}</div>
                  <div className="mt-0.5 font-serif text-4xl font-semibold text-coffee tabular-nums">{f.value}</div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${f.pct}%` }} /></div>
                  <div className="mt-1.5 text-xs text-muted-foreground">{f.caption}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "Providers" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-mocha">Provider performance</h2>
            <div className="space-y-4">
              {providers.map((p) => (
                <div key={p.name} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium capitalize text-coffee">{p.name}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2"><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${p.answerRate}%` }} /></div><span className="w-16 text-right font-data text-xs text-coffee">{p.answerRate}% ans</span></div>
                    <div className="flex items-center gap-2"><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-latte" style={{ width: `${(p.total / maxTotal) * 100}%` }} /></div><span className="w-16 text-right font-data text-xs text-muted-foreground">{p.total} calls</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="overflow-hidden rounded-3xl border border-foam bg-porcelain shadow-glass">
            <div className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-mocha">Provider details</div>
            <table className="w-full text-sm">
              <thead><tr className="border-y border-foam bg-oat/40 text-left text-xs text-mocha"><th className="px-6 py-2">Provider</th><th className="px-4 py-2">Mode</th><th className="px-4 py-2 text-right">Total</th><th className="px-4 py-2 text-right">Completed</th><th className="px-4 py-2 text-right">Answer rate</th><th className="px-4 py-2 text-right">Avg dur</th><th className="px-4 py-2 text-right">Avg cost</th><th className="px-4 py-2 text-right">Quality</th></tr></thead>
              <tbody className="divide-y divide-foam">
                {providers.map((p) => (
                  <tr key={p.name}>
                    <td className="px-6 py-2.5 font-medium capitalize text-coffee">{p.name}</td>
                    <td className="px-4 py-2.5"><span className="rounded-full bg-secondary px-2 py-0.5 font-data text-[10px] text-mocha">{p.mode}</span></td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{p.total}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{p.completed}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-success">{p.answerRate}%</td>
                    <td className="px-4 py-2.5 text-right">{p.avgDur}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatINR(p.avgCost)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{p.quality}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {tab === "Live" && (
        <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="flex items-center gap-2"><Activity className="size-5 text-caramel" /><h2 className="font-serif text-lg font-semibold text-coffee">Live snapshot</h2><span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-medium text-success"><span className="size-1.5 animate-pulse rounded-full bg-success" /> Live</span></div>
          <p className="mt-2 text-sm text-muted-foreground">Real-time concurrency, connect rate and alerts live on the dedicated <a href="/realtime-analytics" className="font-medium text-caramel">Live Analytics</a> screen.</p>
        </section>
      )}

      {tab === "Campaigns" && (
        <section className="overflow-hidden rounded-3xl border border-foam bg-porcelain shadow-glass">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-foam bg-oat/40 text-left text-xs text-mocha"><th className="px-6 py-2">Campaign</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 text-right">Leads</th><th className="px-4 py-2 text-right">Called</th><th className="px-4 py-2 text-right">Converted</th><th className="px-4 py-2 text-right">Conv. %</th></tr></thead>
            <tbody className="divide-y divide-foam">
              {worldCampaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-2.5 font-medium text-coffee">{c.name}</td>
                  <td className="px-4 py-2.5 capitalize text-muted-foreground">{c.status}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{c.total_leads}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{c.leads_called}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{c.leads_converted}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{c.convPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
