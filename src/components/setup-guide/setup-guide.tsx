"use client";

import { useState } from "react";
import { BookOpen, X, CheckCircle2, Circle, Info, Star, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { setupGuides, type Badge, type GuideSection } from "@/lib/setup-guides";
import { pageTours } from "@/lib/page-tours";

const badgeStyle: Record<Badge, string> = {
  REQUIRED: "bg-danger/12 text-danger",
  OPTIONAL: "bg-foam text-mocha",
  TIP: "bg-info/12 text-info",
  "HAS DEFAULT": "bg-success/12 text-success",
  "AUTO-SEEDED": "bg-caramel/15 text-caramel",
};
const badgeIcon: Record<Badge, typeof Info> = {
  REQUIRED: Star, OPTIONAL: Circle, TIP: Info, "HAS DEFAULT": CheckCircle2, "AUTO-SEEDED": Sparkles,
};

function Sections({ sections }: { sections: GuideSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((sec) => (
        <section key={sec.heading}>
          <h3 className="font-serif text-base font-semibold text-coffee">{sec.heading}</h3>
          {sec.blurb && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{sec.blurb}</p>}
          <div className="mt-3 space-y-2">
            {sec.items.map((it) => {
              const Icon = it.badge ? badgeIcon[it.badge] : Info;
              return (
                <div key={it.title} className="rounded-xl border border-foam bg-card p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-coffee">{it.title}</span>
                    {it.badge && (
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide", badgeStyle[it.badge])}>
                        <Icon className="size-2.5" /> {it.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{it.body}</p>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function SetupGuide({ page, open, onClose }: { page: string; open: boolean; onClose: () => void }) {
  const guide = setupGuides[page];
  const [tab, setTab] = useState(0);
  if (!open || !guide) return null;
  const sections = guide.tabs ? guide.tabs[tab].sections : guide.sections ?? [];
  // only offer the spotlight tour with steps whose targets actually exist on THIS page
  const tour = (pageTours[page] ?? []).filter((s) => typeof document !== "undefined" && document.querySelector(s.sel));

  return (
    <>
      <div className="fixed inset-0 z-50 bg-espresso/30 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[440px] max-w-[94vw] flex-col border-l border-foam bg-porcelain shadow-card-lg">
        <div className="flex items-start justify-between gap-3 border-b border-foam px-5 py-4">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand"><BookOpen className="size-4" /></span>
            <div>
              <h2 className="font-serif text-lg font-semibold text-coffee">{guide.title}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{guide.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-coffee"><X className="size-4" /></button>
        </div>

        {guide.tabs && (
          <div className="flex gap-1 border-b border-foam px-5 pt-3">
            {guide.tabs.map((t, i) => (
              <button key={t.name} onClick={() => setTab(i)} className={cn("-mb-px border-b-2 px-3 py-1.5 text-sm font-medium", tab === i ? "border-caramel text-caramel" : "border-transparent text-muted-foreground hover:text-foreground")}>{t.name}</button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Sections sections={sections} />
        </div>

        {tour.length >= 2 && (
          <div className="border-t border-foam p-4">
            <button
              onClick={() => { onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent("guided-tour", { detail: { steps: tour } })), 250); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-coffee py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-espresso">
              <Wand2 className="size-4" /> Show me how on this page
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">Walks you through the real controls, step by step.</p>
          </div>
        )}
      </aside>
    </>
  );
}

// Compact launcher used in page headers.
export function SetupGuideButton({ page, label = "Setup Guide" }: { page: string; label?: string }) {
  const [open, setOpen] = useState(false);
  if (!setupGuides[page]) return null;
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-oat/70 px-3 py-1.5 text-xs font-medium text-mocha transition-colors hover:bg-foam">
        <BookOpen className="size-3.5 text-caramel" /> {label}
      </button>
      <SetupGuide page={page} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
