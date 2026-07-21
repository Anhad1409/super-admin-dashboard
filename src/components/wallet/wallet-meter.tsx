"use client";

import { useState } from "react";
import { Clock, Plus, X, ArrowUpRight, ArrowDownRight, Gift, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniSpark } from "@/components/ui-bits/mini-spark";
import { toast } from "@/components/notifications/toaster";
import Link from "next/link";
import { Layers } from "lucide-react";
import { wallet, walletHistory, walletUsage, topupPacks, walletState } from "@/lib/wallet-mock";
import { TabMeter } from "@/components/wallet/tab-meter";
import { useBillingModel, subscriptionPlan } from "@/lib/billing";

function tone(min: number) {
  const s = walletState(min);
  return s === "critical"
    ? { c: "var(--color-danger)", text: "text-danger", ring: "border-danger/40 bg-danger/10", label: "Critically low" }
    : s === "low"
    ? { c: "var(--color-warning)", text: "text-warning", ring: "border-warning/40 bg-warning/10", label: "Running low" }
    : { c: "var(--color-success)", text: "text-success", ring: "border-success/35 bg-success/10", label: "Healthy" };
}

const txIcon = { topup: Plus, usage: ArrowDownRight, bonus: Gift } as const;

export function WalletMeter({ collapsed = false }: { collapsed?: boolean }) {
  const [balance, setBalance] = useState(wallet.minutes);
  const [open, setOpen] = useState(false);
  const [topup, setTopup] = useState(false);
  const [hist, setHist] = useState(walletHistory);
  // billing-aware: free → credits meter; explicit subscription → plan card
  // (channels are the resource, no minute math); metered/legacy → minutes meter.
  const { model, explicit } = useBillingModel();
  const t = tone(balance);
  const pct = Math.min(100, Math.round((balance / wallet.planMinutes) * 100));

  const doTopup = (mins: number) => {
    setBalance((b) => b + mins);
    setHist((h) => [{ id: "t" + h.length, type: "topup", label: `Top-up · UPI`, minutes: mins, at: "Just now", balanceAfter: balance + mins }, ...h]);
    setTopup(false);
    toast({ title: "Balance topped up", body: `+${mins.toLocaleString("en-IN")} minutes added.`, severity: "success" });
  };

  if (model === "free") return <TabMeter collapsed={collapsed} />;

  // flat-fee subscription: the resource is channels, not minutes — show the
  // plan instead of a minute meter (only when the model is explicitly chosen,
  // so untouched sessions keep the legacy look).
  if (model === "subscription" && explicit) {
    if (collapsed) {
      return (
        <Link href="/plans" title={`${subscriptionPlan.name} plan · ${subscriptionPlan.channels} channels`}
          className="relative mx-auto mb-1 flex size-10 items-center justify-center rounded-xl border border-foam bg-oat/60 text-caramel hover:border-latte">
          <Layers className="size-[18px]" />
        </Link>
      );
    }
    return (
      <Link href="/plans" data-tour="wallet"
        className="mx-3 mb-1 flex items-center gap-2.5 rounded-xl border border-foam bg-oat/60 px-2.5 py-2 text-left transition-colors hover:border-latte">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-caramel/15 text-caramel"><Layers className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-coffee">{subscriptionPlan.name} plan</div>
          <div className="text-[11px] text-muted-foreground">{subscriptionPlan.channels} channels · flat fee</div>
        </div>
      </Link>
    );
  }

  return (
    <>
      {/* sidebar meter */}
      {collapsed ? (
        <button onClick={() => setOpen(true)} title={`${balance} min · ${t.label}`}
          className={cn("relative mx-auto mb-1 flex size-10 items-center justify-center rounded-xl border", t.ring)}>
          <Clock className={cn("size-[18px]", t.text)} />
          <span className="absolute right-0.5 top-0.5 size-2 rounded-full" style={{ background: t.c }} />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} data-tour="wallet"
          className={cn("mx-3 mb-1 flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors hover:brightness-[0.99]", t.ring)}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${t.c} 18%, transparent)`, color: t.c }}><Clock className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className={cn("text-sm font-semibold tabular-nums", t.text)}>{balance.toLocaleString("en-IN")}</span>
              <span className="text-[11px] text-muted-foreground">min left</span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: t.c }} /></div>
          </div>
        </button>
      )}

      {/* slide-over panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-espresso/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[380px] max-w-[92vw] flex-col border-r border-foam bg-porcelain shadow-card-lg">
            <div className="flex items-center justify-between border-b border-foam px-5 py-4">
              <div className="flex items-center gap-2"><Clock className="size-4 text-caramel" /><span className="font-serif text-lg font-semibold text-coffee">Minute balance</span></div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-coffee"><X className="size-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* balance */}
              <div className={cn("rounded-2xl border p-4", t.ring)}>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5"><span className={cn("font-serif text-4xl font-semibold", t.text)}>{balance.toLocaleString("en-IN")}</span><span className="text-sm text-muted-foreground">minutes</span></div>
                    <div className="mt-0.5 text-xs text-muted-foreground">≈ ₹{(balance * wallet.ratePerMin).toLocaleString("en-IN")} value</div>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", t.text)} style={{ background: `color-mix(in srgb, ${t.c} 14%, transparent)` }}>{t.label}</span>
                </div>
                <button onClick={() => setTopup((v) => !v)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-coffee py-2 text-sm font-semibold text-cream hover:bg-espresso"><Plus className="size-4" /> Top up</button>
              </div>

              {/* top-up packs */}
              {topup && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {topupPacks.map((p) => (
                    <button key={p.minutes} onClick={() => doTopup(p.minutes)} className="relative rounded-xl border border-foam bg-card p-3 text-left hover:border-caramel">
                      {p.badge && <span className="absolute right-2 top-2 rounded-full bg-caramel/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-caramel">{p.badge}</span>}
                      <div className="font-serif text-xl font-semibold text-coffee">{p.minutes.toLocaleString("en-IN")}<span className="text-xs text-muted-foreground"> min</span></div>
                      <div className="mt-0.5 text-xs text-muted-foreground">₹{p.price.toLocaleString("en-IN")}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* usage this cycle */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold uppercase tracking-wider text-mocha">Usage this cycle</span><span className="text-muted-foreground">resets {wallet.cycleResets}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{wallet.usedThisCycle.toLocaleString("en-IN")} / {wallet.planMinutes.toLocaleString("en-IN")} min</span><MiniSpark data={walletUsage} color="var(--color-caramel)" w={90} h={22} /></div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${Math.min(100, (wallet.usedThisCycle / wallet.planMinutes) * 100)}%` }} /></div>
              </div>

              {/* history */}
              <div className="mt-5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-mocha">Balance history</div>
                <ul className="space-y-1">
                  {hist.map((h) => {
                    const Icon = txIcon[h.type]; const credit = h.minutes > 0;
                    return (
                      <li key={h.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-oat/50">
                        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", credit ? "bg-success/12 text-success" : "bg-foam text-mocha")}><Icon className="size-3.5" /></span>
                        <div className="min-w-0 flex-1"><div className="truncate text-sm text-coffee">{h.label}</div><div className="text-[11px] text-muted-foreground">{h.at}</div></div>
                        <span className={cn("font-data text-sm font-medium tabular-nums", credit ? "text-success" : "text-coffee")}>{credit ? "+" : ""}{h.minutes}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* other model */}
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-oat/50 px-3 py-2.5 text-xs text-mocha">
                <Zap className="size-3.5 text-caramel" /> Also on <span className="font-semibold text-coffee">channel purchase</span> — 10 channels.
                <ChevronRight className="ml-auto size-3.5 text-muted-foreground" />
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
