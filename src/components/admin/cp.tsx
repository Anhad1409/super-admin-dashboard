"use client";

/* Control-plane shared kit — the page header + stat tiles every super-admin
   governance/team/system screen uses, so they read as one system. */

import type { LucideIcon } from "lucide-react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const mono = "font-[family-name:var(--font-data)]";
export const monoLabel = `${mono} text-[10px] uppercase tracking-[0.14em] text-mocha`;
export const compactINR = (n: number) => n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : `₹${Math.round(n).toLocaleString("en-IN")}`;

/** The dark control-plane header band, consistent across sub-pages. */
export function CpHeader({ title, subtitle, right }: { title: string; subtitle: string; right?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-espresso/30 p-6 shadow-card-lg"
      style={{ background: "linear-gradient(135deg, #2a1a0f 0%, #3d2817 55%, #4a2f18 100%)" }}>
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-64 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, var(--color-caramel), transparent 70%)" }} />
      <span aria-hidden className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, var(--color-steam), transparent 70%)" }} />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className={`${mono} inline-flex items-center gap-1.5 rounded-full border border-caramel/40 bg-caramel/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-caramel`}>
            <ShieldAlert className="size-3" /> Super Admin
          </span>
          <h1 className="mt-2.5 font-serif text-[28px] font-semibold leading-tight text-cream">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-latte">{subtitle}</p>
        </div>
        {right && <div className="flex items-center gap-6">{right}</div>}
      </div>
    </div>
  );
}

/** A KPI stat tile with a tinted top border. */
export function StatTile({ icon: Icon, label, value, sub, tint, delta }: {
  icon: LucideIcon; label: string; value: React.ReactNode; sub?: string; tint: string; delta?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass" style={{ borderTop: `3px solid color-mix(in srgb, ${tint} 60%, transparent)` }}>
      <div className="flex items-center justify-between">
        <span className="grid size-8 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${tint} 16%, #fffdf9)`, color: `color-mix(in srgb, ${tint} 78%, #2a1a0f)` }}><Icon className="size-4" /></span>
        {delta && <span className="text-[11px] font-semibold text-success">{delta}</span>}
      </div>
      <div className="mt-3 font-serif text-[24px] font-semibold leading-none text-coffee tabular-nums">{value}</div>
      <div className={cn(monoLabel, "mt-2")}>{label}</div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

/** Small colored status tag. */
export function Tag({ children, c }: { children: React.ReactNode; c: string }) {
  return <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: `color-mix(in srgb, ${c} 14%, #fffdf9)`, color: `color-mix(in srgb, ${c} 78%, #2a1a0f)` }}>{children}</span>;
}

/** A plain card wrapper. */
export function Card({ title, children, right, className }: { title?: string; children: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-foam bg-porcelain p-5 shadow-glass", className)}>
      {title && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-coffee">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
