"use client";

/* Freemium credit meter — professional wording in-app (credits · free trial);
   the receipt-style visuals stay. Reads tab-mock only; paid models untouched. */

import { useEffect, useState } from "react";
import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCredits, getLedger, getTableNo, sipsToMin, type LedgerLine } from "@/lib/tab-mock";

const mono = "font-[family-name:var(--font-data)]";

function CupGlyphMini({ warm }: { warm: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      <rect x="12.5" y="13" width="7" height="8" rx="1" fill="#fffdf9" stroke="#c9a87c" strokeWidth="0.8" transform="rotate(6 16 17)" />
      <path d="M3 7 h12 l-1.7 10 a2 2 0 0 1 -2 1.7 h-4.6 a2 2 0 0 1 -2 -1.7 Z" fill={warm ? "#b8763d" : "#c9a87c"} opacity="0.25" />
      <path d="M3 7 h12 l-1.7 10 a2 2 0 0 1 -2 1.7 h-4.6 a2 2 0 0 1 -2 -1.7 Z" fill="none" stroke={warm ? "#b8763d" : "#6b4423"} strokeWidth="1.3" />
      <path d="M15 9 q3 .5 2.2 2.8 q-.6 1.8 -2.8 1.4" fill="none" stroke={warm ? "#b8763d" : "#6b4423"} strokeWidth="1.1" />
    </svg>
  );
}

export function TabMeter({ collapsed = false }: { collapsed?: boolean }) {
  const [sips, setSips] = useState(0);
  const [ledger, setLedger] = useState<LedgerLine[]>([]);
  const [open, setOpen] = useState(false);
  const [tableNo, setTableNo] = useState<string | null>(null);
  const [echo, setEcho] = useState(false);
  const [nudgeOk, setNudgeOk] = useState(false);

  useEffect(() => {
    const sync = () => { setSips(getCredits()); setLedger(getLedger()); setTableNo(getTableNo()); };
    sync();
    try {
      if (sessionStorage.getItem("vb-just-granted")) {
        sessionStorage.removeItem("vb-just-granted");
        setEcho(true); setSips(0);
        setTimeout(() => setSips(getCredits()), 350); // NumberFlow echo 0→50
      }
      const seen = Number(localStorage.getItem("vb-nudge-seen") || "0");
      setNudgeOk(Date.now() - seen > 24 * 3600 * 1000);
    } catch {}
    window.addEventListener("vb-credits-change", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("vb-credits-change", sync); window.removeEventListener("storage", sync); };
  }, []);

  const warm = sips <= 20;
  const barColor = warm ? "#b8763d" : "#c9a87c";
  const pct = Math.min(100, (sips / 50) * 100);

  return (
    <>
      {collapsed ? (
        <button onClick={() => setOpen(true)} title={`${sips} credits · free trial`}
          className="relative mx-auto mb-1 flex size-10 items-center justify-center rounded-xl border border-[#d8bf9a] bg-cream">
          <CupGlyphMini warm={warm} />
          <span className="absolute right-0.5 top-0.5 size-2 rounded-full" style={{ background: "#4fb0a5" }} />
        </button>
      ) : (
        <div className="mx-3 mb-1">
          <button onClick={() => setOpen(true)} data-tour="wallet"
            className="flex w-full items-center gap-2.5 rounded-xl border border-[#d8bf9a] bg-cream px-2.5 py-2 text-left transition-colors hover:bg-oat/70">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-oat"><CupGlyphMini warm={warm} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold tabular-nums text-coffee">
                  <NumberFlow value={sips} transformTiming={{ duration: echo ? 800 : 350, easing: "ease-out" }} />
                </span>
                <span className="text-[11px] text-muted-foreground">credits</span>
              </div>
              <div className={`${mono} text-[9px] uppercase tracking-[0.1em] text-latte`}>free trial</div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-foam">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
              </div>
            </div>
          </button>
          {sips <= 5 && nudgeOk && (
            <button
              onClick={() => { try { localStorage.setItem("vb-nudge-seen", String(Date.now())); } catch {} setNudgeOk(false); }}
              className={`${mono} mt-1 block w-full px-1 text-left text-[9px] leading-snug text-latte hover:text-mocha`}>
              CREDITS RUNNING LOW — UPGRADE WHEN YOU&apos;RE READY. ✕
            </button>
          )}
        </div>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-espresso/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[380px] max-w-[92vw] flex-col border-r border-foam bg-porcelain shadow-card-lg">
            <div className="flex items-center justify-between border-b border-foam px-5 py-4">
              <div className="flex items-center gap-2"><CupGlyphMini warm={warm} /><span className="font-serif text-lg font-semibold text-coffee">Trial credits</span></div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-coffee"><X className="size-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="rounded-2xl border border-[#d8bf9a] bg-cream p-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-4xl font-semibold text-coffee">{sips}</span>
                  <span className="text-sm text-muted-foreground">credits</span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">≈ {sipsToMin(sips)} min of calling at ₹8/min · free credits never expire</div>
                {tableNo && <div className={`${mono} mt-2 text-[10px] uppercase tracking-[0.12em] text-steam`}>Account #{tableNo}</div>}
              </div>
              <div className={`${mono} mt-4 space-y-1.5 text-[11px] uppercase text-mocha`}>
                {ledger.length === 0 && <div className="text-latte">NO USAGE YET.</div>}
                {ledger.map((l, i) => (
                  <div key={i} className="flex items-baseline gap-1.5">
                    <span className="min-w-0 truncate">{l.label}</span>
                    <span className="mx-1 flex-1 border-b border-dotted border-latte" style={{ transform: "translateY(-3px)" }} />
                    <span style={{ color: l.delta === null ? "#4fb0a5" : l.delta >= 0 ? "#4fb0a5" : "#a5432c" }}>
                      {l.delta === null ? "FREE" : l.delta >= 0 ? `+${l.delta}` : l.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-foam p-4">
              <Link href="/plans" onClick={() => setOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-coffee font-serif text-[15px] font-semibold text-cream hover:bg-espresso">
                Upgrade plan →
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
