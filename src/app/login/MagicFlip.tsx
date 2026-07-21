"use client";

/* Magic-link face (back of the card flip). Spec §6.6. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const inputCls =
  "h-11 w-full rounded-xl border bg-[#fdf8f0] px-3.5 text-[15px] text-[#2a1a0f] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#b8763d] focus:shadow-[0_0_0_3px_rgba(184,118,61,0.35)]";

export function MagicFace({ initialEmail, onBack }: { initialEmail: string; onBack: () => void }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [flying, setFlying] = useState(false);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (reduce) { setSent(true); return; }
    setFlying(true);
    setTimeout(() => setSent(true), 620);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {!sent ? (
          <motion.form key="ask" onSubmit={send} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <h2 className="font-serif text-2xl" style={{ color: "#2a1a0f" }}>One fresh link, coming up</h2>
            <div>
              <label htmlFor="magic-email" className="mb-1.5 block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em]" style={{ color: "#6b4423" }}>
                Work email
              </label>
              <input
                id="magic-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                style={{ borderColor: "#d8bf9a", caretColor: "#b8763d" }}
              />
            </div>
            <div className="relative">
              <motion.button
                type="submit"
                layout
                className="h-12 w-full rounded-xl font-serif text-[17px] font-semibold"
                style={{ background: "#b8763d", color: "#fffdf9" }}
                whileTap={{ scale: 0.98 }}
                animate={flying ? { width: 56, borderRadius: 999 } : {}}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {flying ? "·" : "Send the link"}
              </motion.button>
              {/* paper plane rides a steam curl off-canvas */}
              <AnimatePresence>
                {flying && !reduce && (
                  <motion.svg
                    key="plane"
                    width="26" height="26" viewBox="0 0 24 24"
                    className="pointer-events-none absolute -top-2 right-6"
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    animate={{ x: 140, y: -120, rotate: 24, opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <path d="M2 21 L23 12 L2 3 L6 12 Z" fill="#b8763d" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
            <button type="button" onClick={onBack} className="text-[13px] underline-offset-4 hover:underline" style={{ color: "#6b4423" }}>
              ← back to the counter
            </button>
          </motion.form>
        ) : (
          <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-3">
            <p className="font-serif text-xl italic" style={{ color: "#2a1a0f" }}>Check your inbox — it&apos;s still hot.</p>
            <p className="font-[family-name:var(--font-data)] text-[11px]" style={{ color: "#6b4423" }}>sent to {email}</p>
            <button type="button" onClick={() => router.push("/magic")}
              className="h-11 w-full rounded-xl bg-brand font-serif text-[15px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark">
              Tap the bean ✳ (demo)
            </button>
            <button type="button" onClick={onBack} className="mt-1 text-[13px] underline-offset-4 hover:underline" style={{ color: "#6b4423" }}>
              ← back to the counter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
