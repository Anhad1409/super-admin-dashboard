"use client";

/* Test Sessions — simulated calls graded before launch, with a transcript viewer
   that shows template variables unsubstituted (variable-substitution testing). */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Play, ChevronRight, X, Volume2, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { Button } from "@/components/ui/button";
import { Chip, Equalizer, EASE } from "@/components/v7/kit";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

const mono = "font-[family-name:var(--font-data)]";

type Status = "pending" | "running" | "completed" | "failed";
type Disposition = "cold" | "warm" | "hot";
type Session = {
  id: string;
  campaign: string;
  persona: string;
  status: Status;
  disposition: Disposition | null;
  quality: number | null; // 0-100, null until completed
  turns: number;
  startedAgoMin: number; // deterministic relative time (no Date.now in render)
};

const CAMPAIGNS = ["Outreach campaign", "IOB : Mobile Banking Activation"];
const PERSONAS = ["Skeptical customer", "Busy professional", "Interested but cautious"];

const SEED: Session[] = [
  { id: "TS-1024", campaign: CAMPAIGNS[0], persona: PERSONAS[0], status: "completed", disposition: "cold", quality: 36, turns: 14, startedAgoMin: 12 },
  { id: "TS-1023", campaign: CAMPAIGNS[1], persona: PERSONAS[1], status: "completed", disposition: "warm", quality: 62, turns: 20, startedAgoMin: 48 },
  { id: "TS-1022", campaign: CAMPAIGNS[0], persona: PERSONAS[2], status: "running", disposition: null, quality: null, turns: 6, startedAgoMin: 3 },
  { id: "TS-1021", campaign: CAMPAIGNS[1], persona: PERSONAS[2], status: "completed", disposition: "hot", quality: 88, turns: 24, startedAgoMin: 126 },
  { id: "TS-1020", campaign: CAMPAIGNS[0], persona: PERSONAS[1], status: "failed", disposition: null, quality: null, turns: 3, startedAgoMin: 1560 },
];

const FILTERS = ["All", "Pending", "Running", "Completed", "Failed"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_META: Record<Status, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending", cls: "border-foam bg-oat/50 text-mocha", Icon: Clock },
  running: { label: "Running", cls: "border-steam/40 bg-steam/10 text-steam", Icon: Loader2 },
  completed: { label: "Completed", cls: "border-success/30 bg-success/10 text-success", Icon: CheckCircle2 },
  failed: { label: "Failed", cls: "border-danger/30 bg-danger/10 text-danger", Icon: XCircle },
};

const DISPO_CLS: Record<Disposition, string> = {
  cold: "border-info/30 bg-info/10 text-info",
  warm: "border-warning/30 bg-warning/10 text-warning",
  hot: "border-success/30 bg-success/10 text-success",
};

const qualityCls = (q: number) => (q < 40 ? "text-danger" : q < 70 ? "text-warning" : "text-success");

function relTime(min: number) {
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  if (min < 1440) return `${Math.floor(min / 60)}h ago`;
  return `${Math.floor(min / 1440)}d ago`;
}

/* Template vars appear literally ({customer_name}) — the harness verifies
   substitution separately, so testers can see exactly where each slot lands. */
const TRANSCRIPT: { role: "agent" | "customer"; text: string }[] = [
  { role: "agent", text: "Namaste {customer_name} ji, main {bank_name} ki taraf se Riya bol rahi hoon. Kya main aapke personal loan {loan_id} ke baare mein do minute baat kar sakti hoon?" },
  { role: "customer", text: "Haan boliye, par jaldi — main abhi office mein hoon." },
  { role: "agent", text: "Ji bilkul. Aapki {emi_amount} ki EMI {due_date} ko due thi, jo abhi tak receive nahi hui hai. Kya payment mein koi dikkat aayi?" },
  { role: "customer", text: "Arre haan, is month salary thodi late aayi hai. Next week tak kar dunga." },
  { role: "agent", text: "Samajh sakti hoon. Agar aap {promise_date} tak payment kar dete hain toh late fee waive ho jayegi. Payment link WhatsApp par bhej doon?" },
  { role: "customer", text: "Ek minute — yeh call bank se hi hai na? Aajkal bahut fraud calls aa rahi hain." },
  { role: "agent", text: "Bilkul sahi sawaal, {customer_name} ji. Main sirf aapke registered number par baat kar rahi hoon, aur main kabhi bhi OTP ya card details nahi maangungi." },
  { role: "customer", text: "Theek hai, chalo. Wednesday tak pakka kar dunga payment." },
  { role: "agent", text: "Dhanyavaad ji. Note kar liya — {promise_date} tak {emi_amount} ka payment. Aapko confirmation SMS mil jayega. Aapka din shubh rahe!" },
  { role: "customer", text: "Okay, thank you." },
];

export default function TestingPage() {
  const [sessions, setSessions] = useState<Session[]>(SEED);
  const [filter, setFilter] = useState<Filter>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const nextId = useRef(1025);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const startSession = () => {
    const n = nextId.current++;
    const id = `TS-${n}`;
    const campaign = CAMPAIGNS[n % CAMPAIGNS.length];
    const persona = PERSONAS[n % PERSONAS.length];
    setSessions((prev) => [
      { id, campaign, persona, status: "running", disposition: null, quality: null, turns: 0, startedAgoMin: 0 },
      ...prev,
    ]);
    toast({ title: "Test session started", body: `${persona} vs ${campaign}.`, severity: "info" });
    timers.current.push(
      setTimeout(() => {
        const quality = 55 + Math.floor(Math.random() * 40);
        const turns = 16 + Math.floor(Math.random() * 9);
        const disposition: Disposition = quality >= 80 ? "hot" : quality >= 65 ? "warm" : "cold";
        setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "completed", quality, turns, disposition } : s)));
        toast({ title: "Test session completed", body: `${id} graded ${quality}/100 · ${disposition} disposition · ${turns} turns.`, severity: "success" });
      }, 2000),
    );
  };

  const openSession = (s: Session) => {
    if (s.status === "running" || s.status === "pending") {
      toast({ title: "Transcript not ready", body: `${s.id} is still ${s.status} — the transcript unlocks when it completes.`, severity: "info" });
      return;
    }
    setOpenId(s.id);
  };

  const counts = FILTERS.reduce<Record<Filter, number>>((acc, f) => {
    acc[f] = f === "All" ? sessions.length : sessions.filter((s) => STATUS_META[s.status].label === f).length;
    return acc;
  }, {} as Record<Filter, number>);
  const rows = sessions.filter((s) => filter === "All" || STATUS_META[s.status].label === filter);
  const open = sessions.find((s) => s.id === openId) ?? null;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Test Sessions"
        subtitle="Simulated calls that grade your agent before real leads hear it."
        actions={
          <Button onClick={startSession} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">
            <Plus className="size-4" /> New test session
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)} count={counts[f]}>{f}</Chip>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
        <div className="divide-y divide-foam">
          {rows.map((s) => {
            const m = STATUS_META[s.status];
            return (
              <button key={s.id} onClick={() => openSession(s)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-oat/30">
                <span className={cn("inline-flex w-[118px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium", m.cls)}>
                  <m.Icon className={cn("size-3", s.status === "running" && "animate-spin")} /> {m.label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-coffee">{s.campaign}</span>
                  <span className="block truncate text-xs text-muted-foreground">{s.persona} · {s.id}</span>
                </span>
                {s.status === "running" && <Equalizer className="hidden sm:flex" />}
                <span className={cn(mono, "hidden w-16 text-right text-[13px] tabular-nums sm:block", s.quality != null ? qualityCls(s.quality) : "text-latte")}>
                  {s.quality != null ? `${s.quality}/100` : "—"}
                </span>
                <span className="hidden w-16 text-right text-xs text-muted-foreground tabular-nums md:block">{s.turns} turns</span>
                <span className="hidden w-20 text-right text-xs text-muted-foreground md:block">{relTime(s.startedAgoMin)}</span>
                <ChevronRight className="size-4 shrink-0 text-latte" />
              </button>
            );
          })}
          {rows.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">No {filter.toLowerCase()} sessions yet.</p>
          )}
        </div>
      </div>

      {/* transcript viewer — porcelain slide-over */}
      <AnimatePresence>
        {open && (
          <motion.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex justify-end"
            style={{ background: "rgba(42,26,15,0.4)", backdropFilter: "blur(3px)" }}
            onClick={() => setOpenId(null)}>
            <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex h-full w-full max-w-xl flex-col border-l border-foam bg-porcelain shadow-glass"
              onClick={(e) => e.stopPropagation()}>

              <header className="border-b border-foam px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg font-semibold text-coffee">Test Session Transcript</h2>
                  <button onClick={() => setOpenId(null)} aria-label="Close"
                    className="grid size-8 place-items-center rounded-full border border-foam text-mocha hover:border-latte hover:text-coffee">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
                    open.disposition ? DISPO_CLS[open.disposition] : "border-foam bg-oat/50 text-mocha")}>
                    Disposition: {open.disposition ?? "—"}
                  </span>
                  <span className={cn(mono, "rounded-full border border-foam bg-oat/50 px-2.5 py-0.5 text-[11px] text-coffee tabular-nums")}>
                    Quality: {open.quality != null ? `${open.quality}/100` : "—"}
                  </span>
                  <span className="rounded-full border border-foam bg-oat/50 px-2.5 py-0.5 text-[11px] text-mocha tabular-nums">
                    {open.turns} turns
                  </span>
                </div>
              </header>

              <div className="mx-5 mt-4 flex items-center justify-between gap-3 rounded-xl border border-foam bg-oat/40 px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm text-coffee">
                  <Volume2 className="size-4 text-caramel" /> Listen to transcript
                </span>
                <Button size="sm" onClick={() => toast({ title: "Playing synthesized audio…", body: `${open.id} · campaign voice, all turns.`, severity: "info" })}
                  className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">
                  <Play className="size-3.5" /> Play All
                </Button>
              </div>
              <p className="mx-5 mt-2 text-[11px] text-muted-foreground">
                Template variables like <span className={cn(mono, "text-caramel")}>{"{customer_name}"}</span> render unsubstituted in test mode so you can verify slot placement.
              </p>

              <div className="mt-3 flex-1 space-y-3 overflow-y-auto px-5 pb-5">
                {TRANSCRIPT.map((t, i) => (
                  <div key={i} className={cn("flex flex-col", t.role === "customer" && "items-end")}>
                    <span className={cn(mono, "mb-1 text-[10px] uppercase tracking-[0.14em]", t.role === "agent" ? "text-mocha" : "text-caramel")}>
                      {t.role === "agent" ? "Agent" : "Customer"}
                    </span>
                    <div className={cn("max-w-[85%] rounded-2xl border px-3.5 py-2.5 text-[13px] leading-relaxed text-coffee",
                      t.role === "agent" ? "rounded-tl-sm border-foam bg-oat/60" : "rounded-tr-sm border-caramel/20 bg-caramel/15")}>
                      {t.text}
                    </div>
                  </div>
                ))}
              </div>

              <footer className="border-t border-foam px-5 py-3.5 text-right">
                <Button variant="outline" onClick={() => setOpenId(null)} className="border-foam text-mocha hover:text-coffee">Close</Button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
