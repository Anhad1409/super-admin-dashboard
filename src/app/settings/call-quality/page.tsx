"use client";

/* Settings → Call Quality Configs — system presets + custom configs. */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, SlidersHorizontal, Lock, Plus, Clock, Volume2, Thermometer, Braces, MessageSquare, AudioLines, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { GlazedTile, ACCENT } from "@/components/settings/glaze";
import { monoLabel } from "@/components/v7/kit";


type Preset = { name: string; desc: string; duration: string; silence: string; speed: string; stability: number; temp: number; tokens: number; interrupts: boolean; backchannel: boolean; system?: boolean };
const PRESETS: Preset[] = [
  { name: "Extended 120s", desc: "Longer calls for detailed product discussion and objection handling.", duration: "120s", silence: "30s", speed: "1x", stability: 0.6, temp: 0.3, tokens: 150, interrupts: true, backchannel: true, system: true },
  { name: "Premium 5min", desc: "Long-form calls for complex products, detailed eligibility checks.", duration: "300s", silence: "45s", speed: "1x", stability: 0.7, temp: 0.4, tokens: 250, interrupts: true, backchannel: true, system: true },
  { name: "Quick 30s", desc: "Short, fast-paced calls for quick qualification or surveys.", duration: "30s", silence: "10s", speed: "1.15x", stability: 0.6, temp: 0.3, tokens: 80, interrupts: true, backchannel: false, system: true },
  { name: "Standard 60s", desc: "Balanced call for lead qualification and product introduction.", duration: "60s", silence: "20s", speed: "1.05x", stability: 0.6, temp: 0.3, tokens: 120, interrupts: true, backchannel: true, system: true },
];

export default function CallQualityPage() {
  const [custom, setCustom] = useState<Preset[]>([]);

  const createConfig = () => {
    const n = custom.length + 1;
    setCustom((c) => [...c, { name: `Custom config ${n}`, desc: "Cloned from Standard 60s — tune each knob to your campaign.", duration: "60s", silence: "20s", speed: "1.05x", stability: 0.6, temp: 0.3, tokens: 120, interrupts: true, backchannel: true }]);
    toast({ title: "Config created", body: `Custom config ${n} added — cloned from Standard 60s.`, severity: "success" });
  };

  // roast ramp — call length as roast depth (light → dark), pure café language
  const presetTint: Record<string, string> = {
    "Quick 30s": "var(--color-latte)", "Standard 60s": "var(--color-caramel)",
    "Extended 120s": "var(--color-mocha)", "Premium 5min": "var(--color-coffee)",
  };
  const Card = ({ p, onDelete }: { p: Preset; onDelete?: () => void }) => (
    <div className="rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <GlazedTile icon={Clock} tint={presetTint[p.name] ?? ACCENT.core} size="sm" />
          <h3 className="font-serif text-lg font-semibold text-coffee">{p.name}</h3>
        </div>
        {p.system
          ? <span className="inline-flex items-center gap-1 rounded-full bg-oat/80 px-2 py-0.5 text-[10px] font-medium text-mocha"><Lock className="size-3" /> System</span>
          : <button onClick={onDelete} aria-label={`Delete ${p.name}`} className="text-latte hover:text-danger"><Trash2 className="size-4" /></button>}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] text-coffee">
        <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-latte" /> Duration: <b>{p.duration}</b></span>
        <span className="flex items-center gap-1.5"><AudioLines className="size-3.5 text-latte" /> Silence: <b>{p.silence}</b></span>
        <span className="flex items-center gap-1.5"><Volume2 className="size-3.5 text-latte" /> Speed: <b>{p.speed}</b></span>
        <span className="flex items-center gap-1.5"><SlidersHorizontal className="size-3.5 text-latte" /> Stability: <b>{p.stability}</b></span>
        <span className="flex items-center gap-1.5"><Thermometer className="size-3.5 text-latte" /> Temp: <b>{p.temp}</b></span>
        <span className="flex items-center gap-1.5"><Braces className="size-3.5 text-latte" /> Tokens: <b>{p.tokens}</b></span>
        <span className="flex items-center gap-1.5"><MessageSquare className="size-3.5 text-latte" /> Interrupts: <b>{p.interrupts ? "On" : "Off"}</b></span>
        <span className="flex items-center gap-1.5"><MessageSquare className="size-3.5 text-latte" /> Backchannel: <b>{p.backchannel ? "On" : "Off"}</b></span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to Settings</Link>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-3xl font-semibold tracking-tight text-coffee"><GlazedTile icon={SlidersHorizontal} tint={ACCENT.core} size="lg" /> Call Quality Configs</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Reusable bundles of duration, pacing, LLM and voice knobs — pick one in the campaign wizard&apos;s Voice &amp; AI step.</p>
        </div>
        <Button variant="outline" onClick={() => toast({ title: "Guide", body: "Start from the preset closest to your call length, then tune speed and tokens.", severity: "info" })} className="gap-1.5 border-foam text-mocha hover:text-coffee"><BookOpen className="size-4" /> Guide</Button>
      </div>

      <h2 className={monoLabel}>System presets</h2>
      <div className="mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRESETS.map((p) => <Card key={p.name} p={p} />)}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <h2 className={monoLabel}>Custom configs</h2>
        <Button onClick={createConfig} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark"><Plus className="size-4" /> Create Config</Button>
      </div>
      {custom.length === 0 ? (
        <div className="mt-2.5 flex flex-col items-center gap-2 rounded-2xl border border-foam bg-porcelain py-14 text-center shadow-glass">
          <SlidersHorizontal className="size-6 text-latte" />
          <p className="text-sm font-medium text-coffee">No custom configs yet</p>
          <p className="text-xs text-muted-foreground">Create a custom call quality config or use a system preset.</p>
        </div>
      ) : (
        <div className="mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {custom.map((p, i) => <Card key={p.name} p={p} onDelete={() => { setCustom((c) => c.filter((_, j) => j !== i)); toast({ title: "Config deleted", body: `${p.name} removed.`, severity: "warning" }); }} />)}
        </div>
      )}
    </div>
  );
}
