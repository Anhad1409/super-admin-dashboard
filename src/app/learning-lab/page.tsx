"use client";

import { useState } from "react";
import { FlaskConical, Plus, Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

type Exp = { id: string; name: string; status: "running" | "complete"; variants: { label: string; win: number; leader?: boolean }[] };
const experiments: Exp[] = [
  { id: "e1", name: "Speech speed: 45% vs 60%", status: "running", variants: [{ label: "A · 45%", win: 31 }, { label: "B · 60%", win: 37, leader: true }] },
  { id: "e2", name: "Opener: benefit-first vs name-first", status: "complete", variants: [{ label: "Benefit", win: 42, leader: true }, { label: "Name", win: 28 }] },
  { id: "e3", name: "Voice: Aria vs Meera", status: "running", variants: [{ label: "Aria", win: 34, leader: true }, { label: "Meera", win: 33 }] },
];

export default function LearningLabPage() {
  const [promoted, setPromoted] = useState<string[]>([]);
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="AI Learning Lab" subtitle="Run experiments, then promote the winner to production"
        actions={<Button size="sm" onClick={() => toast({ title: "New experiment", body: "Opening sweep builder…", severity: "info" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> New experiment</Button>} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Running" value="2" icon={FlaskConical} sub="live experiments" />
        <StatCard label="Completed" value="1" icon={Trophy} sub="this month" />
        <StatCard label="Avg lift from winners" value="+9pts" icon={Trophy} sub="win-rate" />
      </div>
      <div className="space-y-3">
        {experiments.map((e) => {
          const done = promoted.includes(e.id);
          return (
            <div key={e.id} className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><h3 className="font-medium text-coffee">{e.name}</h3><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", e.status === "running" ? "bg-success/12 text-success" : "bg-foam text-muted-foreground")}>{e.status}</span></div>
                <Button size="sm" disabled={done} onClick={() => { setPromoted((p) => [...p, e.id]); toast({ title: "Promoted to production", body: e.variants.find((v) => v.leader)?.label, severity: "success" }); }} variant={done ? "outline" : "default"} className={cn(done ? "text-mocha" : "bg-brand text-brand-foreground hover:bg-brand-dark")}>{done ? "Promoted" : "Promote winner"}</Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {e.variants.map((v) => (
                  <div key={v.label} className={cn("rounded-xl border p-3", v.leader ? "border-caramel bg-caramel/5" : "border-foam bg-card")}>
                    <div className="flex items-center justify-between text-sm"><span className="font-medium text-coffee">{v.label}{v.leader && <Trophy className="ml-1 inline size-3.5 text-caramel" />}</span><span className="font-data text-coffee">{v.win}%</span></div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foam"><div className={cn("h-full rounded-full", v.leader ? "bg-gradient-to-r from-mocha to-caramel" : "bg-latte")} style={{ width: `${v.win * 2}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
