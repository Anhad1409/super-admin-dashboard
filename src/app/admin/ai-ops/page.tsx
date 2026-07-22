"use client";

/* /admin/ai-ops — how the AI actually behaves on calls, platform-wide:
   containment (calls finished without a human), handoffs & why, supervisor
   barge-ins (trust), pickup SLA, and which tools/skills agents invoke most. */

import { useRouter } from "next/navigation";
import { Bot, Headset, Radio, Timer, Wrench, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CpHeader, StatTile, Card, Tag, mono } from "@/components/admin/cp";
import {
  interventions, interventionRollup, handoffReasons, toolRollup, clientTools,
} from "@/lib/admin-analytics";

const TREND_META = {
  improving: { icon: TrendingUp, c: "var(--color-success)", label: "improving" },
  worsening: { icon: TrendingDown, c: "var(--color-danger)", label: "worsening" },
  flat: { icon: Minus, c: "var(--color-latte)", label: "flat" },
} as const;

export default function AiOpsPage() {
  const router = useRouter();
  const iv = interventionRollup;

  const containmentDetail = {
    title: "AI containment", value: `${iv.containment}%`,
    description: "Share of connected calls the AI completes end-to-end without any human — the single best autonomy metric for a voice-agent platform.",
    breakdowns: [{
      label: "Lowest containment first",
      rows: interventions.slice(0, 8).map((i) => ({
        name: i.client.name, value: `${i.containment}%`, pct: i.containment,
        tint: i.containment < 88 ? "var(--color-danger)" : "var(--color-steam)",
        href: `/admin/clients/${i.client.id}`, sub: `${i.handoffs} handoffs`, flag: i.containment < 88,
      })),
      note: "Low containment isn't always bad — collections orgs escalate by design. Watch the trend, not the level.",
    }],
  };
  const handoffDetail = {
    title: "Handoffs to humans", value: iv.handoffs.toLocaleString("en-IN"),
    description: `${iv.handoffPer100} per 100 connected calls. Why the AI hands off:`,
    breakdowns: [{
      label: "Escalation reasons",
      rows: handoffReasons.map((r) => ({ name: r.reason, value: `${r.pct}%`, pct: r.pct, tint: r.tint })),
    }],
    links: [{ label: "Handoff-heavy clients", href: "/admin/ai-ops" }],
  };
  const bargeDetail = {
    title: "Supervisor barge-ins", value: iv.bargeIns.toLocaleString("en-IN"),
    description: "Humans jumping into live AI calls. High barge rates on young accounts are normal babysitting; persistent high rates signal distrust.",
    breakdowns: [{
      label: "Barge-ins per 1k calls · highest first",
      rows: [...interventions].sort((a, b) => b.bargePer1k - a.bargePer1k).slice(0, 8).map((i) => ({
        name: i.client.name, value: `${i.bargePer1k}`, pct: i.bargePer1k, tint: "var(--color-mango)",
        href: `/admin/clients/${i.client.id}`, sub: `${i.bargeIns} total`,
      })),
    }],
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="AI Operations" subtitle="How the agents behave on real calls — autonomy, escalations, supervisor trust, and the tools they reach for." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Bot} label="AI containment" value={`${iv.containment}%`} sub="calls finished without a human" tint="var(--color-steam)" detail={containmentDetail} />
        <StatTile icon={Headset} label="Handoffs" value={iv.handoffs.toLocaleString("en-IN")} sub={`${iv.handoffPer100} per 100 connected`} tint="var(--color-caramel)" detail={handoffDetail} />
        <StatTile icon={Radio} label="Barge-ins" value={iv.bargeIns.toLocaleString("en-IN")} sub="supervisor interventions" tint="var(--color-mango)" detail={bargeDetail} />
        <StatTile icon={Timer} label="Human pickup" value={`${iv.avgPickupSec}s`} sub={`${iv.slaPct}% within 45s SLA`} tint={iv.slaPct >= 80 ? "var(--color-success)" : "var(--color-warning)"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr]">
        {/* why the AI hands off */}
        <Card title="Why the AI hands off">
          <div className="space-y-3">
            {handoffReasons.map((r) => (
              <div key={r.reason}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-2 text-coffee"><span className="size-2.5 rounded-full" style={{ background: r.tint }} />{r.reason}</span>
                  <span className="font-medium text-mocha tabular-nums">{r.pct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full" style={{ width: `${(r.pct / handoffReasons[0].pct) * 100}%`, background: r.tint }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-lg bg-oat/50 px-3.5 py-2.5 text-[12px] text-mocha">
            &ldquo;Customer asked for a human&rdquo; leading is healthy — it means the AI escalates on request instead of stonewalling. Watch <b>low confidence</b>: that&apos;s the trainable share.
          </p>
        </Card>

        {/* per-client interventions */}
        <Card title="Containment & trust by client" right={<span className={`${mono} text-[11px] text-latte`}>lowest containment first</span>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
                <th className="py-2.5 font-medium">Client</th><th className="text-right font-medium">Containment</th><th className="text-right font-medium">Handoffs /100</th><th className="text-right font-medium">Barges /1k</th><th className="text-right font-medium">Pickup</th><th className="pl-3 font-medium">Trend</th>
              </tr></thead>
              <tbody>
                {interventions.map((i) => {
                  const T = TREND_META[i.trend];
                  return (
                    <tr key={i.client.id} onClick={() => router.push(`/admin/clients/${i.client.id}`)} className="cursor-pointer border-b border-foam/60 last:border-0 hover:bg-oat/30">
                      <td className="py-2.5 text-[13px] font-medium text-coffee">{i.client.name}</td>
                      <td className="text-right text-[12.5px] font-semibold tabular-nums" style={{ color: i.containment < 88 ? "var(--color-danger)" : i.containment < 93 ? "var(--color-warning)" : "var(--color-success)" }}>{i.containment}%</td>
                      <td className="text-right text-[12.5px] text-mocha tabular-nums">{i.handoffPer100}</td>
                      <td className="text-right text-[12.5px] text-mocha tabular-nums">{i.bargePer1k}</td>
                      <td className="text-right text-[12.5px] text-mocha tabular-nums">{i.avgPickupSec}s</td>
                      <td className="pl-3"><span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: T.c }}><T.icon className="size-3" /> {T.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ===== tools / skills ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Most-used tools" right={<span className={`${mono} text-[11px] text-latte`}>{toolRollup.total.toLocaleString("en-IN")} tool calls · {toolRollup.avgPerCall} per connected call</span>}>
          <div className="space-y-3">
            {toolRollup.byTool.map((t) => (
              <div key={t.tool.key} className="flex items-center gap-3">
                <span className="flex w-44 shrink-0 items-center gap-2 truncate text-[13px] font-medium text-coffee">
                  <Wrench className="size-3.5" style={{ color: t.tool.tint }} /> {t.tool.label}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foam">
                  <div className="h-full rounded-full" style={{ width: `${(t.calls / toolRollup.byTool[0].calls) * 100}%`, background: t.tool.tint }} />
                </div>
                <span className="w-20 shrink-0 text-right text-[12.5px] text-mocha tabular-nums">{(t.calls / 1000).toFixed(1)}k</span>
                <span className={`${mono} w-24 shrink-0 text-right text-[10px] text-latte`}><code>{t.tool.key}</code></span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Tool usage by client" right={<span className={`${mono} text-[11px] text-latte`}>top tool per org</span>}>
          <div className="space-y-1">
            {clientTools.slice(0, 9).map((ct) => (
              <button key={ct.client.id} onClick={() => router.push(`/admin/clients/${ct.client.id}`)}
                className="flex w-full items-center gap-3 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-oat/40">
                <span className="w-36 shrink-0 truncate text-[13px] font-medium text-coffee">{ct.client.name}</span>
                <Tag c={ct.top.tint}>{ct.top.label}</Tag>
                <span className="ml-auto shrink-0 text-[12px] text-mocha tabular-nums">{(ct.total / 1000).toFixed(1)}k</span>
                <span className={`${mono} w-14 shrink-0 text-right text-[10px] text-latte`}>{ct.perCall}/call</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
