"use client";

/* JourneyShell — the auth/onboarding frame, in the DASHBOARD's design language:
   same cream body wash, the real VoiceBrew lockup (as in the sidebar), a live
   channels pill (as in the topbar), porcelain cards. No broadsheet chrome. */

import Link from "next/link";
import { VoiceBrewLogo } from "@/components/layout/voicebrew-logo";
import { useLiveCapacity } from "@/lib/use-live-capacity";
import { CHANNELS, baselineActive } from "@/lib/channel-mock";

export function JourneyShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const active = useLiveCapacity(baselineActive);
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-cream"
      style={{
        backgroundImage:
          "radial-gradient(1100px 560px at 80% -10%, #f9ead2 0%, transparent 58%), radial-gradient(820px 460px at 2% 102%, #f1e3d2 0%, transparent 60%)",
      }}
    >
      {/* header — sidebar lockup + topbar live pill */}
      <header className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-6 pt-6">
        <Link href="/login"><VoiceBrewLogo animated /></Link>
        <span className="flex items-center gap-2 rounded-full border border-foam bg-card px-3 py-1.5 text-xs font-medium text-mocha shadow-glass">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-steam opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-steam" />
          </span>
          {active}/{CHANNELS} channels live
        </span>
      </header>

      <main className={`mx-auto flex w-full flex-1 items-center justify-center px-6 py-8 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        {children}
      </main>

      <footer className="shrink-0 pb-5 text-center font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-latte">
        brewed with care · VoiceBrew by Blostem
      </footer>
    </div>
  );
}

/* the standard journey card — identical treatment to dashboard cards */
export function JourneyCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`w-full rounded-2xl border border-foam bg-porcelain p-6 shadow-glass ${className}`}>
      {children}
    </section>
  );
}
