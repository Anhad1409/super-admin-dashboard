"use client";

/* /forgot — request a password reset. Mock: "sends" a link and offers the
   demo shortcut straight into /reset. Dashboard design language. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, MailCheck } from "lucide-react";
import { JourneyShell, JourneyCard } from "@/components/auth/journey-shell";
import { EMAIL_RE } from "../login/pour";

export default function ForgotPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(false);
  const [sent, setSent] = useState(false);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setErr(true); return; }
    try { sessionStorage.setItem("vb-reset-email", email.trim()); } catch {}
    setSent(true);
  };

  return (
    <JourneyShell>
      <JourneyCard className="max-w-md">
        <AnimatePresence mode="wait" initial={false}>
          {!sent ? (
            <motion.form key="ask" onSubmit={send} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <span className="grid size-12 place-items-center rounded-2xl bg-oat">
                <KeyRound className="size-6 text-caramel" />
              </span>
              <h1 className="mt-4 font-serif text-2xl font-semibold text-coffee">Lost your key?</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Tell us the email on the tab and we&apos;ll send a reset link — still hot.</p>
              <label htmlFor="fg-email" className="mb-1.5 mt-6 block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em] text-mocha">Work email</label>
              <input id="fg-email" type="email" autoFocus autoComplete="email" inputMode="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setErr(false); }}
                className="h-11 w-full rounded-xl border border-foam bg-cream px-3.5 text-[15px] text-coffee outline-none transition-colors focus:border-caramel focus:shadow-[0_0_0_3px_rgba(184,118,61,0.25)]"
                style={{ borderColor: err ? "#a5432c" : undefined, caretColor: "#b8763d" }} />
              {err && <p className="mt-1.5 text-[12px] text-danger">That doesn&apos;t look like an email — one more look?</p>}
              <button type="submit" className="mt-5 h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark">
                Send the reset link
              </button>
              <button type="button" onClick={() => router.push("/login")} className="mt-4 block w-full text-center text-[13px] text-mocha underline-offset-4 hover:underline">
                ← Back to the counter
              </button>
            </motion.form>
          ) : (
            <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-oat">
                <MailCheck className="size-6 text-steam" />
              </span>
              <h1 className="mt-4 font-serif text-2xl font-semibold text-coffee">Check your inbox — it&apos;s still hot.</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Reset link sent to <span className="font-medium text-coffee">{email}</span>. It works for 30 minutes.
              </p>
              <button onClick={() => router.push("/reset")}
                className="mt-6 h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark">
                Open the link (demo)
              </button>
              <button onClick={() => setSent(false)} className="mt-4 text-[13px] text-mocha underline-offset-4 hover:underline">
                Wrong address? Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </JourneyCard>
    </JourneyShell>
  );
}
