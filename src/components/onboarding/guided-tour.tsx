"use client";

import { useEffect, useState } from "react";
import type { TourStep } from "./tour";

// Global, event-driven spotlight tour. Mount once in the layout.
// Trigger from anywhere:  window.dispatchEvent(new CustomEvent("guided-tour", { detail: { steps } }))
export function GuidedTour() {
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const onStart = (e: Event) => {
      const s = (e as CustomEvent).detail?.steps as TourStep[] | undefined;
      if (s && s.length) { setSteps(s); setIdx(0); }
    };
    window.addEventListener("guided-tour", onStart);
    return () => window.removeEventListener("guided-tour", onStart);
  }, []);

  useEffect(() => {
    if (!steps) return;
    const update = () => {
      const el = document.querySelector(steps[idx].sel);
      if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); setRect(el.getBoundingClientRect()); }
      else setRect(null);
    };
    update();
    const id = setTimeout(update, 320);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { clearTimeout(id); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [steps, idx]);

  if (!steps) return null;
  const step = steps[idx];
  const last = idx === steps.length - 1;
  const finish = () => { setSteps(null); setRect(null); };
  const pad = 8;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const tipW = 320;
  let top = vh / 2 - 80, left = vw / 2 - tipW / 2;
  if (rect) {
    const below = rect.bottom + 16;
    top = below + 170 < vh ? below : Math.max(16, rect.top - 186);
    left = Math.min(Math.max(16, rect.left), vw - tipW - 16);
  }

  return (
    <div className="fixed inset-0 z-[90]">
      {rect ? (
        <div className="absolute rounded-xl ring-2 ring-caramel transition-all duration-300"
          style={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: "0 0 0 9999px rgba(42,26,15,0.55)" }} />
      ) : (
        <div className="absolute inset-0" style={{ background: "rgba(42,26,15,0.55)" }} />
      )}
      <div className="absolute w-80 rounded-2xl border border-foam bg-porcelain p-4 shadow-card-lg" style={{ top, left }}>
        <div className="mb-1 font-data text-[10px] uppercase tracking-wider text-caramel">Step {idx + 1} of {steps.length}</div>
        <div className="font-serif text-base font-semibold text-coffee">{step.title}</div>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">{step.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <button onClick={finish} className="text-xs text-muted-foreground hover:text-coffee">Skip</button>
          <div className="flex gap-2">
            {idx > 0 && <button onClick={() => setIdx(idx - 1)} className="rounded-full border border-foam px-3 py-1 text-xs font-medium text-mocha hover:bg-oat">Back</button>}
            <button onClick={() => (last ? finish() : setIdx(idx + 1))} className="rounded-full bg-caramel px-3 py-1 text-xs font-semibold text-cream hover:bg-mocha">{last ? "Done" : "Next"}</button>
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {steps.map((_, i) => <span key={i} className={`size-1.5 rounded-full ${i === idx ? "bg-caramel" : "bg-foam"}`} />)}
        </div>
      </div>
    </div>
  );
}
