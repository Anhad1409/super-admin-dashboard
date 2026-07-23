"use client";

/* v5 · Today — built with inspiration from v3 (the "brewing" aesthetic):
   warm brew gradient, Calistoga display, espresso hero, a BrewCup that
   fills as you clear the worklist, a Lottie soundwave band, roast cards
   and drifting coffee beans. Lives inside the v5 shell. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Lottie from "lottie-react";
import {
  Headset, PhoneCall, Clock, FileWarning, PauseCircle, Sparkles,
  ArrowRight, ArrowUpRight, CheckCircle2, Check, Sun, Coffee,
} from "lucide-react";
import { campaigns } from "@/lib/data";
import { wallet, walletState } from "@/lib/wallet-mock";
import { currentUser } from "@/lib/data";
import voicewave from "@/lib/voicewave.json";

const brew = "linear-gradient(135deg,#F0B563,#D6705B 52%,#8E5A7C)";
type Pri = "high" | "med" | "low";
const tint: Record<Pri, string> = { high: "#D6705B", med: "#E8943C", low: "#8E5A7C" };
const priLabel: Record<Pri, string> = { high: "Urgent", med: "Soon", low: "Anytime" };
const card = "rounded-3xl border border-[#efe2cf] bg-[#fffdf9]/90 shadow-[0_10px_30px_-12px_rgba(60,40,20,0.18)]";

function BrewCup({ pct }: { pct: number }) {
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 70" className="absolute -top-2 left-1/2 h-12 w-24 -translate-x-1/2 opacity-70" aria-hidden>
        {[28, 50, 72].map((x, i) => <path key={x} className="v6t-steam" style={{ animationDelay: `${i * 0.5}s` }} d={`M${x},64 q-10,-16 0,-30 q10,-14 0,-28`} fill="none" stroke="#9fd8cf" strokeWidth="3.5" strokeLinecap="round" />)}
      </svg>
      <svg viewBox="0 0 160 150" className="absolute inset-0 h-full w-full drop-shadow-[0_18px_30px_rgba(40,20,8,0.45)]">
        <defs>
          <linearGradient id="v5tbrew" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F0B563" /><stop offset="0.5" stopColor="#D6705B" /><stop offset="1" stopColor="#8E5A7C" /></linearGradient>
          <clipPath id="v5tclip"><path d="M30,42 h84 a8,8 0 0 1 8,8 v30 a42,42 0 0 1 -100,0 v-30 a8,8 0 0 1 8,-8 z" /></clipPath>
        </defs>
        <path d="M122,56 a22,22 0 0 1 0,40" fill="none" stroke="#e9d8be" strokeWidth="9" />
        <path d="M30,42 h84 a8,8 0 0 1 8,8 v30 a42,42 0 0 1 -100,0 v-30 a8,8 0 0 1 8,-8 z" fill="#fff7ec" stroke="#e0caa9" strokeWidth="2" />
        <g clipPath="url(#v5tclip)">
          <rect x="22" y={60 + (1 - pct) * 60} width="116" height="120" fill="url(#v5tbrew)" style={{ transition: "y 600ms cubic-bezier(0.16,1,0.3,1)" }} />
          <path className="v6t-wave" d="M22,72 q12,-9 24,0 t24,0 t24,0 t24,0 t24,0" fill="none" stroke="#fff7ec" strokeWidth="3" strokeLinecap="round" opacity="0.85" style={{ transform: `translateY(${(1 - pct) * 60}px)`, transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)" }} />
        </g>
        <ellipse cx="72" cy="132" rx="58" ry="9" fill="#e9d8be" opacity="0.6" />
      </svg>
    </div>
  );
}

const spring = { type: "spring" as const, stiffness: 80, damping: 16 };
const fade = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: spring } };

export function V6Today() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const drafts = campaigns.filter((c) => c.status === "draft").length;
  const paused = campaigns.filter((c) => c.status === "paused").length;
  const ws = walletState(wallet.minutes);

  type Item = { id: string; priority: Pri; icon: typeof Headset; title: string; detail: string; action: string; href: string };
  const items: Item[] = [
    { id: "handoff", priority: "high", icon: Headset, title: "2 leads waiting for a human", detail: "AI escalated them on Outreach — pick up before they cool.", action: "Open queue", href: "/handoff" },
    { id: "callbacks", priority: "high", icon: PhoneCall, title: "5 callbacks due today", detail: "Leads who asked to be called back. Don't let them go cold.", action: "View callbacks", href: "/leads" },
    ...(ws !== "healthy" ? [{ id: "wallet", priority: (ws === "critical" ? "high" : "med") as Pri, icon: Clock, title: `Minute balance ${ws === "critical" ? "critically low" : "running low"} — ${wallet.minutes} min`, detail: "Top up so live campaigns keep brewing.", action: "Top up", href: "/settings/billing" }] : []),
    ...(drafts > 0 ? [{ id: "drafts", priority: "med" as Pri, icon: FileWarning, title: `${drafts} campaign${drafts > 1 ? "s" : ""} still in draft`, detail: "Created but not calling yet — review and activate.", action: "Review drafts", href: "/campaigns" }] : []),
    ...(paused > 0 ? [{ id: "paused", priority: "med" as Pri, icon: PauseCircle, title: `${paused} paused campaign${paused > 1 ? "s" : ""}`, detail: "Resume to keep dialing, or leave parked.", action: "View", href: "/campaigns" }] : []),
    { id: "leads", priority: "low", icon: Sparkles, title: "Outreach is low on fresh leads", detail: "Upload more leads to keep the agents busy.", action: "Add leads", href: "/campaigns" },
  ];

  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setDone((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const total = items.length;
  const cleared = items.filter((i) => done.has(i.id)).length;
  const open = total - cleared;
  const high = items.filter((i) => i.priority === "high" && !done.has(i.id)).length;
  const pct = total ? cleared / total : 0;
  const allDone = cleared === total;
  const container = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="v6today relative mx-auto max-w-[1080px] space-y-6 font-[family-name:var(--font-inter)] text-[#3a2415]">
      <style>{`
        @keyframes v5tsteam{0%{opacity:0;transform:translateY(6px) scaleY(.9)}30%{opacity:.8}100%{opacity:0;transform:translateY(-14px) scaleY(1.15)}}
        .v6t-steam{animation:v5tsteam 3.4s ease-in-out infinite}
        @keyframes v5twave{0%{transform:translateX(0)}100%{transform:translateX(-48px)}}
        .v6t-wave{animation:v5twave 2.6s linear infinite}
        @keyframes v5tfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .v6t-float{animation:v5tfloat 6s ease-in-out infinite}
        .v6t-bean{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 30%,#6f4a2a,#3a2412);opacity:.06;pointer-events:none}
        .v6t-bean::after{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(transparent 47%,rgba(0,0,0,.35) 48% 52%,transparent 53%);transform:rotate(28deg)}
        @media (prefers-reduced-motion: reduce){.v6today *{animation:none !important}}
      `}</style>

      <span className="v6t-bean v6t-float" style={{ width: 54, height: 70, top: 120, right: 30, transform: "rotate(20deg)" }} />
      <span className="v6t-bean v6t-float" style={{ width: 34, height: 44, bottom: 80, left: 24, animationDelay: "1.5s" }} />

      {/* HERO */}
      <motion.section variants={fade} className="relative overflow-hidden rounded-[28px] border border-[#3a2412] text-[#f7efe2] shadow-[0_30px_70px_-30px_rgba(40,20,8,0.7)]"
        style={{ background: "radial-gradient(90% 130% at 88% 0%, rgba(214,112,91,.55), transparent 55%), radial-gradient(70% 120% at 10% 100%, rgba(142,90,124,.5), transparent 60%), linear-gradient(135deg,#2c1a0d,#241509)" }}>
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.06) 45%, transparent 60%)" }} />
        <div className="relative flex flex-col items-center justify-between gap-6 p-7 md:flex-row">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#f0d9b8] ring-1 ring-white/15"><Sun className="size-3.5" /> Good morning, {currentUser.full_name.split(" ")[0]} · Today</div>
            <h1 className="mt-3 font-[family-name:var(--font-brew)] text-[40px] leading-[1.05] tracking-tight">
              {allDone ? <>The bar&apos;s <span style={{ color: "#9fd8cf" }}>clean</span>.</> : <>Your worklist is <span style={{ color: "#F0B563" }}>brewing</span>.</>}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#e7d6bf]/90">
              {allDone ? "Everything's cleared — your agents are handling the rest. Enjoy the espresso." : <><span className="text-[#F0B563]">{open}</span> {open === 1 ? "thing" : "things"} on the bar{high ? <> · <span className="text-[#9fd8cf]">{high} need you now</span></> : ""}. Work top to bottom — the cup fills as you clear them.</>}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/campaigns/quick" className="inline-flex items-center gap-1.5 rounded-full bg-[#f7efe2] px-4 py-2 text-sm font-semibold text-[#2a1a0f] transition-transform hover:scale-[1.03]"><Coffee className="size-4" /> Brew a campaign</Link>
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-[#f7efe2] hover:bg-white/10">Back to dashboard <ArrowUpRight className="size-4" /></Link>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <BrewCup pct={pct} />
            <div>
              <div className="font-[family-name:var(--font-data)] text-5xl font-semibold leading-[1.15] tracking-tight">{cleared}<span className="text-2xl text-[#caa06a]">/{total}</span></div>
              <div className="text-xs uppercase tracking-widest text-[#caa06a]">cleared</div>
              <div className="mt-3 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs ring-1 ring-white/15"><span className="size-1.5 rounded-full" style={{ background: high ? "#D6705B" : "#9fd8cf" }} /> {Math.round(pct * 100)}% brewed</div>
            </div>
          </div>
        </div>
        {/* Lottie soundwave band */}
        <div className="relative border-t border-white/10 px-7 py-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#caa06a]">Today&apos;s rhythm</span>
            <Lottie animationData={voicewave} loop className="h-12 flex-1" />
          </div>
        </div>
      </motion.section>

      {/* WORKLIST */}
      <motion.section variants={fade}>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="font-[family-name:var(--font-brew)] text-xl text-[#2a1a0f]">On the bar today</h2>
          <span className="text-xs font-medium text-[#8a6a4a]">{open} open · {cleared} done</span>
        </div>
        <div className="space-y-2.5">
          {items.map((it) => {
            const Icon = it.icon; const isDone = done.has(it.id);
            return (
              <motion.div key={it.id} variants={fade} whileHover={reduce || isDone ? undefined : { y: -3 }}
                className={`flex items-center gap-4 p-4 transition-opacity ${card} ${isDone ? "opacity-55" : ""}`}>
                <button onClick={() => toggle(it.id)} aria-label={isDone ? "Mark not done" : "Mark done"}
                  className="grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors"
                  style={{ borderColor: isDone ? "#4FB0A5" : "#e0caa9", background: isDone ? "#4FB0A5" : "transparent", color: "#fff" }}>
                  {isDone && <Check className="size-4" strokeWidth={3} />}
                </button>
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl text-white" style={{ background: it.priority === "low" ? "#fffdf9" : tint[it.priority], color: it.priority === "low" ? tint.low : "#fff", border: it.priority === "low" ? "1px solid #efe2cf" : "none" }}><Icon className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold text-[#2a1a0f] ${isDone ? "line-through decoration-[#caa06a]" : ""}`}>{it.title}</div>
                  <div className="text-xs text-[#8a6a4a]">{it.detail}</div>
                </div>
                <span className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline" style={{ background: `color-mix(in srgb, ${tint[it.priority]} 14%, transparent)`, color: tint[it.priority] }}>{priLabel[it.priority]}</span>
                <button onClick={() => router.push(it.href)} disabled={isDone}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform enabled:hover:scale-[1.03] disabled:opacity-40"
                  style={{ background: brew }}>
                  {it.action} <ArrowRight className="size-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className={`mt-5 flex items-center justify-center gap-2 rounded-2xl border border-dashed py-4 text-sm transition-colors ${allDone ? "border-[#4FB0A5]/40 bg-[#4FB0A5]/5 text-[#3d8c83]" : "border-[#efe2cf] text-[#8a6a4a]"}`}>
          <CheckCircle2 className="size-4" style={{ color: allDone ? "#4FB0A5" : "#caa06a" }} />
          {allDone ? "Every cup poured — that's the whole list. Nice work ☕" : "Tick a task to brew it — your agents are handling the rest."}
        </div>
      </motion.section>
    </motion.div>
  );
}
