"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, X, Rocket, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "org", label: "Set up your organization", href: "/settings", done: true },
  { key: "providers", label: "Connect providers", href: "/settings", done: true },
  { key: "campaign", label: "Create your first campaign", href: "/campaigns/quick", done: true },
  { key: "leads", label: "Upload leads", href: "/campaigns", done: false },
  { key: "compliance", label: "Confirm calling window & PII masking", href: "/compliance", done: false },
  { key: "team", label: "Invite your team", href: "/settings", done: false },
];

export function GetStarted() {
  const [dismissed, setDismissed] = useState(true); // default hidden until we read storage (avoid flash)
  useEffect(() => { setDismissed(localStorage.getItem("vox-getstarted-dismissed") === "1"); }, []);
  const dismiss = () => { localStorage.setItem("vox-getstarted-dismissed", "1"); setDismissed(true); };

  const done = STEPS.filter((s) => s.done).length;
  const pct = Math.round((done / STEPS.length) * 100);
  if (dismissed || done === STEPS.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-caramel/30 bg-gradient-to-br from-cream to-oat/60 p-5 shadow-glass">
      <button onClick={dismiss} className="absolute right-3 top-3 text-muted-foreground hover:text-coffee"><X className="size-4" /></button>
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground"><Rocket className="size-4" /></span>
        <div>
          <h3 className="font-serif text-lg font-semibold text-coffee">Get started</h3>
          <p className="text-xs text-muted-foreground">{done} of {STEPS.length} done — finish setup to start calling.</p>
        </div>
        <div className="ml-auto mr-6 hidden items-center gap-2 sm:flex">
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${pct}%` }} /></div>
          <span className="font-data text-xs font-medium text-mocha">{pct}%</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s) => (
          <Link key={s.key} href={s.href} className={cn("group flex items-center gap-2.5 rounded-xl border bg-card/70 px-3 py-2.5 text-sm transition-colors", s.done ? "border-success/30" : "border-foam hover:border-caramel")}>
            {s.done ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <Circle className="size-4 shrink-0 text-muted-foreground" />}
            <span className={cn("flex-1", s.done ? "text-muted-foreground line-through" : "text-coffee")}>{s.label}</span>
            {!s.done && <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />}
          </Link>
        ))}
      </div>
    </div>
  );
}
