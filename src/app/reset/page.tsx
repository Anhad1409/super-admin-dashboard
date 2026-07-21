"use client";

/* /reset — set a new password (the emailed link lands here). Confirm-match
   check, lid-off toggles, success state → back to the counter. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { JourneyShell, JourneyCard } from "@/components/auth/journey-shell";

export default function ResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try { setEmail(sessionStorage.getItem("vb-reset-email")); } catch {}
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (p1.length < 8) { setErr("Use at least 8 characters — a strong blend."); return; }
    if (p1 !== p2) { setErr("The two cups don't match — pour them again."); return; }
    setErr(null);
    setDone(true);
    try { sessionStorage.removeItem("vb-reset-email"); } catch {}
  };

  const inputCls = "h-11 w-full rounded-xl border border-foam bg-cream px-3.5 pr-11 text-[15px] text-coffee outline-none transition-colors focus:border-caramel focus:shadow-[0_0_0_3px_rgba(184,118,61,0.25)]";

  return (
    <JourneyShell>
      <JourneyCard className="max-w-md">
        <AnimatePresence mode="wait" initial={false}>
          {!done ? (
            <motion.form key="form" onSubmit={submit} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <span className="grid size-12 place-items-center rounded-2xl bg-oat"><Lock className="size-6 text-caramel" /></span>
              <h1 className="mt-4 font-serif text-2xl font-semibold text-coffee">Cut a new key</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {email ? <>For <span className="font-medium text-coffee">{email}</span>. </> : null}
                Pick a fresh password — at least 8 characters.
              </p>

              <label htmlFor="rp-1" className="mb-1.5 mt-6 block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em] text-mocha">New password</label>
              <div className="relative">
                <input id="rp-1" type={show ? "text" : "password"} autoFocus autoComplete="new-password" value={p1}
                  onChange={(e) => { setP1(e.target.value); setErr(null); }} className={inputCls} style={{ caretColor: "#b8763d" }} />
                <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((v) => !v)}
                  className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-mocha transition-colors hover:bg-oat">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              <label htmlFor="rp-2" className="mb-1.5 mt-4 block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em] text-mocha">Pour it again</label>
              <input id="rp-2" type={show ? "text" : "password"} autoComplete="new-password" value={p2}
                onChange={(e) => { setP2(e.target.value); setErr(null); }} className={inputCls} style={{ caretColor: "#b8763d" }} />
              {err && <p role="alert" className="mt-2 text-[13px] text-danger">{err}</p>}

              <button type="submit" className="mt-5 h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark">
                Save the new key
              </button>
              <button type="button" onClick={() => router.push("/login")} className="mt-4 block w-full text-center text-[13px] text-mocha underline-offset-4 hover:underline">
                ← Back to the counter
              </button>
            </motion.form>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-oat"><CheckCircle2 className="size-6 text-success" /></span>
              <h1 className="mt-4 font-serif text-2xl font-semibold text-coffee">Fresh key, cut and polished.</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Your password is updated. Sign in with the new one — the kettle&apos;s still on.</p>
              <button onClick={() => router.push("/login")}
                className="mt-6 h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark">
                Back to the counter
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </JourneyCard>
    </JourneyShell>
  );
}
