"use client";

import { useEffect, useRef, useState } from "react";

export type TourStep = { sel: string; title: string; body: string; before?: () => void };

// Lightweight spotlight walkthrough. Runs ONLY when triggered via the window
// "start-tour" event (e.g. a "Take a tour" button) — it never auto-starts.
// A step may carry a `before` hook to prep the page (e.g. switch a wizard step)
// before its target is spotlighted, so a tour can walk a multi-step flow.
// No dependencies.
export function Tour({ steps, onFinish }: { steps: TourStep[]; onFinish?: () => void }) {
  const [idx, setIdx] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  // steps may be rebuilt each render (to close over page state); read the
  // latest from a ref so the effects can key on `idx` alone.
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  // start on demand only — no auto-run
  useEffect(() => {
    const onStart = () => setIdx(0);
    window.addEventListener("start-tour", onStart);
    return () => window.removeEventListener("start-tour", onStart);
  }, []);

  // run the step's prep hook (e.g. navigate the wizard) when entering it
  useEffect(() => {
    if (idx == null) return;
    stepsRef.current[idx]?.before?.();
  }, [idx]);

  // locate + spotlight the current target
  useEffect(() => {
    if (idx == null) return;
    const update = () => {
      const el = document.querySelector(stepsRef.current[idx].sel);
      if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); setRect(el.getBoundingClientRect()); }
      else setRect(null);
    };
    update();
    const id = setTimeout(update, 360); // settle after scroll / step swap
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { clearTimeout(id); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [idx]);

  if (idx == null) return null;
  const step = steps[idx];
  const last = idx === steps.length - 1;
  const finish = () => { setIdx(null); onFinish?.(); };
  const pad = 8;

  // tooltip placement: below the target if there's room, else above; when the
  // target is too tall to sit beside (fills the viewport), pin to a corner so
  // the tooltip never covers the content it's spotlighting. Clamp horizontally.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const tipW = 320, tipH = 170;
  let top = vh / 2 - 80, left = vw / 2 - tipW / 2;
  if (rect) {
    const clampL = Math.min(Math.max(16, rect.left), vw - tipW - 16);
    if (rect.bottom + 16 + tipH < vh) { top = rect.bottom + 16; left = clampL; }        // room below
    else if (rect.top - (tipH + 16) >= 16) { top = rect.top - (tipH + 16); left = clampL; } // room above
    else { top = vh - tipH - 24; left = vw - tipW - 24; }                                // tall target → corner
  }

  return (
    <div className="fixed inset-0 z-[80]">
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
        {/* progress dots */}
        <div className="mt-3 flex justify-center gap-1.5">
          {steps.map((_, i) => <span key={i} className={`size-1.5 rounded-full ${i === idx ? "bg-caramel" : "bg-foam"}`} />)}
        </div>
      </div>
    </div>
  );
}
