"use client";

/* Campaign Sequences — multi-step engagement cadences across call, SMS,
   WhatsApp and email. All interactive state is client-side mock. */

import { Fragment, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Phone, MessageSquare, MessageCircle, Mail, GitBranch, ChevronRight, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip, EASE, Equalizer } from "@/components/v7/kit";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { monoLabel } from "@/components/v7/kit";

const mono = "font-[family-name:var(--font-data)]";

type Channel = "call" | "sms" | "whatsapp" | "email";
type Status = "draft" | "active" | "paused" | "completed";
/* waitDays = pause after this step, before the next one runs */
type Step = { channel: Channel; waitDays: number };
type Sequence = { id: string; name: string; status: Status; enrolled: number; completed: number; converted: number; steps: Step[] };

const CHANNELS: Record<Channel, { label: string; icon: LucideIcon }> = {
  call: { label: "Call", icon: Phone },
  sms: { label: "SMS", icon: MessageSquare },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  email: { label: "Email", icon: Mail },
};
const CHANNEL_KEYS = Object.keys(CHANNELS) as Channel[];

const STATUSES: Status[] = ["draft", "active", "paused", "completed"];
const statusTone: Record<Status, string> = {
  draft: "border-foam bg-oat text-mocha",
  active: "border-steam/40 bg-steam/10 text-steam",
  paused: "border-warning/40 bg-warning/10 text-warning",
  completed: "border-info/40 bg-info/10 text-info",
};

const SEED: Sequence[] = [
  {
    id: "seq-1",
    name: "EMI Recovery — 5 touches",
    status: "active",
    enrolled: 180,
    completed: 64,
    converted: 21,
    steps: [
      { channel: "call", waitDays: 2 },
      { channel: "sms", waitDays: 1 },
      { channel: "call", waitDays: 3 },
      { channel: "email", waitDays: 0 },
      { channel: "whatsapp", waitDays: 0 },
    ],
  },
];

type DraftStep = Step & { uid: number };
const freshSteps = (): DraftStep[] => [{ uid: 0, channel: "call", waitDays: 1 }];

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>(SEED);
  const [filter, setFilter] = useState<"all" | Status>("all");

  // builder slide-over
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<DraftStep[]>(freshSteps());
  const nextUid = useRef(1);

  const counts = useMemo(() => {
    const c = { draft: 0, active: 0, paused: 0, completed: 0 } as Record<Status, number>;
    for (const s of sequences) c[s.status] += 1;
    return c;
  }, [sequences]);

  const visible = sequences.filter((s) => filter === "all" || s.status === filter);

  const openBuilder = () => {
    setName("");
    setSteps(freshSteps());
    nextUid.current = 1;
    setOpen(true);
  };

  const setStatus = (id: string, status: Status, title: string, body: string) => {
    setSequences((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    toast({ title, body, severity: "success" });
  };

  const duplicate = (s: Sequence) => {
    const copy: Sequence = { ...s, id: `seq-${Date.now()}`, name: `${s.name} (copy)`, status: "draft", enrolled: 0, completed: 0, converted: 0 };
    setSequences((prev) => [copy, ...prev]);
    toast({ title: "Sequence duplicated", body: `"${copy.name}" saved as a draft.`, severity: "success" });
  };

  const createSequence = () => {
    const n = name.trim();
    if (!n) {
      toast({ title: "Name required", body: "Give the sequence a name before creating it.", severity: "warning" });
      return;
    }
    const seq: Sequence = {
      id: `seq-${Date.now()}`,
      name: n,
      status: "draft",
      enrolled: 0,
      completed: 0,
      converted: 0,
      steps: steps.map(({ channel, waitDays }) => ({ channel, waitDays })),
    };
    setSequences((prev) => [seq, ...prev]);
    setOpen(false);
    setFilter("all");
    toast({ title: "Sequence created", body: `"${n}" saved as a draft with ${steps.length} step${steps.length === 1 ? "" : "s"}.`, severity: "success" });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Campaign Sequences"
        subtitle="Multi-step engagement sequences across call, SMS, WhatsApp, and email."
        actions={
          <Button onClick={openBuilder} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">
            <Plus className="size-4" /> New Sequence
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} count={sequences.length}>All</Chip>
        {STATUSES.map((st) => (
          <Chip key={st} active={filter === st} onClick={() => setFilter(st)} count={counts[st]}>
            {st.charAt(0).toUpperCase() + st.slice(1)}
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-foam bg-porcelain p-12 text-center shadow-glass">
          <GitBranch className="mx-auto size-8 text-latte" />
          <p className="mt-3 text-sm text-muted-foreground">No sequences found. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((s) => (
            <div key={s.id} className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-serif text-lg font-semibold text-coffee">{s.name}</h3>
                  <span className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize", statusTone[s.status])}>
                    {s.status === "active" && <Equalizer className="h-3" />}
                    {s.status}
                  </span>
                </div>
                {s.status === "draft" && (
                  <Button size="sm" variant="outline" className="border-foam text-mocha hover:text-coffee"
                    onClick={() => setStatus(s.id, "active", "Sequence activated", `Enrollment is now live for "${s.name}".`)}>Activate</Button>
                )}
                {s.status === "active" && (
                  <Button size="sm" variant="outline" className="border-foam text-mocha hover:text-coffee"
                    onClick={() => setStatus(s.id, "paused", "Sequence paused", `New steps are on hold for "${s.name}".`)}>Pause</Button>
                )}
                {s.status === "paused" && (
                  <Button size="sm" variant="outline" className="border-foam text-mocha hover:text-coffee"
                    onClick={() => setStatus(s.id, "active", "Sequence resumed", `"${s.name}" is running again.`)}>Resume</Button>
                )}
                {s.status === "completed" && (
                  <Button size="sm" variant="outline" className="border-foam text-mocha hover:text-coffee" onClick={() => duplicate(s)}>Duplicate</Button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                {([["Enrolled", s.enrolled], ["Completed", s.completed], ["Converted", s.converted]] as const).map(([label, v], i) => (
                  <span key={label} className="flex items-center gap-1.5">
                    {i > 0 && <span className="mr-3.5 text-latte">·</span>}
                    <span className={monoLabel}>{label}</span>
                    <span className="text-sm font-semibold text-coffee tabular-nums">{v}</span>
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                {s.steps.map((st, i) => {
                  const Icon = CHANNELS[st.channel].icon;
                  return (
                    <Fragment key={i}>
                      <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-foam bg-cream/60 px-2.5 py-1.5 text-xs font-medium text-coffee">
                        <Icon className="size-3.5" style={{ color: st.channel === "call" ? "var(--color-caramel)" : st.channel === "email" ? "var(--color-blueberry)" : "var(--color-steam)" }} /> {CHANNELS[st.channel].label}
                      </span>
                      {i < s.steps.length - 1 &&
                        (st.waitDays > 0 ? (
                          <span className="flex shrink-0 items-center gap-1">
                            <span className="h-px w-2.5 bg-latte/60" />
                            <span className={`${mono} text-[10px] text-mocha tabular-nums`}>{st.waitDays}d</span>
                            <ChevronRight className="size-3 text-latte" />
                          </span>
                        ) : (
                          <ChevronRight className="size-3.5 shrink-0 text-latte" />
                        ))}
                    </Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* builder slide-over */}
      <AnimatePresence>
        {open && (
          <motion.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex justify-end"
            style={{ background: "rgba(42,26,15,0.4)", backdropFilter: "blur(3px)" }}
            onClick={() => setOpen(false)}>
            <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex h-full w-full max-w-md flex-col border-l border-foam bg-porcelain shadow-glass"
              onClick={(e) => e.stopPropagation()}>

              <header className="flex items-center justify-between border-b border-foam px-5 py-4">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-coffee">New Sequence</h2>
                  <p className="text-xs text-muted-foreground">Chain steps across channels with wait times between them.</p>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close"
                  className="grid size-8 place-items-center rounded-full border border-foam text-mocha hover:border-latte hover:text-coffee">
                  <X className="size-4" />
                </button>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div>
                  <label htmlFor="seq-name" className={monoLabel}>Sequence name</label>
                  <Input id="seq-name" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Renewal reminder — 3 touches" className="mt-1.5 border-foam bg-cream/40" />
                </div>

                <div className="space-y-3">
                  {steps.map((st, i) => (
                    <div key={st.uid} className="rounded-xl border border-foam bg-cream/50 p-3">
                      <div className="flex items-center justify-between">
                        <span className={monoLabel}>Step {i + 1}</span>
                        <button
                          onClick={() => setSteps((prev) => prev.filter((p) => p.uid !== st.uid))}
                          disabled={steps.length === 1} aria-label={`Remove step ${i + 1}`}
                          className="grid size-7 place-items-center rounded-full text-mocha hover:text-danger disabled:cursor-not-allowed disabled:opacity-35">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {CHANNEL_KEYS.map((c) => {
                          const Icon = CHANNELS[c].icon;
                          const active = st.channel === c;
                          return (
                            <button key={c}
                              onClick={() => setSteps((prev) => prev.map((p) => (p.uid === st.uid ? { ...p, channel: c } : p)))}
                              className={cn(
                                "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                                active
                                  ? "border-caramel bg-brand text-brand-foreground shadow-cta"
                                  : "border-foam bg-porcelain text-mocha hover:border-latte hover:text-coffee",
                              )}>
                              <Icon className="size-3" /> {CHANNELS[c].label}
                            </button>
                          );
                        })}
                      </div>

                      <label className="mt-2.5 flex items-center gap-2 text-[11px] text-mocha">
                        Wait before next step
                        <Input type="number" min={0} max={30} value={st.waitDays}
                          onChange={(e) => {
                            const v = Math.min(30, Math.max(0, Number(e.target.value) || 0));
                            setSteps((prev) => prev.map((p) => (p.uid === st.uid ? { ...p, waitDays: v } : p)));
                          }}
                          className="h-7 w-16 border-foam bg-porcelain text-center tabular-nums" />
                        days
                      </label>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full gap-1.5 border-foam text-mocha hover:text-coffee"
                  onClick={() => setSteps((prev) => [...prev, { uid: nextUid.current++, channel: "call", waitDays: 1 }])}>
                  <Plus className="size-4" /> Add step
                </Button>
              </div>

              <footer className="flex justify-end gap-2 border-t border-foam p-4">
                <Button variant="outline" className="border-foam text-mocha hover:text-coffee" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={createSequence} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">Create sequence</Button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
