"use client";

/* NOW SERVING ticker — deli-counter NumberFlow digits, rotating entries,
   stamp interrupts (email received / final). Spec §3.1(d), §6.1, §8. */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { TICKER_ENTRIES } from "./pour";

export type Stamp = { kind: "order" | "final" | "grinding"; text: string } | null;

export function Ticker({ dimmed, stamp }: { dimmed: boolean; stamp: Stamp }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [call, setCall] = useState(48213);
  const holdRef = useRef(false);

  // hold rotation while a stamp shows (2s for order stamps)
  useEffect(() => {
    holdRef.current = !!stamp;
  }, [stamp]);

  useEffect(() => {
    const id = setInterval(() => {
      if (holdRef.current) return;
      setI((v) => (v + 1) % TICKER_ENTRIES.length);
      setCall((c) => c + 7 + Math.floor(Math.random() * 28));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const e = TICKER_ENTRIES[i];

  return (
    <div
      aria-live="off"
      className="border-t pt-4 transition-opacity duration-300"
      style={{ borderColor: "#d8bf9a", opacity: dimmed ? 0.6 : 1 }}
    >
      <div className="flex items-center gap-2.5 font-[family-name:var(--font-data)] text-[12px]">
        <span className="flex items-center gap-1.5 font-semibold tracking-[0.14em]" style={{ color: "#4fb0a5" }}>
          <motion.span
            className="inline-block size-1.5 rounded-full"
            style={{ background: "#4fb0a5" }}
            animate={reduce ? undefined : { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          NOW SERVING
        </span>
        <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap" style={{ color: "#3d2817" }}>
          <AnimatePresence mode="wait" initial={false}>
            {stamp ? (
              <motion.span
                key={`stamp-${stamp.text}`}
                initial={reduce || dimmed ? { opacity: 0 } : { y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block font-medium"
                style={{ color: stamp.kind === "grinding" ? "#6b4423" : "#b8763d" }}
              >
                {stamp.text}
              </motion.span>
            ) : (
              <motion.span
                key={i}
                initial={reduce || dimmed ? { opacity: 0 } : { y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                CALL&nbsp;#
                <NumberFlow
                  value={call}
                  format={{ useGrouping: true }}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                />
                &nbsp;· {e.label} · {e.city} · {e.dur}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>
      <div className="mt-1.5 font-[family-name:var(--font-data)] text-[12px]" style={{ color: "#6b4423" }}>
        You&apos;re №073 in today&apos;s tasting
      </div>
    </div>
  );
}
