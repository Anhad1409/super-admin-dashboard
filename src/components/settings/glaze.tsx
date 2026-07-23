"use client";

/* Glaze kit — the crafted visual system for tile surfaces app-wide.
   GlazedTile: icon tiles rendered like glazed ceramic — a top-left sheen,
   layered tint gradient, inner highlight, tinted drop shadow, hue-true icon.
   SectionRule: bean eyebrow + mono label + hairline fading through the accent.
   ACCENT: the four semantic hues; status colors stay for status. */

import type { LucideIcon } from "lucide-react";
import { BeanDot } from "@/components/coffee/bean-dot";
import { cn } from "@/lib/utils";

export const ACCENT = {
  core: "var(--color-caramel)",   // configuration & calling
  comms: "var(--color-steam)",    // channels & messaging
  ai: "var(--color-blueberry)",   // intelligence & knowledge
  money: "var(--color-mango)",    // billing & usage
} as const;

const DIMS = {
  xs: { box: "size-6 rounded-lg", icon: "size-3" },
  sm: { box: "size-7 rounded-[9px]", icon: "size-3.5" },
  md: { box: "size-9 rounded-xl", icon: "size-4" },
  lg: { box: "size-11 rounded-xl", icon: "size-5" },
} as const;

export function GlazedTile({ icon: Icon, tint = ACCENT.core, size = "md", active = false, className }: {
  icon: LucideIcon; tint?: string; size?: keyof typeof DIMS; active?: boolean; className?: string;
}) {
  const d = DIMS[size];
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center", d.box, className)}
      style={active ? {
        background: [
          "radial-gradient(120% 90% at 28% 16%, rgba(255,255,255,.32), transparent 46%)",
          `linear-gradient(150deg, color-mix(in srgb, ${tint} 92%, #fffdf9) 0%, ${tint} 52%, color-mix(in srgb, ${tint} 72%, #2a1a0f) 100%)`,
        ].join(", "),
        border: `1px solid color-mix(in srgb, ${tint} 62%, #2a1a0f)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.4), 0 5px 12px -3px color-mix(in srgb, ${tint} 55%, transparent)`,
        color: "#fffdf9",
      } : {
        background: [
          "radial-gradient(120% 90% at 28% 16%, rgba(255,255,255,.6), transparent 44%)",
          `linear-gradient(150deg, color-mix(in srgb, ${tint} 20%, #fffdf9) 0%, color-mix(in srgb, ${tint} 46%, #f1e2c8) 100%)`,
        ].join(", "),
        border: `1px solid color-mix(in srgb, ${tint} 36%, var(--color-foam))`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.7), inset 0 -1.5px 0 color-mix(in srgb, ${tint} 26%, transparent), 0 4px 10px -3px color-mix(in srgb, ${tint} 38%, transparent)`,
        color: `color-mix(in srgb, ${tint} 80%, #2a1a0f)`,
      }}>
      <Icon className={d.icon} strokeWidth={2.1} />
    </span>
  );
}

/** Editorial section heading: accent bean + mono label + fading hairline. */
export function SectionRule({ children, tint = ACCENT.core, className }: { children: React.ReactNode; tint?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BeanDot color={tint} className="size-3" />
      <h2 className="shrink-0 font-[family-name:var(--font-data)] text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: `color-mix(in srgb, ${tint} 55%, var(--color-espresso))` }}>{children}</h2>
      <span aria-hidden className="h-px flex-1"
        style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${tint} 42%, transparent), transparent 85%)` }} />
    </div>
  );
}

/** A loose scatter of tinted beans — decorative garnish for header bands. */
export function BeanScatter({ tint = ACCENT.core, className }: { tint?: string; className?: string }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute", className)}>
      <BeanDot color={tint} className="absolute size-4 opacity-25" />
      <BeanDot color={tint} className="absolute left-5 top-3 size-2.5 -rotate-45 opacity-20" />
      <BeanDot color={tint} className="absolute left-1 top-6 size-3 rotate-12 opacity-15" />
    </span>
  );
}
