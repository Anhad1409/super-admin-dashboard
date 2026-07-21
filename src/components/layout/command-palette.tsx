"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { nav, navGroups } from "@/config/nav";
import { campaigns, leads } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CornerDownLeft, Plus, SlidersHorizontal, Wallet, Sun, Megaphone, Users, BookOpen, type LucideIcon } from "lucide-react";

type Cmd = { kind: string; label: string; hint?: string; icon: LucideIcon; run: () => void };

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("open-command-palette", onOpen); };
  }, []);

  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current?.focus(), 0); } }, [open]);
  useEffect(() => { setSel(0); }, [q]);

  const go = (href: string) => { setOpen(false); router.push(href); };
  const groupLabel = (k: string) => navGroups.find((g) => g.key === k)?.label ?? k;

  const results = useMemo<Cmd[]>(() => {
    const term = q.trim().toLowerCase();
    const actions: Cmd[] = [
      { kind: "Actions", label: "New Quick campaign", hint: "3-minute path", icon: Plus, run: () => go("/campaigns/quick") },
      { kind: "Actions", label: "New Advanced campaign", hint: "full control", icon: SlidersHorizontal, run: () => go("/campaigns/new") },
      { kind: "Actions", label: "Top up minute balance", hint: "billing", icon: Wallet, run: () => go("/settings/billing") },
      { kind: "Actions", label: "Open today's worklist", hint: "what needs you", icon: Sun, run: () => go("/today") },
      { kind: "Actions", label: "Open Setup Guide", hint: "campaigns", icon: BookOpen, run: () => { go("/campaigns"); } },
    ];
    const navItems: Cmd[] = nav.map((n) => ({ kind: "Go to", label: n.label, hint: groupLabel(n.group), icon: n.icon, run: () => go(n.href) }));
    const campItems: Cmd[] = campaigns.map((c) => ({ kind: "Campaigns", label: c.name, hint: c.status, icon: Megaphone, run: () => go(`/campaigns/${c.id}`) }));
    const leadItems: Cmd[] = leads.map((l) => ({ kind: "Leads", label: l.name || l.phone, hint: l.phone, icon: Users, run: () => go("/leads") }));

    if (!term) return [...actions, ...navItems];
    const m = (c: Cmd) => c.label.toLowerCase().includes(term) || (c.hint ?? "").toLowerCase().includes(term);
    return [
      ...actions.filter(m).slice(0, 5),
      ...navItems.filter(m).slice(0, 6),
      ...campItems.filter(m).slice(0, 6),
      ...leadItems.filter(m).slice(0, 6),
    ];
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[sel]) { e.preventDefault(); results[sel].run(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-espresso/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-card-lg">
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown}
          placeholder="Search or run a command — campaigns, leads, actions…"
          className="w-full border-b border-foam bg-transparent px-4 py-3.5 text-sm text-coffee outline-none placeholder:text-muted-foreground" />
        <ul className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</li>}
          {results.map((item, i) => {
            const Icon = item.icon;
            const newGroup = i === 0 || results[i - 1].kind !== item.kind;
            return (
              <li key={item.kind + item.label + i}>
                {newGroup && <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.kind}</div>}
                <button onMouseEnter={() => setSel(i)} onClick={() => item.run()}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm", i === sel ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-coffee")}>
                  <Icon className="size-4 shrink-0 text-mocha" />
                  <span className="font-medium">{item.label}</span>
                  {item.hint && <span className="ml-auto truncate text-xs text-muted-foreground">{item.hint}</span>}
                  {i === sel && <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-foam px-3 py-2 text-[11px] text-muted-foreground">↑↓ navigate · ↵ select · esc close</div>
      </div>
    </div>
  );
}
