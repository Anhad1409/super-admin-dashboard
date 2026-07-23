"use client";

/* Metric drill-down system — the interaction the control plane is built on:
   every KPI is clickable and expands into a detail drawer showing that
   metric's bifurcation (by plan / status / client / segment), a trend, and
   links to the full screen. One <MetricProvider> lives in the admin layout;
   any <MetricTile> (or cp.tsx StatTile with a `detail`) opens the drawer. */

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { X, ArrowRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const mono = "font-[family-name:var(--font-data)]";
export const monoLabel = `${mono} text-[10px] uppercase tracking-[0.14em] text-mocha`;

export type BreakdownRow = { name: string; value: string; pct?: number; tint?: string; href?: string; sub?: string; flag?: boolean };
export type Breakdown = { label: string; rows: BreakdownRow[]; note?: string };
export type MetricDetail = {
  title: string;
  value: string;
  delta?: string | null;
  description?: string;
  trend?: number[];
  breakdowns: Breakdown[];
  links?: { label: string; href: string }[];
};

// ---------- context ----------
const Ctx = createContext<{ open: (d: MetricDetail) => void } | null>(null);
export const useMetric = () => useContext(Ctx);

export function MetricProvider({ children }: { children: React.ReactNode }) {
  const [detail, setDetail] = useState<MetricDetail | null>(null);
  return (
    <Ctx.Provider value={{ open: setDetail }}>
      {children}
      <MetricDrawer detail={detail} onClose={() => setDetail(null)} />
    </Ctx.Provider>
  );
}

// ---------- the sparkline in the drawer ----------
function Trend({ data }: { data: number[] }) {
  const w = 320, h = 48;
  const max = Math.max(...data), min = Math.min(...data), rng = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 6) - 3}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full" style={{ height: 48 }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--color-caramel)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------- the drawer ----------
function MetricDrawer({ detail, onClose }: { detail: MetricDetail | null; onClose: () => void }) {
  const router = useRouter();
  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail, onClose]);

  return (
    <div className={cn("fixed inset-0 z-[120] overflow-hidden", detail ? "" : "pointer-events-none")}>
      {/* scrim */}
      <div onClick={onClose} className={cn("absolute inset-0 bg-espresso/35 backdrop-blur-[2px] transition-opacity duration-200", detail ? "opacity-100" : "opacity-0")} />
      {/* panel */}
      <aside className={cn("absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-foam bg-porcelain shadow-card-lg transition-transform duration-300 ease-out",
        detail ? "translate-x-0" : "translate-x-full")}>
        {detail && (
          <>
            <div className="border-b border-foam px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={monoLabel}>{detail.title}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-serif text-[30px] font-semibold leading-none text-coffee tabular-nums">{detail.value}</span>
                    {detail.delta && <span className="text-[12px] font-semibold text-success">{detail.delta}</span>}
                  </div>
                </div>
                <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-coffee"><X className="size-4" /></button>
              </div>
              {detail.description && <p className="mt-2 text-[12.5px] leading-relaxed text-mocha">{detail.description}</p>}
              {detail.trend && <Trend data={detail.trend} />}
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {detail.breakdowns.map((bd, i) => {
                const max = Math.max(...bd.rows.map((r) => r.pct ?? 0), 1);
                return (
                  <div key={i}>
                    <div className={cn(monoLabel, "mb-2")}>{bd.label}</div>
                    <div className="space-y-2">
                      {bd.rows.map((r, j) => {
                        const body = (
                          <div className="w-full">
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex min-w-0 items-center gap-2 text-[13px] text-coffee">
                                {r.tint && <span className="size-2.5 shrink-0 rounded-full" style={{ background: r.tint }} />}
                                <span className="truncate">{r.name}</span>
                                {r.sub && <span className="shrink-0 text-[11px] text-latte">{r.sub}</span>}
                              </span>
                              <span className={cn("shrink-0 text-[12.5px] font-semibold tabular-nums", r.flag ? "text-danger" : "text-mocha")}>{r.value}</span>
                            </div>
                            {r.pct !== undefined && (
                              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foam">
                                <div className="h-full rounded-full" style={{ width: `${(r.pct / max) * 100}%`, background: r.tint ?? "var(--color-caramel)" }} />
                              </div>
                            )}
                          </div>
                        );
                        return r.href ? (
                          <button key={j} onClick={() => { onClose(); router.push(r.href!); }} className="block w-full rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-oat/50">{body}</button>
                        ) : <div key={j} className="px-1.5 py-1">{body}</div>;
                      })}
                    </div>
                    {bd.note && <p className="mt-2 rounded-lg bg-oat/50 px-3 py-2 text-[11px] text-mocha">{bd.note}</p>}
                  </div>
                );
              })}
            </div>

            {detail.links && detail.links.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-foam p-4">
                {detail.links.map((l) => (
                  <button key={l.href} onClick={() => { onClose(); router.push(l.href); }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-cream px-3.5 py-2 text-[12px] font-medium text-mocha transition-colors hover:border-caramel hover:text-coffee">
                    {l.label} <ArrowRight className="size-3.5" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

// ---------- a clickable KPI tile ----------
export function MetricTile({ icon: Icon, label, value, sub, tint, delta, detail, size = "md" }: {
  icon: LucideIcon; label: string; value: React.ReactNode; sub?: string; tint: string; delta?: string | null;
  detail?: MetricDetail; size?: "md" | "lg";
}) {
  const m = useMetric();
  const clickable = !!(detail && m);
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => detail && m?.open(detail)}
      className={cn("group relative w-full rounded-2xl border border-foam bg-porcelain p-5 text-left shadow-glass transition-all",
        clickable && "cursor-pointer hover:-translate-y-0.5 hover:border-caramel hover:shadow-glass-hover")}
      style={{ borderTop: `3px solid color-mix(in srgb, ${tint} 60%, transparent)` }}
    >
      <div className="flex items-center justify-between">
        <span className="grid size-8 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${tint} 16%, #fffdf9)`, color: `color-mix(in srgb, ${tint} 78%, #2a1a0f)` }}><Icon className="size-4" /></span>
        {delta ? <span className="text-[11px] font-semibold text-success">{delta}</span> : clickable && <Maximize2 className="size-3.5 text-latte opacity-0 transition-opacity group-hover:opacity-100" />}
      </div>
      <div className={cn("mt-3 font-serif font-semibold leading-none text-coffee tabular-nums", size === "lg" ? "text-[30px]" : "text-[24px]")}>{value}</div>
      <div className={cn(monoLabel, "mt-2")}>{label}</div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
      {clickable && <span className="pointer-events-none absolute bottom-2.5 right-3 text-[9px] font-[family-name:var(--font-data)] uppercase tracking-wide text-latte opacity-0 transition-opacity group-hover:opacity-100">details →</span>}
    </button>
  );
}
