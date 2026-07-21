"use client";

import { useState } from "react";
import { Zap, Clock, IndianRupee, Plus, ArrowDownRight, Gift, Download } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { GlazedTile } from "@/components/settings/glaze";
import { CHANNELS } from "@/lib/channel-mock";
import { wallet, walletHistory, topupPacks, walletState } from "@/lib/wallet-mock";
import { formatINR } from "@/lib/format";

const TABS = ["Overview", "Channels", "Minutes", "Transactions"];
const channelRate = 4999; // ₹/channel/mo

export default function BillingPage() {
  const [tab, setTab] = useState(TABS[0]);
  const [bal, setBal] = useState(wallet.minutes);
  const st = walletState(bal);
  const stColor = st === "critical" ? "text-danger" : st === "low" ? "text-warning" : "text-success";

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Billing" subtitle="Two ways to pay — buy channels, or run on a minute balance" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Channels" value={`${CHANNELS}`} icon={Zap} sub="1 channel = 1 live call" />
        <StatCard label="Minute balance" value={`${bal.toLocaleString("en-IN")}`} icon={Clock} sub={st === "healthy" ? "healthy" : st === "low" ? "running low" : "critical"} />
        <StatCard label="Spend this cycle" value={formatINR(64990)} icon={IndianRupee} sub="channels + minutes" />
        <StatCard label="Plan" value="Growth" icon={Gift} sub="resets 1 Jul" />
      </div>

      <div className="mb-4 flex gap-1 border-b border-foam">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === t ? "border-caramel text-caramel" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>)}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* channel model */}
          <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="flex items-center gap-2"><GlazedTile icon={Zap} tint="var(--color-caramel)" size="sm" /><h3 className="font-serif text-lg font-semibold text-coffee">Channel purchase</h3></div>
            <p className="mt-2 text-sm text-muted-foreground">Buy channels for flat, predictable cost. Each channel runs one live call at a time.</p>
            <div className="mt-3 flex items-baseline gap-1"><span className="font-serif text-3xl font-semibold text-coffee">{CHANNELS}</span><span className="text-sm text-muted-foreground">channels · {formatINR(channelRate)}/mo each</span></div>
            <Button onClick={() => toast({ title: "Channels", body: "Opening channel plan…", severity: "info" })} className="mt-4 gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Add channels</Button>
          </div>
          {/* minute model */}
          <div className={cn("rounded-2xl border p-5 shadow-glass", st === "healthy" ? "border-foam bg-porcelain" : st === "low" ? "border-warning/40 bg-warning/5" : "border-danger/40 bg-danger/5")}>
            <div className="flex items-center gap-2"><GlazedTile icon={Clock} tint="var(--color-mango)" size="sm" /><h3 className="font-serif text-lg font-semibold text-coffee">Minute balance</h3></div>
            <p className="mt-2 text-sm text-muted-foreground">Pay-as-you-go from a prepaid minute wallet at {formatINR(wallet.ratePerMin)}/min.</p>
            <div className="mt-3 flex items-baseline gap-1"><span className={cn("font-serif text-3xl font-semibold", stColor)}>{bal.toLocaleString("en-IN")}</span><span className="text-sm text-muted-foreground">minutes left</span></div>
            <Button onClick={() => setTab("Minutes")} className="mt-4 gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Top up</Button>
          </div>
        </div>
      )}

      {tab === "Channels" && (
        <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-foam bg-oat/40 text-left text-xs text-mocha"><th className="px-4 py-2.5">Channel</th><th className="px-4 py-2.5">Assigned to</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5 text-right">Rate</th></tr></thead>
            <tbody className="divide-y divide-foam">
              {Array.from({ length: CHANNELS }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5 font-medium text-coffee">Channel {i + 1}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{i < 3 ? "Outreach campaign" : i < 5 ? "EMI Reminders" : "—"}</td>
                  <td className="px-4 py-2.5"><span className={cn("text-xs font-medium", i < 6 ? "text-success" : "text-muted-foreground")}>{i < 6 ? "Active" : "Idle"}</span></td>
                  <td className="px-4 py-2.5 text-right font-data text-xs text-coffee">{formatINR(channelRate)}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end border-t border-foam p-3"><Button size="sm" onClick={() => toast({ title: "Add channels", body: "Channel purchase flow…", severity: "info" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Add channels</Button></div>
        </div>
      )}

      {tab === "Minutes" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="text-xs font-semibold uppercase tracking-wider text-mocha">Balance</div>
            <div className="mt-1 flex items-baseline gap-1.5"><span className={cn("font-serif text-4xl font-semibold", stColor)}>{bal.toLocaleString("en-IN")}</span><span className="text-sm text-muted-foreground">min · ≈ {formatINR(bal * wallet.ratePerMin)}</span></div>
            <div className="mt-3 text-xs text-muted-foreground">Used {wallet.usedThisCycle.toLocaleString("en-IN")} / {wallet.planMinutes.toLocaleString("en-IN")} this cycle</div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${Math.min(100, (wallet.usedThisCycle / wallet.planMinutes) * 100)}%` }} /></div>
          </div>
          <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-mocha">Top up</div>
            <div className="grid grid-cols-2 gap-2">
              {topupPacks.map((p) => (
                <button key={p.minutes} onClick={() => { setBal((b) => b + p.minutes); toast({ title: "Balance topped up", body: `+${p.minutes.toLocaleString("en-IN")} minutes added.`, severity: "success" }); }} className="relative rounded-xl border border-foam bg-card p-3 text-left hover:border-caramel">
                  {p.badge && <span className="absolute right-2 top-2 rounded-full bg-caramel/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-caramel">{p.badge}</span>}
                  <div className="font-serif text-xl font-semibold text-coffee">{p.minutes.toLocaleString("en-IN")}<span className="text-xs text-muted-foreground"> min</span></div>
                  <div className="text-xs text-muted-foreground">{formatINR(p.price)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Transactions" && (
        <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
          <div className="flex items-center justify-between px-5 py-3"><span className="text-sm font-semibold text-coffee">Recent transactions</span><Button size="sm" variant="outline" onClick={() => toast({ title: "Export", body: "Statement downloading…", severity: "info" })} className="gap-1.5 text-mocha"><Download className="size-3.5" /> Export</Button></div>
          <ul className="divide-y divide-foam">
            {walletHistory.map((h) => {
              const credit = h.minutes > 0; const Icon = h.type === "bonus" ? Gift : credit ? Plus : ArrowDownRight;
              return (
                <li key={h.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={cn("flex size-8 items-center justify-center rounded-full", credit ? "bg-success/12 text-success" : "bg-foam text-mocha")}><Icon className="size-4" /></span>
                  <div className="flex-1"><div className="text-sm font-medium text-coffee">{h.label}</div><div className="text-[11px] text-muted-foreground">{h.at}</div></div>
                  <span className={cn("font-data text-sm tabular-nums", credit ? "text-success" : "text-coffee")}>{credit ? "+" : ""}{h.minutes} min</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
