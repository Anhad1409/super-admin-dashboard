"use client";

/* /signup/v2 — create account, in the v2 language. Left: animated lockup,
   pitch, live agent call. Right: 3 fields + House Rules consent →
   /verify/v2 (email code) → /welcome/v2. Mock: taken@… is rejected. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { V2Frame, V2Card, EASE, mono, v2Input, v2Label, LiveCallCard } from "@/components/auth/v2-kit";
import { EMAIL_RE } from "../../login/pour";
import { setProfile, resetTab } from "@/lib/tab-mock";

export default function SignupV2Page() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magic, setMagic] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState<null | "email" | "taken">(null);
  const [opening, setOpening] = useState(false);

  const done = name.trim() && email.trim() && (magic || password.length > 0) && agreed;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!done || opening) return;
    if (!EMAIL_RE.test(email.trim())) { setErr("email"); return; }
    if (email.trim().toLowerCase().startsWith("taken@")) { setErr("taken"); return; }
    setErr(null);
    setOpening(true);
    resetTab(); // fresh tab per registration — the wizard always runs
    setProfile({ name: name.trim(), email: email.trim(), agreedTerms: true });
    try { sessionStorage.setItem("vb-tab-open", "1"); sessionStorage.setItem("vb-v2-journey", "1"); sessionStorage.removeItem("vb-email-verified"); } catch {}
    setTimeout(() => router.push("/verify/v2"), reduce ? 150 : 500);
  };

  const rows = { hidden: reduce ? {} : { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } };
  const stack = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.05 } } };

  return (
    <V2Frame wide showLockup={false}>
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT — the pitch */}
        <motion.section variants={stack} initial="hidden" animate="show" className="max-w-xl">
          <motion.div variants={rows} className="flex items-center gap-4">
            <BrandMark animated className="w-24 shrink-0 sm:w-28" />
            <div>
              <div className="font-serif text-[34px] font-semibold leading-none tracking-tight text-coffee sm:text-[40px]">
                Voice<span className="text-caramel">Brew</span>
              </div>
              <div className={`${mono} mt-1.5 text-[11px] font-medium uppercase tracking-[0.3em] text-latte`}>by Blostem</div>
            </div>
          </motion.div>
          <motion.h1 variants={rows} className="mt-6 font-serif text-[34px] font-semibold leading-[1.15] tracking-tight text-coffee sm:text-[40px]">
            Start free.
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(92deg, var(--color-caramel), var(--color-mango) 55%, var(--color-steam))" }}>
              Your first calls are on the house.
            </span>
          </motion.h1>
          <motion.ul variants={rows} className="mt-5 space-y-2.5">
            {[
              "50 free sips ≈ 6 minutes of AI calls — no card, no clock",
              "Start calling in minutes — no telephony setup",
              "Hindi, Hinglish, English & 4 more languages",
              "TRAI-safe by default: DND-scrubbed, 9am–9pm only",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[14.5px] text-mocha">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {t}
              </li>
            ))}
          </motion.ul>
          <motion.div variants={rows} className="mt-6">
            <LiveCallCard />
          </motion.div>
        </motion.section>

        {/* RIGHT — the form */}
        <motion.section initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.15 }}
          className="w-full max-w-md justify-self-center lg:justify-self-end">
          <V2Card minHeight={560}>
            <h2 className="font-serif text-[24px] font-semibold text-coffee">Create your free account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Three details and the tab is yours — pull up a chair.</p>

            <form onSubmit={submit} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="s2-name" className={v2Label}>Your name</label>
                <input id="s2-name" autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
                  className={v2Input} style={{ caretColor: "#b8763d" }} />
              </div>
              <div>
                <label htmlFor="s2-email" className={v2Label}>Work email</label>
                <input id="s2-email" type="email" autoComplete="email" inputMode="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErr(null); }}
                  className={v2Input} style={{ borderColor: err ? "#a5432c" : undefined, caretColor: "#b8763d" }} />
                <div className="min-h-[20px] pt-1">
                  {err === "email" && <p className="text-[12px] text-danger">That doesn&apos;t look like an email — one more look?</p>}
                  {err === "taken" && <p role="alert" className="text-[12px] text-danger">An account with this email already exists — sign in instead?</p>}
                </div>
              </div>
              <div>
                <AnimatePresence initial={false}>
                  {!magic && (
                    <motion.div key="pw" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: EASE }} className="overflow-hidden">
                      <label htmlFor="s2-pass" className={v2Label}>Password</label>
                      <input id="s2-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className={v2Input} style={{ caretColor: "#b8763d" }} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button type="button" onClick={() => setMagic((v) => !v)} className="mt-2 block text-[13px] text-mocha underline-offset-4 hover:underline">
                  {magic ? "I'll set a password instead" : <>or skip the password — we&apos;ll email you a sign-in link <span className="text-steam">✳</span></>}
                </button>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5">
                <button type="button" role="checkbox" aria-checked={agreed} onClick={() => setAgreed((v) => !v)}
                  className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[5px] border-2 transition-colors"
                  style={{ borderColor: agreed ? "#b8763d" : "#c9a87c", background: agreed ? "#b8763d" : "#fffdf9" }}>
                  {agreed && <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.5 L4.8 9 L10 3" fill="none" stroke="#fffdf9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
                <span onClick={() => setAgreed((v) => !v)} className="text-[12px] leading-relaxed text-mocha">
                  I agree to the{" "}
                  <a className="font-medium text-caramel underline underline-offset-2" href="/terms" target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>
                    Terms &amp; Acceptable Use
                  </a>
                  : business calling only, no nuisance calls, no spoofing — and I&apos;m responsible for consent &amp; DND compliance on every number I dial.
                </span>
              </label>

              <motion.button type="submit" aria-disabled={!done} whileTap={done && !reduce ? { scale: 0.98 } : undefined}
                className="h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
                {opening ? "Creating your account…" : magic ? "Create account — email me a link ✳" : "Create free account"}
              </motion.button>

              <div className="border-t border-foam pt-4 text-center">
                <span className="text-[13px] text-mocha">Already have a tab? </span>
                <button type="button" onClick={() => router.push("/login/v2")} className="text-[13px] font-semibold text-caramel underline-offset-4 hover:underline">
                  Sign in →
                </button>
              </div>
            </form>
          </V2Card>
        </motion.section>
      </div>
    </V2Frame>
  );
}
