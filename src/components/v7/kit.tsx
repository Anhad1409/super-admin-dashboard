"use client";

/* v7 kit — the shared vocabulary for the re-brewed list pages.
   Everything here is the dashboard's language: porcelain + foam cards,
   serif headings, mono data labels, caramel accents, bean dots. */

import { motion, useReducedMotion } from "framer-motion";
import { BeanDot } from "@/components/coffee/bean-dot";
import { MiniSpark } from "@/components/ui-bits/mini-spark";
import { HelpHint } from "@/components/ui-bits/help-hint";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const monoLabel = "font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-mocha";

/* ---------- page banner: warm gradient, serif title, live stat chips ---------- */

export function V7Banner({ eyebrow, title, subtitle, stats, actions }: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  stats?: { label: string; value: React.ReactNode; spark?: number[]; color?: string }[];
  actions?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}
      className="relative mb-4 overflow-hidden rounded-2xl border border-foam p-4 shadow-glass"
      style={{ background: "linear-gradient(115deg, #fffdf9 0%, #f9efdd 58%, #f1e1c6 100%)" }}
    >
      {/* oversized bean + steam, barely-there wallpaper */}
      <svg viewBox="0 0 200 160" aria-hidden className="pointer-events-none absolute -right-6 -top-10 h-[190%] opacity-[0.06]">
        <ellipse cx="130" cy="90" rx="52" ry="72" fill="var(--color-mocha)" transform="rotate(28 130 90)" />
        <path d="M105,32 Q140,90 152,148" stroke="var(--color-cream)" strokeWidth="7" fill="none" transform="rotate(28 130 90)" />
        <path d="M52 96 C 44 78, 62 72, 54 54 M76 90 C 68 74, 84 68, 76 50" stroke="var(--color-caramel)" strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>

      <div className="relative flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-[200px]">
          {eyebrow && <div className={monoLabel}>{eyebrow}</div>}
          <h1 className="mt-0.5 font-serif text-[22px] font-semibold leading-tight tracking-tight text-coffee">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[13px] text-mocha">{subtitle}</p>}
        </div>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap items-stretch gap-2">
            {stats.map((s) => (
              <div key={s.label} className="flex min-w-[104px] flex-col justify-between rounded-xl border border-foam bg-porcelain/80 px-3 py-2 shadow-glass backdrop-blur-[2px]">
                <span className={monoLabel}>{s.label}</span>
                <span className="mt-1 flex items-end justify-between gap-2">
                  <span className="font-serif text-lg font-semibold leading-none text-coffee tabular-nums">{s.value}</span>
                  {s.spark && <MiniSpark data={s.spark} color={s.color ?? "var(--color-caramel)"} w={52} h={18} />}
                </span>
              </div>
            ))}
          </div>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
}

/* ---------- chip filter: replaces underline tabs / bare selects ---------- */

export function Chip({ active, onClick, dot, icon, children, count }: {
  active: boolean; onClick: () => void; dot?: string; icon?: React.ReactNode;
  children: React.ReactNode; count?: number;
}) {
  return (
    <button onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-all",
        active
          ? "border-caramel bg-brand text-brand-foreground shadow-cta"
          : "border-foam bg-porcelain text-mocha shadow-glass hover:border-latte hover:text-coffee",
      )}>
      {dot && <BeanDot color={active ? "var(--color-porcelain)" : dot} className="size-2.5" />}
      {icon}
      {children}
      {count != null && (
        <span className={cn(
          "ml-0.5 rounded-full px-1.5 py-px font-[family-name:var(--font-data)] text-[10px] tabular-nums",
          active ? "bg-porcelain/25 text-brand-foreground" : "bg-oat text-mocha",
        )}>{count}</span>
      )}
    </button>
  );
}

/* ---------- search, in the same pill language ---------- */

export function SearchPill({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder: string; className?: string;
}) {
  return (
    <label className={cn("flex h-8 items-center gap-2 rounded-full border border-foam bg-porcelain px-3 shadow-glass transition-colors focus-within:border-caramel", className)}>
      <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-latte" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="9" r="5.5" /><path d="m13.5 13.5 3.5 3.5" strokeLinecap="round" />
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent text-[12px] text-coffee outline-none placeholder:text-latte" />
    </label>
  );
}

/* ---------- section card: bean-dot serif header + porcelain body ---------- */

export function SectionCard({ title, count, help, aside, children, className }: {
  title: string; count?: string; help?: string; aside?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass", className)}>
      <header className="flex items-center gap-2.5 border-b border-foam bg-cream/60 px-4 py-2.5">
        <BeanDot color="var(--color-caramel)" />
        <h2 className="font-serif text-[15px] font-semibold text-coffee">{title}</h2>
        {count && <span className="font-[family-name:var(--font-data)] text-[11px] text-latte tabular-nums">{count}</span>}
        <span className="flex-1" />
        {aside}
        {help && <HelpHint text={help} side="left" />}
      </header>
      {children}
    </section>
  );
}

/* ---------- gradient meter: progress / score bars ---------- */

export function Meter({ pct, color = "var(--color-caramel)", className }: { pct: number; color?: string; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-foam/70", className)}>
      <motion.div className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, var(--color-mocha), ${color})` }}
        initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ duration: 0.7, ease: EASE }} />
    </div>
  );
}

/* ---------- equalizer: three live bars for anything currently pouring ---------- */

export function Equalizer({ color = "var(--color-steam)", className }: { color?: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={cn("flex h-3.5 items-end gap-[2.5px]", className)} aria-label="live">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="w-[3px] rounded-full" style={{ background: color }}
          animate={reduce ? { height: 8 } : { height: [4, 12 - i * 2, 5, 11, 4] }}
          transition={{ duration: 1.1 + i * 0.2, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </span>
  );
}

/* ---------- initial "latte-art" avatar for people rows ---------- */

const AVATAR_BG: Record<string, string> = {
  hot: "linear-gradient(135deg, #b8763d, #a5432c)",
  warm: "linear-gradient(135deg, #c9a87c, #b8763d)",
  cold: "linear-gradient(135deg, #8fb8b2, #4fb0a5)",
};

export function InitialBean({ name, band = "warm", className }: { name: string; band?: string; className?: string }) {
  const initials = name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full font-serif text-[12px] font-semibold text-porcelain shadow-glass", className)}
      style={{ background: AVATAR_BG[band] ?? AVATAR_BG.warm }}>
      {initials}
    </span>
  );
}

/* ---------- stagger container for row lists ---------- */

export const rowStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};
export const rowItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};
