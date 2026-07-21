"use client";

/* v2-kit — the shared visual system for the v2 auth journey.
   Backdrop (accent halos + steam ribbons + drifting beans), V2Frame
   (page chrome: lockup header, channels pill, footer, preview badge),
   V2Card (halo + gradient-hairline card), LiveCallCard (an agent
   speaking every language on loop). All reduced-motion-safe. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Beans } from "@/app/login/Beans";
import { BrandMark } from "@/components/layout/brand-mark";
import { useLiveCapacity } from "@/lib/use-live-capacity";
import { CHANNELS, baselineActive } from "@/lib/channel-mock";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const mono = "font-[family-name:var(--font-data)]";
export const v2Input =
  "h-12 w-full rounded-xl border border-foam bg-cream px-3.5 text-[15px] text-coffee outline-none transition-[border-color,box-shadow] duration-150 focus:border-caramel focus:shadow-[0_0_0_3px_rgba(184,118,61,0.22)]";
export const v2Label = `${mono} mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-mocha`;

export const V2_BG = {
  backgroundImage:
    "radial-gradient(1200px 620px at 78% -12%, #f9ead2 0%, transparent 58%), radial-gradient(900px 500px at 0% 104%, #f1e3d2 0%, transparent 60%), radial-gradient(560px 380px at 96% 88%, rgba(79,176,165,0.08) 0%, transparent 70%)",
} as const;

/* ---------- ambient backdrop: color halos + steam ribbons + beans ---------- */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 left-[8%] size-[420px] rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, var(--color-caramel), transparent 70%)" }} />
      <div className="absolute right-[-6%] top-[18%] size-[460px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, var(--color-steam), transparent 70%)" }} />
      <div className="absolute bottom-[-12%] left-[30%] size-[400px] rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, var(--color-mango), transparent 70%)" }} />
      <div className="absolute bottom-[22%] left-[-6%] size-[300px] rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, var(--color-blueberry), transparent 70%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id="v2rib" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--color-caramel)" />
            <stop offset="0.55" stopColor="var(--color-mango)" />
            <stop offset="1" stopColor="var(--color-steam)" />
          </linearGradient>
        </defs>
        <path d="M-80 640 C 280 500, 540 780, 900 580 S 1380 430, 1540 500" stroke="url(#v2rib)" strokeWidth="70" strokeLinecap="round" opacity="0.06" />
        <path d="M-80 660 C 300 520, 560 800, 920 600 S 1380 450, 1540 520" stroke="url(#v2rib)" strokeWidth="2.5" opacity="0.28" />
        <path d="M-60 170 C 340 260, 700 90, 1080 200 S 1440 240, 1540 190" stroke="url(#v2rib)" strokeWidth="2" opacity="0.16" />
      </svg>
      <Beans />
    </div>
  );
}

/* ---------- page chrome for v2 journey sub-pages ---------- */
export function V2Frame({ children, wide = false, showLockup = true }: { children: React.ReactNode; wide?: boolean; showLockup?: boolean }) {
  const router = useRouter();
  const active = useLiveCapacity(baselineActive);
  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-cream" style={V2_BG}>
      <Backdrop />
      <header className={cn("relative z-[1] mx-auto flex w-full max-w-6xl shrink-0 items-center px-6 pt-6", showLockup ? "justify-between" : "justify-end")}>
        {showLockup && (
          <button onClick={() => router.push("/login/v2")} className="flex items-center gap-2.5">
            <BrandMark className="size-9 shrink-0" />
            <span className="text-left leading-tight">
              <span className="block font-serif text-lg font-semibold text-coffee">Voice<span className="text-caramel">Brew</span></span>
              <span className={`${mono} block text-[9px] font-medium uppercase tracking-[0.16em] text-latte`}>by Blostem</span>
            </span>
          </button>
        )}
        <span className={`${mono} flex items-center gap-2 rounded-full border border-foam bg-card px-3 py-1.5 text-[11px] font-medium text-mocha shadow-glass`}>
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-steam opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-steam" />
          </span>
          {active}/{CHANNELS} channels live
        </span>
      </header>
      <main className={cn("relative z-[1] mx-auto flex w-full flex-1 items-center justify-center px-6 py-8", wide ? "max-w-6xl" : "max-w-2xl")}>
        {children}
      </main>
      <footer className={`${mono} relative z-[1] shrink-0 pb-5 text-center text-[10px] uppercase tracking-[0.14em] text-latte`}>
        brewed with care · VoiceBrew by Blostem · estd. 2025, Delhi NCR
      </footer>
      <span className={`${mono} pointer-events-none fixed bottom-4 right-4 z-[2] flex items-center gap-1.5 rounded-full border border-foam bg-porcelain px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-mocha shadow-glass`}>
        <Sparkles className="size-3 text-caramel" /> new counter · v2 preview
      </span>
    </div>
  );
}

/* ---------- the v2 card: color halo behind + gradient hairline on top ---------- */
export function V2Card({ children, className, minHeight }: { children: React.ReactNode; className?: string; minHeight?: number }) {
  return (
    <div className={cn("relative w-full", className)}>
      <div aria-hidden className="absolute -inset-6 rounded-[36px] opacity-40 blur-2xl"
        style={{ background: "linear-gradient(140deg, color-mix(in srgb, var(--color-caramel) 30%, transparent), color-mix(in srgb, var(--color-steam) 22%, transparent) 60%, color-mix(in srgb, var(--color-mango) 20%, transparent))" }} />
      <div className="relative overflow-hidden rounded-3xl border border-foam bg-porcelain p-7 shadow-card-lg lg:p-8" style={{ minHeight }}>
        <span aria-hidden className="absolute inset-x-0 top-0 h-[3.5px]" style={{ background: "linear-gradient(90deg, var(--color-caramel), var(--color-mango) 50%, var(--color-steam))" }} />
        {children}
      </div>
    </div>
  );
}

/* ---------- live agent call — one line per language, typed on loop ---------- */
export const CALL_LINES: [string, string][] = [
  ["Hinglish", "Namaste! Aapki EMI kal due hai — main madad ke liye yahan hoon."],
  ["English", "Hello! Your KYC is pending — it takes two minutes, shall we do it now?"],
  ["Hindi", "नमस्ते! आपकी किश्त कल देय है — मैं मदद के लिए यहाँ हूँ।"],
  ["Tamil", "Vanakkam! Ungal EMI naalai due aagum — naan udhavalaam."],
  ["Marathi", "Namaskar! Tumchi EMI udya due aahe — mi madat karto."],
];

export function LiveCallCard() {
  const reduce = useReducedMotion();
  const [li, setLi] = useState(0);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (reduce) { setChars(CALL_LINES[0][1].length); return; }
    const id = setInterval(() => setChars((c) => (c < CALL_LINES[li][1].length ? c + 1 : c)), 38);
    return () => clearInterval(id);
  }, [li, reduce]);
  useEffect(() => {
    if (reduce) return;
    if (chars >= CALL_LINES[li][1].length) {
      const t = setTimeout(() => { setLi((v) => (v + 1) % CALL_LINES.length); setChars(0); }, 1600);
      return () => clearTimeout(t);
    }
  }, [chars, li, reduce]);
  const speaking = chars < CALL_LINES[li][1].length;
  return (
    <div className="rounded-2xl border border-foam bg-porcelain/90 p-4 shadow-glass backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-steam opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-steam" />
          </span>
          <span className={`${mono} text-[10px] uppercase tracking-[0.14em] text-mocha`}>Live — a VoiceBrew agent on a call</span>
        </div>
        <span className={`${mono} text-[10px] uppercase tracking-[0.1em] text-latte`}>sample</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CALL_LINES.map(([lang], i) => (
          <span key={lang} className={cn(`${mono} rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide transition-colors duration-300`,
            i === li ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-latte")}>
            {lang}
          </span>
        ))}
      </div>
      <div className="mt-3 min-h-[64px] rounded-xl bg-oat/50 px-3.5 py-2.5">
        <p className="text-[13.5px] leading-relaxed text-coffee">
          {CALL_LINES[li][1].slice(0, chars)}
          {speaking && !reduce && <span className="ml-0.5 inline-block h-[13px] w-[2px] animate-pulse bg-caramel align-middle" />}
        </p>
      </div>
      <div className="mt-3 flex h-6 items-center gap-[3px]">
        {Array.from({ length: 32 }).map((_, i) => (
          <span key={i} className="w-[3px] flex-1 rounded-full"
            style={{
              background: i % 4 === 0 ? "var(--color-steam)" : "var(--color-caramel)",
              height: "100%", transformOrigin: "center", opacity: 0.8,
              animation: reduce || !speaking ? undefined : `v2eq ${620 + (i % 5) * 120}ms ease-in-out ${(i % 7) * 70}ms infinite`,
              transform: speaking ? undefined : "scaleY(0.2)", transition: "transform .4s",
            }} />
        ))}
        <style>{`@keyframes v2eq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`}</style>
      </div>
    </div>
  );
}
