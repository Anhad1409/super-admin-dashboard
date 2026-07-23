"use client";

/* Settings → Outbound Caller IDs — the number pool campaigns rotate through.
   Per-number daily limits, live usage, enable toggles. Mock state, real UX. */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Phone, Plus, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

type PoolNumber = { num: string; provider: string; usedToday: number; limit: number; on: boolean };

const SEED: PoolNumber[] = [
  { num: "+91 80353 41719", provider: "plivo", usedToday: 14, limit: 200, on: true },
  { num: "+91 80353 12770", provider: "plivo", usedToday: 14, limit: 200, on: true },
];

export default function PhoneNumbersPage() {
  const [pool, setPool] = useState(SEED);
  const [modal, setModal] = useState(false);
  const [newNum, setNewNum] = useState("");
  const [provider, setProvider] = useState("plivo");
  const [series140, setSeries140] = useState(false);

  const addNumber = () => {
    if (!/\d{10}/.test(newNum.replace(/\D/g, ""))) { toast({ title: "Check the number", body: "Enter the full number your telephony account owns.", severity: "warning" }); return; }
    setPool((p) => [...p, { num: newNum, provider, usedToday: 0, limit: 200, on: true }]);
    setModal(false); setNewNum(""); setSeries140(false);
    toast({ title: "Number added", body: `${newNum} joined the pool${series140 ? " on the 140 telemarketing series" : ""} — campaigns rotate through it from the next call.`, severity: "success" });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to Settings</Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-serif text-3xl font-semibold tracking-tight text-coffee"><Phone className="size-6 text-caramel" /> Outbound Caller IDs</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            The numbers used as caller ID on outbound calls — campaigns rotate through them round-robin.
            A campaign can use all of these, or a chosen subset. Call-volume limits (concurrency / daily) are set on the campaign, not the number.
          </p>
        </div>
        <Button onClick={() => setModal(true)} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark"><Plus className="size-4" /> Add number</Button>
      </div>

      <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
        <h2 className="font-serif text-lg font-semibold text-coffee">Numbers</h2>
        <p className="text-xs text-muted-foreground">{pool.length} number{pool.length === 1 ? "" : "s"} in the pool</p>
        <ul className="mt-4 divide-y divide-foam/70">
          {pool.map((n, i) => (
            <li key={n.num} className="flex flex-wrap items-center gap-4 py-3.5">
              <div className="min-w-[220px]">
                <div className="flex items-center gap-2">
                  <span className={cn("font-data text-[15px] font-semibold", n.on ? "text-coffee" : "text-latte line-through")}>{n.num}</span>
                  <span className="rounded-full bg-oat/70 px-2 py-0.5 font-data text-[10px] text-mocha">{n.provider}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-foam">
                    <div className={cn("h-full rounded-full", n.on ? "bg-gradient-to-r from-mocha to-caramel" : "bg-latte/50")} style={{ width: `${Math.min(100, (n.usedToday / Math.max(1, n.limit)) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{n.usedToday} of {n.limit} today</span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-mocha">
                  Daily limit
                  <input type="number" value={n.limit}
                    onChange={(e) => setPool((p) => p.map((x, j) => (j === i ? { ...x, limit: Math.max(0, +e.target.value) } : x)))}
                    className="w-20 rounded-lg border border-foam bg-cream px-2 py-1.5 text-right font-data text-sm text-coffee outline-none focus:border-caramel" />
                </label>
                <button aria-label={n.on ? "Disable number" : "Enable number"}
                  onClick={() => { setPool((p) => p.map((x, j) => (j === i ? { ...x, on: !x.on } : x))); toast({ title: n.on ? "Number disabled" : "Number enabled", body: `${n.num} ${n.on ? "removed from" : "returned to"} rotation.`, severity: "info" }); }}
                  className={cn("relative h-5 w-9 rounded-full transition-colors", n.on ? "bg-success" : "bg-foam")}>
                  <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", n.on ? "left-[18px]" : "left-0.5")} />
                </button>
                <button aria-label={`Remove ${n.num}`}
                  onClick={() => { setPool((p) => p.filter((_, j) => j !== i)); toast({ title: "Number removed", body: `${n.num} left the pool.`, severity: "warning" }); }}
                  className="text-latte transition-colors hover:text-danger"><Trash2 className="size-4" /></button>
              </div>
            </li>
          ))}
          {pool.length === 0 && (
            <li className="flex flex-col items-center gap-2 py-10 text-center">
              <Power className="size-5 text-latte" />
              <p className="text-sm text-muted-foreground">No numbers in the pool — add one to start dialing.</p>
            </li>
          )}
        </ul>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/30 backdrop-blur-[2px]" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-foam bg-porcelain p-5 shadow-card-lg">
            <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-coffee"><Phone className="size-4 text-caramel" /> Add an outbound number</h3>
            <p className="mt-1 text-xs text-muted-foreground">Register a number your telephony account owns. It joins this org&apos;s caller-ID pool and becomes available to campaigns.</p>
            <div className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-coffee">Phone number <span className="text-danger">*</span></label>
                <input value={newNum} onChange={(e) => setNewNum(e.target.value)} placeholder="+91 80 3531 2770" autoFocus
                  className="w-full rounded-xl border border-foam bg-cream px-3.5 py-2.5 font-data text-sm text-coffee outline-none focus:border-caramel" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-coffee">Provider <span className="text-danger">*</span></label>
                <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded-xl border border-foam bg-cream px-3.5 py-2.5 text-sm text-coffee outline-none focus:border-caramel">
                  <option>plivo</option><option>exotel</option><option>smartflo</option>
                </select>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-foam bg-card px-3.5 py-3">
                <div>
                  <div className="text-sm font-medium text-coffee">140-series number</div>
                  <div className="text-xs text-muted-foreground">TRAI telemarketing series (DND + 9 AM–9 PM window enforced).</div>
                </div>
                <button role="switch" aria-checked={series140} onClick={() => setSeries140((v) => !v)}
                  className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", series140 ? "bg-steam" : "bg-foam")}>
                  <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", series140 ? "left-[18px]" : "left-0.5")} />
                </button>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(false)} className="border-foam text-mocha">Cancel</Button>
              <Button onClick={addNumber} className="bg-brand text-brand-foreground hover:bg-brand-dark">Add number</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
