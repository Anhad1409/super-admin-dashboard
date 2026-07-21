"use client";

/* SettingsShell — one consistent frame for every settings sub-page:
   breadcrumb, icon-tile header on a soft oat wash, optional status +
   actions, and steady vertical rhythm. Keeps sub-pages from feeling
   like floating forms on an empty canvas. */

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { GlazedTile, BeanScatter } from "@/components/settings/glaze";

export function SettingsShell({ icon: Icon, title, blurb, status, actions, aside, children, wide = false, tint = "var(--color-caramel)" }: {
  icon: LucideIcon;
  title: string;
  blurb: React.ReactNode;
  status?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode; // right rail (How it works, tips) — fills sparse pages
  children: React.ReactNode;
  wide?: boolean;
  tint?: string; // page accent — any palette token
}) {
  return (
    <div className={`mx-auto ${wide ? "max-w-7xl" : "max-w-6xl"}`}>
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-coffee">
        <ChevronLeft className="size-4" /> Settings
      </Link>

      {/* header band — same gradient family as the v7 banners, quieter, with a page-accent wash */}
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-foam px-5 py-4 shadow-glass"
        style={{ background: "linear-gradient(115deg, #fffdf9 0%, #f9efdd 70%, #f4e6cd 100%)" }}>
        {/* ghosted page icon — the watermark treatment from the v7 banners, page-specific */}
        <Icon aria-hidden className="pointer-events-none absolute -bottom-7 right-4 size-32 -rotate-[10deg]"
          style={{ color: tint, opacity: 0.08 }} strokeWidth={1.1} />
        <BeanScatter tint={tint} className="right-40 top-4 hidden sm:block" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${tint} 45%, transparent) 30%, transparent 75%)` }} />
        <div className="relative flex flex-wrap items-center gap-4">
          <GlazedTile icon={Icon} tint={tint} size="lg" />
          <div className="min-w-[220px] flex-1">
            <h1 className="flex flex-wrap items-center gap-2.5 font-serif text-[22px] font-semibold leading-tight tracking-tight text-coffee">
              {title} {status}
            </h1>
            <p className="mt-0.5 max-w-3xl text-[13px] leading-relaxed text-mocha">{blurb}</p>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </div>

      {aside ? (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="min-w-0 space-y-5">{children}</div>
          <div className="space-y-4 lg:sticky lg:top-20">{aside}</div>
        </div>
      ) : (
        <div className="space-y-5">{children}</div>
      )}
    </div>
  );
}

/** Right-rail card: numbered steps — gives sparse pages purpose, not padding. */
export function HowItWorks({ title = "How it works", steps, tint = "var(--color-caramel)" }: { title?: string; steps: { t: string; d: string }[]; tint?: string }) {
  return (
    <aside className="rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
      <h2 className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-mocha">{title}</h2>
      <ol className="mt-3 space-y-3">
        {steps.map((s, i) => (
          <li key={s.t} className="flex gap-2.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-full font-serif text-[12px] font-semibold"
              style={{
                background: `linear-gradient(150deg, color-mix(in srgb, ${tint} 14%, #fffdf9), color-mix(in srgb, ${tint} 32%, #f4e9d8))`,
                border: `1px solid color-mix(in srgb, ${tint} 28%, var(--color-foam))`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
                color: `color-mix(in srgb, ${tint} 62%, var(--color-espresso))`,
              }}>{i + 1}</span>
            <div>
              <div className="text-[13px] font-medium leading-tight text-coffee">{s.t}</div>
              <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">{s.d}</div>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
