"use client";

/* Settings → Agent Skills — the real-time tool catalog (from the Jul-15 dive):
   stat row, Available/Activated/Webhook tabs, sections with lock/star cards. */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Layers, Zap, Star, Wrench, KeyRound, Lock, MessageSquare, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { GlazedTile, ACCENT } from "@/components/settings/glaze";
import { monoLabel } from "@/components/v7/kit";


type Skill = { name: string; cat: string; builtin: boolean; on: boolean; dynamic?: boolean };
const SEED: Skill[] = [
  { name: "End Call", cat: "Conversation control", builtin: true, on: true },
  { name: "Get Lead Info", cat: "Conversation control", builtin: true, on: true },
  { name: "Record Disposition", cat: "Conversation control", builtin: true, on: true },
  { name: "Schedule Callback", cat: "Conversation control", builtin: true, on: true },
  { name: "Switch Language", cat: "Conversation control", builtin: true, on: true },
  { name: "Transfer Call to Agent", cat: "Conversation control", builtin: true, on: true },
  { name: "Update Lead Score", cat: "Conversation control", builtin: true, on: true },
  { name: "Calculate Loan Savings", cat: "Financial data", builtin: false, on: true, dynamic: true },
  { name: "Check Loan Eligibility", cat: "Financial data", builtin: false, on: true, dynamic: true },
  { name: "EMI Calculator", cat: "Financial data", builtin: false, on: true, dynamic: true },
  { name: "Customer Data", cat: "Lead intelligence", builtin: false, on: true, dynamic: true },
  { name: "Search Knowledge Base", cat: "Lead intelligence", builtin: false, on: true, dynamic: true },
  { name: "Send Payment Link", cat: "Financial data", builtin: false, on: false, dynamic: true },
  { name: "Bureau Soft-Pull", cat: "Financial data", builtin: false, on: false, dynamic: true },
];
const TABS = ["Available Skills", "Activated", "Webhook API Keys"] as const;

export default function SkillsPage() {
  const [skills, setSkills] = useState(SEED);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Available Skills");

  const stats = useMemo(() => ({
    available: skills.length,
    activated: skills.filter((s) => s.on).length,
    core: skills.filter((s) => s.builtin).length,
    dynamic: skills.filter((s) => s.dynamic).length,
  }), [skills]);

  const cats = [...new Set(skills.map((s) => s.cat))];
  const shown = tab === "Activated" ? skills.filter((s) => s.on) : skills;

  const catTint: Record<string, string> = {
    "Conversation control": "var(--color-caramel)",
    "Financial data": "var(--color-mango)",
    "Lead intelligence": "var(--color-blueberry)",
  };
  const SkillCard = ({ s }: { s: Skill }) => (
    <div className="relative rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
      <span className="absolute right-3 top-3 text-latte">{s.builtin ? <Lock className="size-3.5" /> : <Star className="size-3.5 text-caramel" />}</span>
      <div className="flex items-center gap-2.5">
        <GlazedTile icon={MessageSquare} tint={catTint[s.cat] ?? ACCENT.core} />
        <div>
          <div className="text-sm font-semibold text-coffee">{s.name}</div>
          <div className="text-xs text-muted-foreground">{s.cat}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-medium text-info">starter</span>
        <span className="rounded-full bg-oat/80 px-2 py-0.5 text-[10px] font-medium text-mocha">{s.builtin ? "Built-in" : "Dynamic"}</span>
        {s.builtin ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">✓ Always Active</span>
        ) : (
          <button role="switch" aria-checked={s.on}
            onClick={() => { setSkills((x) => x.map((y) => (y.name === s.name ? { ...y, on: !y.on } : y))); toast({ title: s.on ? "Skill deactivated" : "Skill activated", body: `${s.name} is ${s.on ? "off" : "on"} for new campaigns.`, severity: "info" }); }}
            className={cn("ml-auto relative h-5 w-9 rounded-full transition-colors", s.on ? "bg-success" : "bg-foam")}>
            <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", s.on ? "left-[18px]" : "left-0.5")} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to Settings</Link>
      <h1 className="flex items-center gap-3 font-serif text-3xl font-semibold tracking-tight text-coffee"><GlazedTile icon={Layers} tint={ACCENT.ai} size="lg" /> Agent Skills</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Real-time tools the agent can invoke mid-call. Campaign wizards toggle these per campaign; this page manages the org catalog.</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { icon: Zap, n: stats.available, l: "Available skills", c: "var(--color-caramel)" },
          { icon: Wrench, n: stats.activated, l: "Activated skills", c: "var(--color-steam)" },
          { icon: Star, n: stats.core, l: "Core skills", c: "var(--color-mango)" },
          { icon: Layers, n: stats.dynamic, l: "Dynamic skills", c: "var(--color-blueberry)" },
          { icon: KeyRound, n: 0, l: "Credentialed skills", c: "var(--color-matcha)" },
        ].map((k) => (
          <div key={k.l} className="rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
            <div className="flex items-center gap-3">
              <GlazedTile icon={k.icon} tint={k.c} />
              <div><div className="font-serif text-2xl font-semibold leading-none text-coffee tabular-nums">{k.n}</div><div className="mt-1 text-xs text-muted-foreground">{k.l}</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-all",
              tab === t ? "border-caramel bg-brand text-brand-foreground shadow-cta" : "border-foam bg-porcelain text-mocha shadow-glass hover:border-latte")}>
            {t}{t === "Activated" && <span className={cn("rounded-full px-1.5 text-[10px] tabular-nums", tab === t ? "bg-porcelain/25" : "bg-oat")}>{stats.activated}</span>}
          </button>
        ))}
      </div>

      {tab !== "Webhook API Keys" ? (
        <div className="mt-5 space-y-6">
          {cats.map((cat) => {
            const list = shown.filter((s) => s.cat === cat);
            if (!list.length) return null;
            return (
              <section key={cat}>
                <h2 className={cn(monoLabel, "mb-2.5 text-[11px]")}>{cat}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{list.map((s) => <SkillCard key={s.name} s={s} />)}</div>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="mt-5 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-coffee">Webhook API Keys</h2>
              <p className="text-xs text-muted-foreground">Dynamic skills call your endpoints at run time — authenticate them with these keys.</p>
            </div>
            <Button size="sm" onClick={() => toast({ title: "Key created", body: "sk_live_••••2f8a — copy it now, it won't be shown again.", severity: "success" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> New key</Button>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-foam bg-card px-3.5 py-3">
            <code className="flex-1 truncate font-data text-xs text-coffee">POST https://vox.blostem.info/api/v1/skills/webhook/demo-org</code>
            <button onClick={() => { navigator.clipboard?.writeText("https://vox.blostem.info/api/v1/skills/webhook/demo-org"); toast({ title: "Copied", body: "Webhook URL on the clipboard.", severity: "info" }); }} className="text-mocha hover:text-coffee"><Copy className="size-4" /></button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">No keys yet — create one to authenticate skill webhooks.</p>
        </section>
      )}
    </div>
  );
}
