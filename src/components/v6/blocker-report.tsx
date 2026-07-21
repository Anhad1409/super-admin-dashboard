"use client";

/* v6 · AI blocker report — the full, user-friendly analysis the alert links to. */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Sparkles, Users2, PhoneOff, TrendingDown, Clock, Quote,
  Lightbulb, PauseCircle, Check, Wand2,
} from "lucide-react";
import { toast } from "@/components/notifications/toaster";
import { blocker } from "@/lib/v6-mock";

const card = "rounded-2xl border border-foam bg-porcelain p-5 shadow-glass";

export function V6BlockerReport() {
  const router = useRouter();
  const [resolved, setResolved] = useState<null | "paused" | "fixed" | "ignored">(null);

  const stats = [
    { icon: Users2, label: "Customers reported", value: `${blocker.reportedBy}`, sub: `in last ${blocker.windowMins} min` },
    { icon: PhoneOff, label: "Calls affected", value: `${blocker.pctOfCalls}%`, sub: "of recent calls" },
    { icon: TrendingDown, label: "Connect impact", value: `${blocker.connectImpact} pts`, sub: "vs baseline", danger: true },
    { icon: Clock, label: "Detected", value: blocker.detectedAt.split("·")[1]?.trim() || blocker.detectedAt, sub: "today" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-mocha hover:text-coffee"><ArrowLeft className="size-4" /> Back to dashboard</Link>

      {/* header */}
      <div className={card}>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-caramel"><Sparkles className="size-3.5" /> VoiceBrew AI · Blocker analysis</div>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <h1 className="font-serif text-2xl font-semibold text-coffee">{blocker.title}</h1>
          <span className="rounded-full bg-danger/12 px-2 py-0.5 text-[11px] font-bold uppercase text-danger">{blocker.severity}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">On <span className="font-medium text-coffee">{blocker.campaign}</span> · {blocker.detectedAt}</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => { const Icon = s.icon; return (
          <div key={s.label} className="rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
            <Icon className={`size-4 ${s.danger ? "text-danger" : "text-mocha"}`} />
            <div className={`mt-2 font-serif text-2xl font-semibold tabular-nums ${s.danger ? "text-danger" : "text-coffee"}`}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
            <div className="text-[10px] text-latte">{s.sub}</div>
          </div>
        ); })}
      </div>

      {/* what's happening */}
      <div className={card}>
        <h2 className="font-serif text-lg text-coffee">What&apos;s happening</h2>
        <p className="mt-2 text-sm leading-relaxed text-mocha">{blocker.summary}</p>
      </div>

      {/* quotes */}
      <div className={card}>
        <h2 className="font-serif text-lg text-coffee">What customers said</h2>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {blocker.quotes.map((q) => (
            <div key={q} className="flex gap-2 rounded-xl border border-foam bg-oat/40 p-3 text-sm text-coffee"><Quote className="size-4 shrink-0 text-latte" /> <span className="italic">“{q}”</span></div>
          ))}
        </div>
      </div>

      {/* root cause */}
      <div className={card}>
        <h2 className="flex items-center gap-2 font-serif text-lg text-coffee"><Lightbulb className="size-4 text-caramel" /> Root cause</h2>
        <p className="mt-2 text-sm leading-relaxed text-mocha">{blocker.rootCause}</p>
      </div>

      {/* recommended fix */}
      <div className="rounded-2xl border border-caramel/30 bg-gradient-to-br from-oat/60 to-porcelain p-5 shadow-glass">
        <h2 className="flex items-center gap-2 font-serif text-lg text-coffee"><Wand2 className="size-4 text-caramel" /> Recommended fix</h2>
        <p className="mt-2 text-sm leading-relaxed text-mocha">{blocker.recommendation}</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-danger/20 bg-danger/[0.04] p-3"><div className="text-[10px] font-semibold uppercase tracking-wide text-danger">Current opening</div><p className="mt-1 text-[13px] text-coffee">{blocker.fixBefore}</p></div>
          <div className="rounded-xl border border-success/25 bg-success/[0.05] p-3"><div className="text-[10px] font-semibold uppercase tracking-wide text-success">Suggested opening</div><p className="mt-1 text-[13px] text-coffee">{blocker.fixAfter}</p></div>
        </div>
      </div>

      {/* actions */}
      <div className="sticky bottom-3 flex flex-wrap items-center gap-2 rounded-2xl border border-foam bg-porcelain/95 p-3 shadow-card-lg backdrop-blur">
        {resolved ? (
          <span className="flex items-center gap-2 px-1 text-sm font-medium text-success"><Check className="size-4" /> {resolved === "paused" ? "Campaign paused." : resolved === "fixed" ? "Fix applied — re-testing on a small batch." : "Issue ignored."}</span>
        ) : (
          <>
            <button onClick={() => { setResolved("fixed"); toast({ title: "Fix applied", body: "New opening is live on a 10% test batch.", severity: "success" }); }} className="inline-flex items-center gap-1.5 rounded-full bg-coffee px-4 py-2 text-sm font-semibold text-cream hover:bg-espresso"><Wand2 className="size-4" /> Apply suggested fix</button>
            <button onClick={() => { setResolved("paused"); toast({ title: "Campaign paused", body: `${blocker.campaign} won't dial until you resume.`, severity: "info" }); }} className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-card px-4 py-2 text-sm font-medium text-coffee hover:bg-oat"><PauseCircle className="size-4" /> Pause campaign</button>
            <button onClick={() => { setResolved("ignored"); }} className="rounded-full px-4 py-2 text-sm font-medium text-mocha hover:bg-oat">Ignore</button>
            <button onClick={() => router.push("/dashboard")} className="ml-auto text-sm font-medium text-muted-foreground hover:text-coffee">Close</button>
          </>
        )}
      </div>
    </div>
  );
}
