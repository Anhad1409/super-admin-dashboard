"use client";

/* /forgot/v2 — password reset request, v2 chrome. Email → sent state. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { KeyRound, MailCheck } from "lucide-react";
import { V2Frame, V2Card, mono, v2Input, v2Label } from "@/components/auth/v2-kit";
import { EMAIL_RE } from "../../login/pour";

export default function ForgotV2Page() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setErr(true); return; }
    setErr(false);
    setSent(true);
  };

  return (
    <V2Frame>
      <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }} className="w-full max-w-md">
        <V2Card className="text-center">
          <AnimatePresence mode="wait" initial={false}>
            {!sent ? (
              <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="mx-auto grid size-12 place-items-center rounded-2xl"
                  style={{ background: "color-mix(in srgb, var(--color-mango) 16%, #fffdf9)", border: "1px solid color-mix(in srgb, var(--color-mango) 32%, var(--color-foam))" }}>
                  <KeyRound className="size-6" style={{ color: "color-mix(in srgb, var(--color-mango) 70%, #2a1a0f)" }} />
                </span>
                <h1 className="mt-4 font-serif text-2xl font-semibold text-coffee">Reset your password</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Tell us your work email and we&apos;ll send a reset link.
                </p>
                <form onSubmit={submit} noValidate className="mt-6 text-left">
                  <label htmlFor="f2-email" className={v2Label}>Work email</label>
                  <input id="f2-email" type="email" autoFocus autoComplete="email" inputMode="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setErr(false); }}
                    className={v2Input} style={{ borderColor: err ? "#a5432c" : undefined, caretColor: "#b8763d" }} />
                  <div className="min-h-[20px] pt-1">
                    {err && <p className="text-[12px] text-danger">That doesn&apos;t look like an email — one more look?</p>}
                  </div>
                  <button type="submit"
                    className="mt-2 h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark">
                    Send reset link
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <span className="mx-auto grid size-12 place-items-center rounded-2xl"
                  style={{ background: "color-mix(in srgb, var(--color-matcha) 18%, #fffdf9)", border: "1px solid color-mix(in srgb, var(--color-matcha) 32%, var(--color-foam))" }}>
                  <MailCheck className="size-6 text-success" />
                </span>
                <h1 className="mt-4 font-serif text-2xl font-semibold text-coffee">Reset link sent</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Check <span className="font-medium text-coffee">{email}</span> — the link works for 30 minutes.
                </p>
                <p className={`${mono} mt-0.5 text-[10px] uppercase tracking-[0.12em] text-latte`}>demo: head back and sign in with anything</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => router.push("/login/v2")} className="mt-4 text-[13px] text-mocha underline-offset-4 hover:underline">
            ← Back to sign in
          </button>
        </V2Card>
      </motion.div>
    </V2Frame>
  );
}
