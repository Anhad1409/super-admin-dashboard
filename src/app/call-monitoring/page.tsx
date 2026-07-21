"use client";

/* Call Monitor — live operations desk, rebuilt in the v7 list language
   (banner + chips + rich rows) with live-ticking durations, sentiment
   meters and listen/whisper/barge actions. */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Headphones, MessageSquareText, PhoneForwarded, Radio, Activity, History, UserRound } from "lucide-react";
import { V7Banner, Chip, SectionCard, Meter, Equalizer, InitialBean, monoLabel, rowStagger, rowItem } from "@/components/v7/kit";
import { GlazedTile } from "@/components/settings/glaze";
import { useSharedCapacity } from "@/lib/capacity-store";
import { rangeMetrics, activeCampaigns } from "@/lib/derived";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

type Stage = "ringing" | "talking" | "wrapping";
type LiveCall = { id: string; lead: string; phone: string; campaign: string; agent: string; stage: Stage; startedSec: number; sentiment: number; callerId: string };

const NAMES = ["Rohit Sharma", "Anita Desai", "Karan Mehta", "Meera Nair", "Sumit Tripathy", "Pankaj Singh", "Dipti Yadav", "Hitesha Kumar"];
const POOL = ["+91 80353 41719", "+91 80353 12770"];

const TABS = ["Active Calls", "My Sessions", "History"] as const;
type Tab = (typeof TABS)[number];

type Session = { id: string; mode: "Listen" | "Whisper" | "Barge"; started: string; ended: string; reason: "call_ended" | "supervisor_ended" | "supervisor_disconnected"; mine?: boolean; lead?: string; campaign?: string; durS: number };
const HISTORY: Session[] = Array.from({ length: 14 }, (_, i) => {
  const modes: Session["mode"][] = ["Listen", "Listen", "Listen", "Barge", "Listen", "Whisper", "Listen"];
  const reasons: Session["reason"][] = ["call_ended", "supervisor_ended", "supervisor_disconnected"];
  const day = 15 - Math.floor(i / 3);
  const hh = 18 - (i % 9);
  const durS = 45 + ((i * 97) % 260);
  const mm = (i * 13) % 50;
  const endM = mm + Math.ceil(durS / 60);
  return {
    id: ((i + 3) * 2654435761 % 0xffffffff).toString(16).padStart(8, "0"),
    mode: modes[i % modes.length],
    started: `${String(day).padStart(2, "0")}/07/2026, ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String((i * 29) % 60).padStart(2, "0")}`,
    ended: `${String(day).padStart(2, "0")}/07/2026, ${String(hh).padStart(2, "0")}:${String(endM % 60).padStart(2, "0")}:${String((i * 41) % 60).padStart(2, "0")}`,
    reason: reasons[i % reasons.length],
    mine: i % 3 !== 1,
    lead: NAMES[(i * 3) % NAMES.length],
    campaign: i % 2 ? "IOB : Mobile Banking Activation (Clone)" : "Outreach campaign",
    durS,
  };
});
const modeTone: Record<Session["mode"], string> = {
  Listen: "bg-success/12 text-success border-success/25",
  Whisper: "bg-warning/12 text-warning border-warning/25",
  Barge: "bg-info/10 text-info border-info/25",
};
const fmtDur = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

const stageMeta: Record<Stage, { label: string; pill: string; dot: string }> = {
  ringing: { label: "Ringing", pill: "bg-info/10 text-info border-info/25", dot: "var(--color-info)" },
  talking: { label: "Talking", pill: "bg-success/12 text-success border-success/25", dot: "var(--color-success)" },
  wrapping: { label: "Wrapping up", pill: "bg-warning/12 text-warning border-warning/25", dot: "var(--color-warning)" },
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function CallMonitorPage() {
  const active = useSharedCapacity();
  const m = useMemo(() => rangeMetrics(7), []);
  const [tab, setTab] = useState<Tab>("Active Calls");
  const [stage, setStage] = useState<Stage | "all">("all");
  const [tick, setTick] = useState(0);

  // deterministic live board sized by the shared capacity number
  const calls = useMemo<LiveCall[]>(() => {
    const camps = activeCampaigns.length ? activeCampaigns : [{ name: "Outreach campaign", agent_name: "Aria" } as (typeof activeCampaigns)[number]];
    return Array.from({ length: active }, (_, i) => {
      const c = camps[i % camps.length];
      const stages: Stage[] = ["talking", "talking", "ringing", "talking", "wrapping"];
      return {
        id: `lc${i}`,
        lead: NAMES[i % NAMES.length],
        phone: `+91 9${String(320000000 + i * 7351247).slice(0, 9)}`,
        campaign: c.name,
        agent: c.agent_name || "Aria",
        stage: stages[i % stages.length],
        startedSec: 12 + ((i * 47) % 200),
        sentiment: 35 + ((i * 23) % 60),
        callerId: POOL[i % POOL.length],
      };
    });
  }, [active]);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const counts = useMemo(() => ({
    ringing: calls.filter((c) => c.stage === "ringing").length,
    talking: calls.filter((c) => c.stage === "talking").length,
    wrapping: calls.filter((c) => c.stage === "wrapping").length,
  }), [calls]);

  const rows = calls.filter((c) => stage === "all" || c.stage === stage);

  const act = (verb: string, lead: string) =>
    toast({ title: verb, body: `${verb === "Listening" ? "Muted bridge into" : verb === "Whispering" ? "Only the agent hears you on" : "You joined"} the call with ${lead}.`, severity: "info" });

  return (
    <div className="mx-auto max-w-7xl">
      <V7Banner
        eyebrow="Live operations"
        title="Call Monitor"
        subtitle={<><span className="font-medium text-coffee">{calls.length} calls in flight</span> — listen in, whisper to the agent, or barge when it matters.</>}
        stats={[
          { label: "In flight", value: <span className="flex items-center gap-2">{calls.length} <Equalizer /></span> },
          { label: "Talking", value: <span className="text-success">{counts.talking}</span> },
          { label: "Connect · 7d", value: `${Math.round(m.connectRate * 100)}%`, spark: m.s.connected, color: "var(--color-success)" },
        ]}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-all",
              tab === t ? "border-caramel bg-brand text-brand-foreground shadow-cta" : "border-foam bg-porcelain text-mocha shadow-glass hover:border-latte hover:text-coffee")}>
            {t === "Active Calls" ? <Radio className="size-3.5" /> : t === "My Sessions" ? <UserRound className="size-3.5" /> : <History className="size-3.5" />}
            {t}
            {t === "Active Calls" && <span className={cn("rounded-full px-1.5 text-[10px] tabular-nums", tab === t ? "bg-porcelain/25" : "bg-oat")}>{calls.length}</span>}
          </button>
        ))}
      </div>

      {tab === "Active Calls" && (<>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Chip active={stage === "all"} onClick={() => setStage("all")} dot="var(--color-caramel)" count={calls.length}>All</Chip>
        {(Object.keys(stageMeta) as Stage[]).map((s) => (
          <Chip key={s} active={stage === s} onClick={() => setStage(stage === s ? "all" : s)} dot={stageMeta[s].dot} count={counts[s]}>
            {stageMeta[s].label}
          </Chip>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-steam/30 bg-steam/10 px-3 py-1.5 text-xs font-medium text-steam">
          <Radio className="size-3.5" /> Live — updates every second
        </span>
      </div>

      <SectionCard title="Live calls" count={`${rows.length} of ${calls.length}`}
        help="Listen is silent; Whisper is agent-only coaching; Barge joins you into the conversation. Every action is logged for compliance.">
        <div className={cn("hidden grid-cols-[minmax(0,1.9fr)_minmax(0,1.5fr)_110px_150px_90px_200px] gap-3 border-b border-foam px-4 py-1.5 lg:grid", monoLabel)}>
          <span>Lead</span><span>Campaign · agent</span><span>Stage</span><span>Sentiment</span><span className="text-right">Duration</span><span className="text-right">Monitor</span>
        </div>

        <motion.ul variants={rowStagger} initial="hidden" animate="show">
          {rows.map((c) => {
            const dur = c.startedSec + tick;
            const meta = stageMeta[c.stage];
            const good = c.sentiment >= 55;
            return (
              <motion.li key={c.id} variants={rowItem}
                className="group grid grid-cols-1 gap-2 border-b border-foam/70 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-oat/40 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1.5fr)_110px_150px_90px_200px] lg:items-center lg:gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <InitialBean name={c.lead} band={good ? "hot" : "warm"} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate font-medium text-coffee">{c.lead}{c.stage === "talking" && <Equalizer />}</div>
                    <div className="font-[family-name:var(--font-data)] text-[11px] text-latte">{c.phone} · via {c.callerId}</div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] text-coffee">{c.campaign}</div>
                  <div className="text-[11px] text-muted-foreground">Agent {c.agent}</div>
                </div>
                <div><span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium", meta.pill)}>{meta.label}</span></div>
                <div>
                  <div className="flex items-center justify-between font-[family-name:var(--font-data)] text-[11px] tabular-nums">
                    <span className="text-latte">sentiment</span>
                    <span className={good ? "text-success" : "text-warning"}>{c.sentiment}</span>
                  </div>
                  <Meter pct={c.sentiment} color={good ? "var(--color-success)" : "var(--color-warning)"} className="mt-1 w-[120px]" />
                </div>
                <div className="text-right font-[family-name:var(--font-data)] text-[13px] font-semibold text-coffee tabular-nums">{fmt(dur)}</div>
                <div className="flex items-center justify-end gap-1.5">
                  {[
                    { icon: Headphones, label: "Listen", verb: "Listening" },
                    { icon: MessageSquareText, label: "Whisper", verb: "Whispering" },
                    { icon: PhoneForwarded, label: "Barge", verb: "Barged in" },
                  ].map((a) => (
                    <button key={a.label} onClick={() => act(a.verb, c.lead)} title={a.label}
                      className="inline-flex items-center gap-1 rounded-full border border-foam bg-porcelain px-2.5 py-1.5 text-[11px] font-medium text-mocha opacity-0 shadow-glass transition-all hover:border-caramel hover:text-coffee group-hover:opacity-100 max-lg:opacity-100">
                      <a.icon className="size-3.5" /> {a.label}
                    </button>
                  ))}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 py-12 text-center">
            <GlazedTile icon={Activity} tint="var(--color-steam)" size="lg" />
            <p className="font-serif text-lg text-coffee">Nothing in this stage right now</p>
            <p className="text-sm text-mocha">Calls move between stages every few seconds — they&apos;ll appear here live.</p>
          </div>
        )}
      </SectionCard>
      </>)}

      {tab === "My Sessions" && (
        <SectionCard title="My monitoring sessions" count={`${HISTORY.filter((h) => h.mine).length} sessions`}
          help="Sessions you personally ran — every listen, whisper and barge is attributed and logged.">
          <motion.ul variants={rowStagger} initial="hidden" animate="show">
            {HISTORY.filter((h) => h.mine).map((h) => (
              <motion.li key={h.id} variants={rowItem}
                className="grid grid-cols-1 gap-2 border-b border-foam/70 px-4 py-2.5 last:border-b-0 hover:bg-oat/40 lg:grid-cols-[minmax(0,1.8fr)_110px_minmax(0,1.4fr)_100px_minmax(0,1fr)] lg:items-center lg:gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <InitialBean name={h.lead ?? "?"} band="warm" />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-coffee">{h.lead}</div>
                    <div className="truncate font-[family-name:var(--font-data)] text-[11px] text-latte">call {h.id.slice(0, 8)}…</div>
                  </div>
                </div>
                <div><span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium", modeTone[h.mode])}>{h.mode}</span></div>
                <div className="truncate text-[13px] text-mocha">{h.campaign}</div>
                <div className="font-[family-name:var(--font-data)] text-[13px] font-semibold text-coffee tabular-nums">{fmtDur(h.durS)}</div>
                <div className="text-right font-[family-name:var(--font-data)] text-[11px] text-latte">{h.started}</div>
              </motion.li>
            ))}
          </motion.ul>
        </SectionCard>
      )}

      {tab === "History" && (
        <SectionCard title="Monitoring history" count={`${HISTORY.length} sessions`}
          help="Every supervisor session across the org — mode, timing, and how it ended. Kept for compliance.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className={cn("border-b border-foam bg-cream/60 text-left", monoLabel)}>
                  <th className="px-4 py-2 font-medium">Call ID</th><th className="px-4 py-2 font-medium">Mode</th>
                  <th className="px-4 py-2 font-medium">Started</th><th className="px-4 py-2 font-medium">Ended</th>
                  <th className="px-4 py-2 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foam/70">
                {HISTORY.map((h) => (
                  <tr key={h.id} className="hover:bg-oat/30">
                    <td className="px-4 py-2.5 font-data text-xs text-coffee">{h.id.slice(0, 8)}…</td>
                    <td className="px-4 py-2.5"><span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium", modeTone[h.mode])}>{h.mode}</span></td>
                    <td className="px-4 py-2.5 font-data text-xs text-mocha">{h.started}</td>
                    <td className="px-4 py-2.5 font-data text-xs text-mocha">{h.ended}</td>
                    <td className="px-4 py-2.5 font-data text-xs text-muted-foreground">{h.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
