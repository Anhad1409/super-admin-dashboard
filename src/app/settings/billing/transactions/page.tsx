"use client";

/* Settings → Billing → Transactions — the wallet ledger (from the Jul-15 dive). */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Txn = { type: "Call Debit" | "Top-up"; amount: number; balanceAfter: number; durationMin: number | null; desc: string; date: string };

// deterministic ledger walking back from the current balance
const TXNS: Txn[] = (() => {
  const out: Txn[] = [];
  let bal = 78833;
  for (let i = 0; i < 40; i++) {
    const isTopup = i > 0 && i % 17 === 0;
    if (isTopup) {
      out.push({ type: "Top-up", amount: 5000, balanceAfter: bal, durationMin: null, desc: "Wallet top-up · UPI", date: `${14 - Math.floor(i / 12)} Jul 2026, ${String(20 - (i % 12)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")} pm` });
      bal -= 5000;
    } else {
      const mins = i % 9 === 0 ? 3 : i % 5 === 0 ? 2 : 1;
      const amt = mins * 8;
      out.push({ type: "Call Debit", amount: -amt, balanceAfter: bal, durationMin: mins, desc: `Call ${(i * 2654435761 % 0xffffffff).toString(16).slice(0, 8)}… — ${mins * 60}s`, date: `${15 - Math.floor(i / 12)} Jul 2026, ${String(12 - (i % 11) >= 1 ? 12 - (i % 11) : 1).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")} pm` });
      bal += amt;
    }
  }
  return out;
})();

export default function TransactionsPage() {
  const [type, setType] = useState<"All" | "Call Debit" | "Top-up">("All");
  const rows = useMemo(() => TXNS.filter((t) => type === "All" || t.type === type), [type]);

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/settings/billing" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to Billing</Link>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-coffee">Transaction History</h1>
          <p className="mt-1 text-sm text-muted-foreground">2,483 transactions · showing the most recent {TXNS.length}</p>
        </div>
        <div className="flex items-center rounded-full border border-foam bg-cream p-0.5">
          {(["All", "Call Debit", "Top-up"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition-colors", type === t ? "bg-coffee text-cream" : "text-mocha hover:text-coffee")}>{t}</button>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-foam bg-oat/40 text-left font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-mocha">
                <th className="px-5 py-2.5">Type</th><th className="px-4 py-2.5 text-right">Amount</th><th className="px-4 py-2.5 text-right">Balance after</th>
                <th className="px-4 py-2.5 text-right">Duration</th><th className="px-4 py-2.5">Description</th><th className="px-4 py-2.5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foam/70">
              {rows.map((t, i) => (
                <tr key={i} className="hover:bg-oat/25">
                  <td className="px-5 py-2.5">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      t.type === "Call Debit" ? "border-foam bg-oat/60 text-mocha" : "border-success/25 bg-success/10 text-success")}>
                      {t.type === "Call Debit" ? <ArrowUpRight className="size-3" /> : <ArrowDownLeft className="size-3" />} {t.type}
                    </span>
                  </td>
                  <td className={cn("px-4 py-2.5 text-right font-data tabular-nums", t.amount < 0 ? "text-danger" : "text-success")}>{t.amount < 0 ? `-₹${Math.abs(t.amount).toFixed(2)}` : `+₹${t.amount.toFixed(2)}`}</td>
                  <td className="px-4 py-2.5 text-right font-data text-coffee tabular-nums">₹{t.balanceAfter.toLocaleString("en-IN")}.00</td>
                  <td className="px-4 py-2.5 text-right font-data text-xs text-mocha">{t.durationMin ? `${t.durationMin} min` : "—"}</td>
                  <td className="max-w-[280px] truncate px-4 py-2.5 font-data text-xs text-muted-foreground">{t.desc}</td>
                  <td className="px-4 py-2.5 text-right font-data text-xs text-latte">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-foam bg-cream/50 px-5 py-2.5 text-[11px] text-muted-foreground">Debits are ceiled per started minute at ₹8/min. Top-ups reflect instantly; GST invoices land in Billing → Invoices.</p>
      </section>
    </div>
  );
}
