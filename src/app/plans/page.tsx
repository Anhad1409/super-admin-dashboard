"use client";

/* /plans — "SETTLE YOUR TAB". The café's bill fold: Open Tab (free, you are
   here) · Regulars' Card (pay as you pour) · House Account. GSTIN/billing live
   only in the CheckoutSheet. Honest freemium — no timers, no nags. Spec §5. */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Coffee, X } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { toast } from "@/components/notifications/toaster";
import { getTableNo, getPlan, creditSips, setPlan, sipsToMin } from "@/lib/tab-mock";

const mono = "font-[family-name:var(--font-data)]";
const RUNGS = [
  { inr: 500, label: "₹500", min: "≈ 62 min" },
  { inr: 2000, label: "₹2,000", min: "≈ 250 min" },
  { inr: 10000, label: "₹10,000", min: "≈ 1,250 min" },
];

function CheckoutSheet({ inr, onClose }: { inr: number; onClose: () => void }) {
  const [paying, setPaying] = useState(false);
  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      creditSips(inr, `CARD LOADED · ₹${inr.toLocaleString("en-IN")}`);
      setPlan("regular");
      toast({ title: "Card loaded", body: `₹${inr.toLocaleString("en-IN")} on the tab ≈ ${sipsToMin(inr)} minutes.`, severity: "success" });
      onClose();
    }, 700);
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] grid place-items-center p-5" style={{ background: "rgba(42,26,15,0.4)", backdropFilter: "blur(4px)" }}>
      <motion.div initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="w-full max-w-[420px] rounded-3xl border border-[#d8bf9a] bg-porcelain p-6 shadow-card-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-coffee">Load the card</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-coffee"><X className="size-4" /></button>
        </div>
        <p className={`${mono} mt-1 text-[11px] uppercase tracking-[0.12em] text-caramel`}>₹{inr.toLocaleString("en-IN")} · {RUNGS.find((r) => r.inr === inr)?.min}</p>
        <div className="mt-4 space-y-3">
          <input placeholder="Card number" className="h-11 w-full rounded-xl border border-[#d8bf9a] bg-cream px-3.5 text-sm text-coffee outline-none focus:border-caramel" />
          <div className="flex gap-3">
            <input placeholder="MM / YY" className="h-11 w-1/2 rounded-xl border border-[#d8bf9a] bg-cream px-3.5 text-sm text-coffee outline-none focus:border-caramel" />
            <input placeholder="CVC" className="h-11 w-1/2 rounded-xl border border-[#d8bf9a] bg-cream px-3.5 text-sm text-coffee outline-none focus:border-caramel" />
          </div>
          <input placeholder="GSTIN (optional)" className="h-11 w-full rounded-xl border border-[#d8bf9a] bg-cream px-3.5 text-sm text-coffee outline-none focus:border-caramel" />
          <input placeholder="Billing address" className="h-11 w-full rounded-xl border border-[#d8bf9a] bg-cream px-3.5 text-sm text-coffee outline-none focus:border-caramel" />
          <p className={`${mono} text-[10px] text-latte`}>GST details live here, where the bill does.</p>
        </div>
        <button onClick={pay} className="mt-4 h-12 w-full rounded-xl bg-coffee font-serif text-[16px] font-semibold text-cream hover:bg-espresso">
          {paying ? "Pouring…" : `Pay ₹${inr.toLocaleString("en-IN")}`}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function PlansPage() {
  const [tableNo, setTableNo] = useState<string | null>(null);
  const [plan, setPlanState] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<number | null>(null);
  useEffect(() => { setTableNo(getTableNo()); setPlanState(getPlan()); }, [checkout]);

  const Row = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-2 text-[13px] text-mocha"><Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {children}</li>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Settle your tab" subtitle="You owe nothing — the first 50 were on the house. This page is for when you want a bigger cup." />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* THE OPEN TAB */}
        <motion.section whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="relative overflow-hidden rounded-2xl border border-[#d8bf9a] bg-porcelain p-6 shadow-glass">
          <div className={`${mono} text-[11px] uppercase tracking-[0.14em] text-mocha`}>The Open Tab {plan === "free" && <span className="text-steam">· you are here</span>}</div>
          <div className="mt-2 flex items-baseline gap-2"><span className="font-serif text-4xl font-semibold text-coffee">₹0</span><span className="text-sm text-muted-foreground">forever</span></div>
          <ul className="mt-5 space-y-2.5">
            <Row>50 opening sips, on the house · <b>never expire</b></Row>
            <Row>Calls to your own verified number (the tasting table)</Row>
            <Row>Every language on the shelf · every feature, sandbox-unlocked</Row>
            <Row>DND scrubbed by the house, always</Row>
          </ul>
          {tableNo && (
            <div className={`${mono} absolute -right-3 top-16 rotate-[8deg] border-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]`}
              style={{ borderColor: "#4fb0a5", color: "#4fb0a5", borderRadius: 6 }}>
              Table No. {tableNo} — seated
            </div>
          )}
        </motion.section>

        {/* REGULARS' CARD */}
        <motion.section whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="rounded-2xl border-2 border-caramel/50 bg-porcelain p-6 shadow-card-lg">
          <div className={`${mono} text-[11px] uppercase tracking-[0.14em] text-caramel`}>Regulars&apos; Card · recommended</div>
          <div className="mt-2 flex items-baseline gap-2"><span className="font-serif text-4xl font-semibold text-coffee">₹8</span><span className="text-sm text-muted-foreground">per minute · pay as you pour</span></div>
          <p className="mt-2 text-[13px] font-medium text-coffee">Pour for your customers, not just your table.</p>
          <ul className="mt-4 space-y-2.5">
            <Row>Real customer numbers — no sandbox walls</Row>
            <Row>Your own 140/160-series caller ID</Row>
            <Row>DND scrubbing at campaign scale</Row>
            <Row><b>The License to Serve</b> go-live checklist, guided</Row>
          </ul>
          <div className={`${mono} mt-5 space-y-1.5 border-t border-dashed border-foam pt-4 text-[12px] text-mocha`}>
            {RUNGS.map((r) => (
              <div key={r.inr} className="flex items-baseline gap-1.5">
                <span>{r.label}</span><span className="flex-1 border-b border-dotted border-latte" style={{ transform: "translateY(-3px)" }} /><span>{r.min}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            {RUNGS.map((r) => (
              <button key={r.inr} onClick={() => setCheckout(r.inr)} className="flex-1 rounded-xl border border-[#d8bf9a] bg-cream px-2 py-2 text-[13px] font-semibold text-coffee transition-colors hover:border-caramel hover:bg-oat">
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={() => setCheckout(2000)} className="mt-3 h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground hover:bg-brand-dark">
            Load the card
          </button>
        </motion.section>

        {/* HOUSE ACCOUNT */}
        <motion.section whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="rounded-2xl border border-[#d8bf9a] bg-porcelain p-6 shadow-glass">
          <div className={`${mono} text-[11px] uppercase tracking-[0.14em] text-mocha`}>House Account · for the big rooms</div>
          <div className="mt-2 flex items-baseline gap-2"><span className="font-serif text-4xl font-semibold text-coffee">Custom</span><span className="text-sm text-muted-foreground">monthly invoice</span></div>
          <ul className="mt-5 space-y-2.5">
            <Row>Volume rates that improve as you pour</Row>
            <Row>Dedicated lines &amp; SLAs</Row>
            <Row>Go-live concierge for the DLT paperwork</Row>
            <Row>Named support — ask for the manager anytime</Row>
          </ul>
          <button onClick={() => toast({ title: "The manager will call you", body: "Mock: sales contact flow.", severity: "info" })}
            className="mt-6 h-12 w-full rounded-xl border border-[#d8bf9a] bg-card font-serif text-[16px] font-semibold text-coffee transition-colors hover:bg-oat">
            Talk to the manager
          </button>
        </motion.section>
      </div>

      <p className={`${mono} mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-latte`}>
        <Coffee className="size-3.5" /> No trial countdowns, no expiry, no surprises — free sips stay free.
      </p>

      <AnimatePresence>{checkout !== null && <CheckoutSheet inr={checkout} onClose={() => setCheckout(null)} />}</AnimatePresence>
    </div>
  );
}
