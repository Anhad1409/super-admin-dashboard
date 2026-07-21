"use client";

/* v7 Calls — bucket chips carry their own colors, rows get bean dots +
   score meters, and the expanded detail keeps its transcript. */

import { useEffect, useMemo, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, ChevronRight, Headset, Play, Pause, Volume2, FlaskConical, X, ExternalLink, UserRound, Bot, Download } from "lucide-react";
import { calls, campaigns, timeSeries, leads as rawLeads, type Call } from "@/lib/data";
import { bucketOf, bucketMeta, bucketOrder, type Bucket } from "@/lib/outcomes";
import { formatDuration, formatDateTime, titleCase } from "@/lib/format";
import { BeanDot } from "@/components/coffee/bean-dot";
import { cn } from "@/lib/utils";
import { toast } from "@/components/notifications/toaster";
import { V7Banner, Chip, SearchPill, SectionCard, Meter, monoLabel, rowStagger, rowItem, EASE } from "./kit";

const businessOutcomes = ["All outcomes", "Not Connected", "Ended — No Outcome", "Transferred", "Callback Scheduled", "Do Not Call", "Not Interested", "Wrong Number"];
const preScore = (id: string) => 35 + (id.charCodeAt(id.length - 1) % 45);
// caller-ID pool (round-robin, like the outbound number pool) — deterministic per call
const CALLER_POOL = ["+91 80353 41719", "+91 80353 12770"];
const callerOf = (id: string) => CALLER_POOL[id.charCodeAt(0) % CALLER_POOL.length];
const carrierIdOf = (id: string) =>
  `${id.slice(0, 8)}-${((id.charCodeAt(1) * 2654435761) % 0xffff).toString(16).padStart(4, "0")}-4d88-822c-${((id.charCodeAt(3) * 40503) % 0xffffffff).toString(16).padStart(12, "0").slice(0, 12)}`;

// deterministic multi-turn conversation per call (mirrors the real product's transcripts)
function makeTurns(c: Call, b: string) {
  const first = (c.lead_name || "ji").split(" ")[0];
  const base: { who: "agent" | "user"; text: string }[] = [
    { who: "agent", text: `Namaste! Kya meri baat ${c.lead_name} ji se ho rahi hai?` },
    { who: "user", text: "Hello." },
    { who: "user", text: "क्या?" },
  ];
  if (b === "failed" || b === "dropped") {
    base.push(
      { who: "user", text: "[customer audio unclear, no transcript captured]" },
      { who: "user", text: "Okay." },
      { who: "user", text: "क्या? क्या? किससे बात हो रही है क्या?" },
      { who: "agent", text: `नमस्ते ${first}! आपके Suryoday Small Finance Bank FD के लिए वीडियो KYC अभी pending है। क्या आपको इसे पूरा करने का मौका मिला?` },
      { who: "user", text: "Hello." },
      { who: "agent", text: `नमस्ते ${first}! आपके FD के लिए वीडियो KYC अभी pending है। क्या आप अभी 2 minute निकाल सकते हैं?` },
      { who: "user", text: "नहीं मिला" },
    );
  } else {
    base.push(
      { who: "agent", text: `नमस्ते ${first}! आपके Suryoday Small Finance Bank FD के लिए वीडियो KYC अभी pending है। क्या आपको इसे पूरा करने का मौका मिला?` },
      { who: "user", text: b === "callback" ? "Abhi busy hoon, baad mein call karna." : "Haan, boliye." },
      { who: "agent", text: b === "callback" ? "बिल्कुल! मैं कल इसी समय callback schedule कर देती हूँ। धन्यवाद!" : "धन्यवाद! मैं WhatsApp पर link अभी भेज देती हूँ — 2 minute लगेंगे।" },
      { who: "user", text: b === "callback" ? "Theek hai." : "Okay, bhej do." },
    );
  }
  return base;
}

const nextStepOf = (c: Call, b: string) => {
  if (b === "callback") return { icon: "🕘", text: "Callback scheduled — tomorrow, same window" };
  if (b === "failed") return { icon: "⛔", text: "Max retries reached" };
  if (b === "dropped") return { icon: "🔁", text: "Retry queued (attempt 2 of 3)" };
  return { icon: "✅", text: c.next_action ? titleCase(c.next_action) + " queued" : "No further action" };
};

const leadIdxOf = (phone: string) => rawLeads.findIndex((l) => l.phone === phone);

/* relative + absolute timestamp; relative computed after mount (SSR-safe) */
function RelTime({ iso }: { iso: string }) {
  const [rel, setRel] = useState<string | null>(null);
  useEffect(() => {
    const ms = Date.now() - new Date(iso).getTime();
    if (Number.isNaN(ms)) return;
    const d = Math.floor(ms / 86_400_000), h = Math.floor(ms / 3_600_000), m = Math.floor(ms / 60_000);
    setRel(d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : `${Math.max(1, m)}m ago`);
  }, [iso]);
  return (
    <div className="text-right leading-tight">
      {rel && <div className="font-[family-name:var(--font-data)] text-[12px] font-medium text-mocha">{rel}</div>}
      <div className="font-[family-name:var(--font-data)] text-[10px] text-latte">{formatDateTime(iso)}</div>
    </div>
  );
}

export function V7Calls() {
  const router = useRouter();
  const [filter, setFilter] = useState<Bucket | "all">("all");
  const [campaign, setCampaign] = useState("All campaigns");
  const [q, setQ] = useState("");
  const [bizOutcome, setBizOutcome] = useState("All outcomes");
  const [testMode, setTestMode] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { reached: 0, callback: 0, dropped: 0, failed: 0 };
    for (const call of calls) c[bucketOf(call.disposition)] += 1;
    return c;
  }, []);

  const rows = calls.filter((c) => {
    if (filter !== "all" && bucketOf(c.disposition) !== filter) return false;
    if (q && !(`${c.lead_name} ${c.lead_phone} ${c.id}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const reachedPct = calls.length ? Math.round((counts.reached / calls.length) * 100) : 0;
  const avgDur = calls.length ? Math.round(calls.reduce((s, c) => s + c.duration_seconds, 0) / calls.length) : 0;
  const selectCls = "h-8 rounded-full border border-foam bg-porcelain px-3 text-[12px] text-coffee shadow-glass outline-none focus:border-caramel";

  return (
    <div className="mx-auto max-w-7xl">
      <V7Banner
        eyebrow="Overview"
        title="Calls"
        subtitle={<><span className="font-medium text-coffee">{calls.length} calls</span> on record — expand any row for the full detail.</>}
        stats={[
          { label: "Connect rate", value: `${reachedPct}%`, spark: timeSeries.map((p) => p.completed), color: "var(--color-success)" },
          { label: "Avg duration", value: formatDuration(avgDur), spark: timeSeries.map((p) => p.avg_duration) },
          { label: "Callbacks", value: counts.callback, color: "var(--color-info)" },
        ]}
      />

      {/* filters — buckets carry their own colors */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} dot="var(--color-caramel)" count={calls.length}>All</Chip>
        {bucketOrder.map((b) => (
          <Chip key={b} active={filter === b} onClick={() => setFilter(filter === b ? "all" : b)} dot={bucketMeta[b].color} count={counts[b]}>
            {bucketMeta[b].label}
          </Chip>
        ))}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className={selectCls}>
            <option>All campaigns</option>{campaigns.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
          <select value={bizOutcome} onChange={(e) => setBizOutcome(e.target.value)} className={selectCls}>
            {businessOutcomes.map((b) => <option key={b}>{b}</option>)}
          </select>
          <button onClick={() => setTestMode((v) => !v)}
            className={cn("flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium shadow-glass transition-colors",
              testMode ? "border-steam/40 bg-steam/10 text-steam" : "border-foam bg-porcelain text-latte hover:text-mocha")}>
            <FlaskConical className="size-3.5" /> Test calls
          </button>
          <SearchPill value={q} onChange={setQ} placeholder="Name, phone, or call ID…" className="w-56" />
        </div>
      </div>

      <SectionCard title="Call log" count={`${rows.length} of ${calls.length}`}
        help="Pre/post is the lead score around this call. Expand a row for the summary, transcript and recording.">
        <div className={cn("hidden grid-cols-[20px_minmax(0,1.9fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_150px_76px_minmax(0,1fr)] gap-3 border-b border-foam px-4 py-1.5 lg:grid", monoLabel)}>
          <span /><span>Lead</span><span>Outcome</span><span>Business outcome</span><span>Score pre → post</span><span className="text-right">Duration</span><span className="text-right">Time</span>
        </div>

        <motion.ul variants={rowStagger} initial="hidden" animate="show">
          {rows.map((c) => {
            const b = bucketOf(c.disposition);
            const pre = preScore(c.id);
            const after = Math.max(0, Math.min(100, pre + (b === "reached" ? 14 : b === "callback" ? 6 : b === "dropped" ? -8 : -3)));
            const up = after >= pre;
            const open = expanded === c.id;
            return (
              <Fragment key={c.id}>
                <motion.li variants={rowItem} onClick={() => setExpanded(open ? null : c.id)}
                  className={cn("group grid cursor-pointer grid-cols-1 gap-2 border-b border-foam/70 px-4 py-2 transition-colors last:border-b-0 lg:grid-cols-[20px_minmax(0,1.9fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_150px_76px_minmax(0,1fr)] lg:items-center lg:gap-3",
                    open ? "bg-oat/50" : "hover:bg-oat/40")}>
                  <ChevronRight className={cn("size-4 text-latte transition-transform", open && "rotate-90 text-caramel")} />

                  <div className="flex min-w-0 items-center gap-2.5">
                    <BeanDot color={bucketMeta[b].color} className="size-3" />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-coffee transition-colors group-hover:text-brand-dark">{c.lead_name}</div>
                      <div className="font-[family-name:var(--font-data)] text-[11px] text-latte">{c.lead_phone}</div>
                    </div>
                  </div>

                  <div>
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium", bucketMeta[b].badge)}>
                      {c.disposition_label || titleCase(c.disposition)}
                    </span>
                  </div>

                  <div className="truncate text-[13px] text-mocha">{c.disposition_category ? titleCase(c.disposition_category) : "—"}</div>

                  <div>
                    <div className="flex items-center gap-1.5 font-[family-name:var(--font-data)] text-[12px] tabular-nums">
                      <span className="text-latte">{pre}</span>
                      <span className="text-latte">→</span>
                      <span className="font-semibold text-coffee">{after}</span>
                      <span className={cn("text-[10px]", up ? "text-success" : "text-danger")}>{up ? "▲" : "▼"}{Math.abs(after - pre)}</span>
                    </div>
                    <Meter pct={after} color={up ? "var(--color-success)" : "var(--color-danger)"} className="mt-1 w-[120px]" />
                  </div>

                  <div className="text-right font-[family-name:var(--font-data)] text-[13px] text-coffee tabular-nums">{formatDuration(c.duration_seconds)}</div>
                  <RelTime iso={c.initiated_at} />
                </motion.li>

                {/* expanded call detail */}
                <AnimatePresence initial={false}>
                  {open && (() => {
                    const outcomeLabel = c.disposition_label || titleCase(c.disposition);
                    const plain = b === "reached" ? `${c.lead_name} engaged on the call — ${outcomeLabel}.`
                      : b === "callback" ? `${c.lead_name} asked to be called back later.`
                      : b === "dropped" ? `Customer talked (${formatDuration(c.duration_seconds)}), but no clear outcome was captured.`
                      : `Couldn't connect — ${outcomeLabel.toLowerCase()}.`;
                    const step = nextStepOf(c, b);
                    const turns = makeTurns(c, b);
                    const userTurns = turns.filter((t) => t.who === "user").length;
                    const isPlaying = playing === c.id;
                    const TechRow = ({ k, v, code, hint }: { k: string; v: React.ReactNode; code?: string; hint: string }) => (
                      <div className="border-b border-foam/60 py-2 last:border-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-28 shrink-0 text-[12px] text-muted-foreground">{k}</span>
                          <span className="min-w-0 text-[13px] font-medium text-coffee">{v}</span>
                          {code && <code className="rounded bg-oat/70 px-1.5 py-0.5 font-[family-name:var(--font-data)] text-[10px] text-mocha">{code}</code>}
                        </div>
                        <p className="mt-0.5 pl-[120px] text-[10.5px] leading-snug text-latte max-sm:pl-0">{hint}</p>
                      </div>
                    );
                    return (
                      <motion.li key={`${c.id}-dossier`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: EASE }} className="overflow-hidden border-b border-foam/70 bg-oat/30 last:border-b-0">
                        <div className="space-y-4 px-4 py-4 lg:px-8">
                          <div className="rounded-xl border border-foam bg-porcelain px-4 py-3 shadow-glass">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium", bucketMeta[b].badge)}>{outcomeLabel}</span>
                              <span className="font-[family-name:var(--font-data)] text-[11px] text-latte">· {formatDuration(c.duration_seconds)}</span>
                            </div>
                            <p className="mt-1.5 text-sm text-coffee/90">{plain}</p>
                            <p className="mt-1 text-[13px] text-mocha">Next step: <span className="font-medium text-coffee">{step.icon} {step.text}</span></p>
                          </div>

                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]">
                            <div className="space-y-4">
                              <div className="rounded-xl border border-foam bg-porcelain p-4 shadow-glass">
                                <div className={cn(monoLabel, "text-[10.5px]")}>Technical details (for support)</div>
                                <p className="mt-1 text-[11px] text-muted-foreground">Reference codes and diagnostics — handy if you contact support. You don&apos;t need these day to day.</p>
                                <div className="mt-2.5">
                                  <TechRow k="Call status" v={<span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", (c.status || "completed") === "completed" ? "border-success/25 bg-success/12 text-success" : bucketMeta[b].badge)}>{titleCase(c.status || "completed")}</span>} code={c.status || "completed"} hint="Whether the call connected and how it ended." />
                                  <TechRow k="Result code" v={<span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", bucketMeta[b].badge)}>{outcomeLabel}</span>} code={c.disposition} hint="The detailed outcome recorded for this call." />
                                  <TechRow k="Decided by" v="Automatically, from the call's facts" hint="Where this call's result came from — the phone system, the AI agent, or after-call review." />
                                  <TechRow k="Duration" v={formatDuration(c.duration_seconds)} hint="Connected talk time, excluding ring time." />
                                  <TechRow k="Reference ID" v={<span className="break-all font-[family-name:var(--font-data)] text-[11px]">{c.id}</span>} hint="This call's ID — quote it if you report a problem to support." />
                                  <TechRow k="Carrier ID" v={<span className="break-all font-[family-name:var(--font-data)] text-[11px]">{carrierIdOf(c.id)}</span>} hint="The phone provider's (plivo) own ID for this call." />
                                </div>
                              </div>
                              <div className="rounded-xl border border-foam bg-porcelain p-4 shadow-glass">
                                <div className={cn(monoLabel, "text-[10.5px]")}>Score</div>
                                <p className="mt-1.5 text-sm text-coffee/90">
                                  Score <b className="tabular-nums">{b === "failed" ? pre : after}</b>{b === "failed"
                                    ? " — from the upload, not yet validated by a conversation."
                                    : <> — updated from this conversation <span className={cn("font-[family-name:var(--font-data)] text-[11px]", up ? "text-success" : "text-danger")}>({pre} → {after})</span>.</>}
                                </p>
                                <Meter pct={b === "failed" ? pre : after} color={up ? "var(--color-success)" : "var(--color-warning)"} className="mt-2" />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="rounded-xl border border-foam bg-porcelain p-4 shadow-glass">
                                <div className={cn(monoLabel, "text-[10.5px]")}>Conversation ({userTurns} customer turns)</div>
                                <div className="mt-2.5 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                                  {turns.map((t2, k) => (
                                    <div key={k} className={cn("max-w-[88%]", t2.who === "user" && "ml-auto")}>
                                      <div className={cn("mb-0.5 flex items-center gap-1 font-[family-name:var(--font-data)] text-[9px] uppercase tracking-wider text-latte", t2.who === "user" && "justify-end")}>
                                        {t2.who === "agent" ? <Bot className="size-2.5" /> : <UserRound className="size-2.5" />} {t2.who === "agent" ? "Agent" : "Customer"}
                                      </div>
                                      <div className={cn("rounded-xl px-2.5 py-1.5 text-xs leading-relaxed", t2.who === "agent" ? "bg-oat/60 text-coffee" : "bg-steam/10 text-coffee", t2.text.startsWith("[") && "italic text-latte")}>{t2.text}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="rounded-xl border border-foam bg-porcelain p-3.5 shadow-glass">
                                <div className={cn(monoLabel, "mb-2 text-[10.5px]")}>Recording</div>
                                <div className="flex items-center gap-2.5">
                                  <button onClick={(e) => { e.stopPropagation(); setPlaying(isPlaying ? null : c.id); }} aria-label={isPlaying ? "Pause recording" : "Play recording"}
                                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark">
                                    {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                                  </button>
                                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foam">
                                    <div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel"
                                      style={{ width: isPlaying ? "100%" : "0%", transition: isPlaying ? `width ${Math.max(2, c.duration_seconds)}s linear` : "none" }} />
                                  </div>
                                  <span className="font-[family-name:var(--font-data)] text-[11px] text-latte">0:00 / {formatDuration(c.duration_seconds)}</span>
                                  <Volume2 className="size-3.5 text-latte" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { const i = leadIdxOf(c.lead_phone); if (i >= 0) router.push(`/leads/${i}`); }}
                              className="inline-flex items-center gap-1.5 rounded-full bg-coffee px-3.5 py-1.5 text-xs font-semibold text-cream shadow-cta hover:bg-espresso"><UserRound className="size-3.5" /> Open lead</button>
                            <button onClick={() => setDetailId(c.id)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-porcelain px-3.5 py-1.5 text-xs font-medium text-mocha shadow-glass hover:border-caramel hover:text-coffee"><ExternalLink className="size-3.5" /> Full details</button>
                            <button onClick={() => router.push("/handoff")}
                              className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-porcelain px-3.5 py-1.5 text-xs font-medium text-mocha shadow-glass hover:border-caramel hover:text-coffee"><Headset className="size-3.5" /> Open in handoff</button>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })()}
                </AnimatePresence>
              </Fragment>
            );
          })}
        </motion.ul>

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <PhoneOff className="size-5 text-latte" />
            <p className="font-serif text-lg text-coffee">No calls yet</p>
            <p className="text-sm text-mocha">Calls appear here once a campaign starts dialing.</p>
          </div>
        )}
      </SectionCard>

      {detailId && (() => {
        const c = calls.find((x) => x.id === detailId);
        if (!c) return null;
        return <CallDetailModal c={c} b={bucketOf(c.disposition)} onClose={() => setDetailId(null)} />;
      })()}
    </div>
  );
}

/* ---------- Full-details modal: Transcript / Pipeline Events / Latency / Recording ---------- */
function CallDetailModal({ c, b, onClose }: { c: Call; b: Bucket; onClose: () => void }) {
  const [tab, setTab] = useState<"Transcript" | "Pipeline Events" | "Latency" | "Recording">("Transcript");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const turns = makeTurns(c, b);
  const lat = turns.map((_, i) => ({ turn: i + 1, llm: 280 + ((c.id.charCodeAt(i % c.id.length) * (i + 2)) % 900), tts: 120 + ((c.id.charCodeAt((i + 4) % c.id.length) * 7) % 340) }));
  const avg = Math.round(lat.reduce((a, l) => a + l.llm + l.tts, 0) / lat.length);
  const p95 = Math.max(...lat.map((l) => l.llm + l.tts));
  const events = [
    { t: "+0.0s", e: "call.initiated", d: `via plivo · ${callerOf(c.id)}` },
    { t: "+2.1s", e: "provider.ringing", d: "carrier accepted" },
    { t: "+6.4s", e: "provider.answered", d: "media bridged · pipecat" },
    { t: "+6.6s", e: "stt.session.start", d: "deepgram nova-3 · hi" },
    ...lat.slice(0, 5).map((l, i) => ({ t: `+${(8 + i * 9).toFixed(1)}s`, e: `turn.${l.turn}`, d: `llm ${l.llm}ms · tts ${l.tts}ms` })),
    { t: `+${Math.max(10, c.duration_seconds - 2)}s`, e: "recording.saved", d: `${formatDuration(c.duration_seconds)} · wav` },
    { t: `+${c.duration_seconds}s`, e: "call.ended", d: `reason=${c.disposition}` },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-espresso/35 backdrop-blur-[2px]" />
      <div onClick={(e) => e.stopPropagation()} className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-card-lg">
        <div className="border-b border-foam px-5 py-4">
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif text-xl font-semibold text-coffee">Call Detail</h3>
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", (c.status || "completed") === "completed" ? "border-success/25 bg-success/12 text-success" : bucketMeta[b].badge)}>{titleCase(c.status || "completed")}</span>
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", bucketMeta[b].badge)}>{c.disposition_label || titleCase(c.disposition)}</span>
            <button onClick={onClose} aria-label="Close" className="ml-auto text-muted-foreground hover:text-coffee"><X className="size-4" /></button>
          </div>
          <div className="mt-0.5 break-all font-[family-name:var(--font-data)] text-[11px] text-latte">{c.id}</div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-oat/40 px-3.5 py-2.5">
            <div>
              <div className="text-sm font-semibold text-coffee">{c.lead_name} <span className="font-normal text-muted-foreground">· {c.lead_phone}</span></div>
              <div className="text-[11px] text-muted-foreground">{formatDateTime(c.initiated_at)} · via plivo · pipecat</div>
            </div>
            <div className="flex gap-5 text-right">
              <div><div className={monoLabel}>Duration</div><div className="font-serif text-[15px] font-semibold text-coffee tabular-nums">{formatDuration(c.duration_seconds)}</div></div>
              <div><div className={monoLabel}>Turns</div><div className="font-serif text-[15px] font-semibold text-coffee tabular-nums">{turns.filter((t) => t.who === "user").length}</div></div>
              <div><div className={monoLabel}>Cost</div><div className="font-serif text-[15px] font-semibold text-coffee tabular-nums">₹{Math.max(8, Math.ceil(c.duration_seconds / 60) * 8)}</div></div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(["Transcript", "Pipeline Events", "Latency", "Recording"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all", tab === t ? "border-caramel bg-brand text-brand-foreground shadow-cta" : "border-foam bg-porcelain text-mocha hover:border-latte")}>{t}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "Transcript" && (
            <div>
              <div className="mb-2 flex items-center justify-between"><span className={monoLabel}>Transcript</span><span className="font-[family-name:var(--font-data)] text-[11px] text-latte">{turns.length} messages</span></div>
              <div className="space-y-1.5">
                {turns.map((t, i) => (
                  <div key={i}>
                    <div className="mb-0.5 flex items-center gap-1 font-[family-name:var(--font-data)] text-[9px] uppercase tracking-wider text-latte">
                      {t.who === "agent" ? <Bot className="size-2.5" /> : <UserRound className="size-2.5" />} {t.who === "agent" ? "Agent" : "User"}
                    </div>
                    <div className={cn("rounded-lg px-3 py-2 text-[13px] leading-relaxed", t.who === "agent" ? "bg-caramel/10 text-coffee" : "bg-steam/10 text-coffee", t.text.startsWith("[") && "italic text-latte")}>{t.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "Pipeline Events" && (
            <div className="space-y-1">
              {events.map((ev, i) => (
                <div key={i} className="flex items-baseline gap-3 rounded-lg px-2 py-1.5 hover:bg-oat/40">
                  <span className="w-14 shrink-0 text-right font-[family-name:var(--font-data)] text-[11px] text-latte tabular-nums">{ev.t}</span>
                  <span className="font-[family-name:var(--font-data)] text-[12px] font-semibold text-coffee">{ev.e}</span>
                  <span className="truncate font-[family-name:var(--font-data)] text-[11px] text-muted-foreground">{ev.d}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "Latency" && (
            <div>
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-foam bg-oat/40 px-3.5 py-2.5"><div className={monoLabel}>Avg turn latency</div><div className="mt-1 font-serif text-xl font-semibold text-coffee tabular-nums">{avg} ms</div></div>
                <div className="rounded-xl border border-foam bg-oat/40 px-3.5 py-2.5"><div className={monoLabel}>Slowest turn</div><div className="mt-1 font-serif text-xl font-semibold text-coffee tabular-nums">{p95} ms</div></div>
              </div>
              <div className="space-y-1.5">
                {lat.map((l) => (
                  <div key={l.turn} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 font-[family-name:var(--font-data)] text-[11px] text-mocha">turn {l.turn}</span>
                    <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-foam">
                      <div className="h-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${(l.llm / (p95 || 1)) * 100}%` }} />
                      <div className="h-full bg-steam/70" style={{ width: `${(l.tts / (p95 || 1)) * 100}%` }} />
                    </div>
                    <span className="w-24 shrink-0 text-right font-[family-name:var(--font-data)] text-[10.5px] text-muted-foreground tabular-nums">{l.llm}+{l.tts} ms</span>
                  </div>
                ))}
              </div>
              <p className="mt-2.5 text-[11px] text-muted-foreground"><span className="mr-3 inline-flex items-center gap-1"><span className="inline-block h-2 w-4 rounded-full bg-gradient-to-r from-mocha to-caramel" /> LLM</span><span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-4 rounded-full bg-steam/70" /> TTS</span></p>
            </div>
          )}
          {tab === "Recording" && (
            <div className="rounded-xl border border-foam bg-oat/30 p-5 text-center">
              <div className="flex items-center justify-center gap-1 py-4">
                {Array.from({ length: 42 }, (_, i) => (
                  <span key={i} className="w-1 rounded-full bg-caramel/70" style={{ height: `${8 + ((c.id.charCodeAt(i % c.id.length) * (i + 1)) % 28)}px` }} />
                ))}
              </div>
              <div className="mx-auto flex max-w-md items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-cta"><Play className="size-4" /></span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full w-0 rounded-full bg-gradient-to-r from-mocha to-caramel" /></div>
                <span className="font-[family-name:var(--font-data)] text-[11px] text-latte">0:00 / {formatDuration(c.duration_seconds)}</span>
              </div>
              <button onClick={() => toast({ title: "Download started", body: `${c.id.slice(0, 8)}.wav — ${formatDuration(c.duration_seconds)}.`, severity: "success" })}
                className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-foam bg-porcelain px-3.5 py-1.5 text-xs font-medium text-mocha shadow-glass hover:border-caramel hover:text-coffee"><Download className="size-3.5" /> Download recording</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
