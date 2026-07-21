"use client";

/* Handoff Console — the bot-to-human case board, in the v7 language.
   Same behavior as always: cards carry the conversation summary and open
   the full case (/handoff/[id]) with transcript, recording & collected
   info. The redesign only turns the volume up. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Headset, CheckCircle2, AlertTriangle, ArrowRight, Play, FlaskConical } from "lucide-react";
import { V7Banner, Chip, InitialBean, monoLabel, rowStagger, rowItem } from "@/components/v7/kit";
import { GlazedTile } from "@/components/settings/glaze";
import { BeanDot } from "@/components/coffee/bean-dot";
import { handoffCalls } from "@/lib/handoff-mock";
import { cn } from "@/lib/utils";

type Band = "hot" | "warm" | "cold";
const bandMeta: Record<Band, { pill: string; dot: string }> = {
  hot: { pill: "bg-danger/10 text-danger border-danger/25", dot: "var(--color-danger)" },
  warm: { pill: "bg-caramel/12 text-caramel border-caramel/30", dot: "var(--color-caramel)" },
  cold: { pill: "bg-steam/10 text-steam border-steam/25", dot: "var(--color-steam)" },
};
const statusTone: Record<string, string> = {
  Completed: "bg-success/12 text-success border-success/25",
  Transferred: "bg-info/10 text-info border-info/25",
  Callback: "bg-warning/12 text-warning border-warning/25",
};

const FILTERS = ["All", "Needs review", "Transferred", "Callback", "Completed"] as const;
type Filter = (typeof FILTERS)[number];

export default function HandoffPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("All");
  const [testMode, setTestMode] = useState(false);

  const counts = useMemo(() => ({
    All: handoffCalls.length,
    "Needs review": handoffCalls.filter((c) => c.lowConfidence).length,
    Transferred: handoffCalls.filter((c) => c.status === "Transferred").length,
    Callback: handoffCalls.filter((c) => c.status === "Callback").length,
    Completed: handoffCalls.filter((c) => c.status === "Completed").length,
  }), []);

  const cards = handoffCalls.filter((c) =>
    filter === "All" ? true : filter === "Needs review" ? c.lowConfidence : c.status === filter);

  const filterDot: Record<Filter, string> = {
    All: "var(--color-caramel)", "Needs review": "var(--color-warning)",
    Transferred: "var(--color-info)", Callback: "var(--color-warning)", Completed: "var(--color-success)",
  };

  return (
    <div className="mx-auto max-w-7xl">
      <V7Banner
        eyebrow="Live operations"
        title="Handoff Console"
        subtitle={<>Calls the bot handed to humans — <span className="font-medium text-coffee">open any card</span> for the summary, transcript, recording &amp; collected info.</>}
        stats={[
          { label: "Handed off today", value: counts.All },
          { label: "Needs review", value: <span className={counts["Needs review"] ? "text-warning" : "text-coffee"}>{counts["Needs review"]}</span> },
          { label: "Resolved", value: <span className="text-success">14</span> },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(filter === f ? "All" : f)} dot={filterDot[f]} count={counts[f]}>
            {f}
          </Chip>
        ))}
        <button onClick={() => setTestMode((v) => !v)}
          className={cn("ml-auto flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium shadow-glass transition-colors",
            testMode ? "border-steam/40 bg-steam/10 text-steam" : "border-foam bg-porcelain text-latte hover:text-mocha")}>
          <FlaskConical className="size-3.5" /> Test calls
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-foam bg-porcelain py-16 text-center shadow-glass">
          <GlazedTile icon={Headset} tint="var(--color-success)" size="lg" />
          <p className="font-serif text-lg text-coffee">Nothing to review here</p>
          <p className="text-sm text-mocha">Calls the bot escalates land on this board the moment they end.</p>
        </div>
      ) : (
        <motion.div variants={rowStagger} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const bm = bandMeta[(c.band as Band) ?? "warm"];
            return (
              <motion.button key={c.id} variants={rowItem} onClick={() => router.push(`/handoff/${c.id}`)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-foam bg-porcelain p-4 text-left shadow-glass transition-all hover:-translate-y-1 hover:border-caramel hover:shadow-glass-hover">
                {/* header: bean + avatar + name + score, status right */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <InitialBean name={c.name} band={(c.band as Band) ?? "warm"} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-coffee transition-colors group-hover:text-brand-dark">{c.name}</span>
                        <span className={cn("rounded-full border px-1.5 py-0.5 font-data text-[10px] font-semibold tabular-nums", bm.pill)}>{c.score}</span>
                      </div>
                      <div className="font-[family-name:var(--font-data)] text-[11px] text-latte">{c.phone}</div>
                    </div>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", statusTone[c.status])}>{c.status}</span>
                </div>

                {/* campaign line */}
                <div className="mt-2 flex items-center gap-1.5">
                  <BeanDot color={bm.dot} className="size-2.5" />
                  <span className="truncate text-xs font-medium text-mocha">{c.campaign}</span>
                </div>

                {/* the summary — quoted snippet with accent bar */}
                <div className="relative mt-2.5 flex-1 rounded-xl bg-oat/45 py-2.5 pl-3.5 pr-3">
                  <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full"
                    style={{ background: c.lowConfidence ? "var(--color-warning)" : "var(--color-success)" }} />
                  <span aria-hidden className="absolute -top-1 right-2 font-serif text-3xl leading-none text-latte/50">&rdquo;</span>
                  <p className="line-clamp-3 text-[13px] leading-relaxed text-coffee/90">{c.summary}</p>
                </div>

                {/* footer: confidence + recording + time, open affordance */}
                <div className="mt-3 flex items-center justify-between border-t border-foam/70 pt-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("flex items-center gap-1 text-[11px] font-medium", c.lowConfidence ? "text-warning" : "text-success")}>
                      {c.lowConfidence ? <AlertTriangle className="size-3" /> : <CheckCircle2 className="size-3" />}
                      {c.lowConfidence ? "Low confidence" : "Summary ready"}
                    </span>
                    <span className="flex items-center gap-1 font-[family-name:var(--font-data)] text-[10.5px] text-latte">
                      <Play className="size-3 text-caramel" /> rec
                    </span>
                  </div>
                  <span className="font-[family-name:var(--font-data)] text-[10.5px] text-latte transition-opacity group-hover:opacity-0">{c.when}</span>
                  <span className="absolute bottom-3 right-4 flex translate-x-2 items-center gap-1 text-[11px] font-semibold text-caramel opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                    Open case <ArrowRight className="size-3" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}
      <p className={cn(monoLabel, "mt-4 text-center normal-case tracking-normal text-[11px]")}>
        {testMode ? "Test calls only — real handoffs are hidden." : "Every card opens the full case — summary, transcript, recording and collected info."}
      </p>
    </div>
  );
}
