"use client";

/* /signup — open a tab, in the DASHBOARD's design language.
   3 fields + required House Rules consent → /verify (email code) → /welcome. */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { JourneyShell, JourneyCard } from "@/components/auth/journey-shell";
import { ListeningCup, type CupHandle } from "../login/ListeningCup";
import { EMAIL_RE } from "../login/pour";
import { setProfile, resetTab } from "@/lib/tab-mock";

const EASE = [0.22, 1, 0.36, 1] as const;
const inputCls =
  "h-11 w-full rounded-xl border border-foam bg-cream px-3.5 text-[15px] text-coffee outline-none transition-[border-color,box-shadow] duration-150 focus:border-caramel focus:shadow-[0_0_0_3px_rgba(184,118,61,0.25)]";
const labelCls = "mb-1.5 block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em] text-mocha";

export default function SignupPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const cupRef = useRef<CupHandle>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magic, setMagic] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [focus, setFocus] = useState<"name" | "email" | "password" | null>(null);
  const [err, setErr] = useState<null | "email" | "taken">(null);
  const [opening, setOpening] = useState(false);

  const done = name.trim() && email.trim() && (magic || password.length > 0) && agreed;
  const fill = 0.22 + (name.trim() ? 0.21 : 0) + (EMAIL_RE.test(email) ? 0.21 : 0) + ((magic || password) ? 0.21 : 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!done || opening) return;
    if (!EMAIL_RE.test(email.trim())) { setErr("email"); return; }
    if (email.trim().toLowerCase().startsWith("taken@")) { setErr("taken"); return; }
    setErr(null);
    setOpening(true);
    resetTab(); // fresh tab per registration — the wizard always runs
    setProfile({ name: name.trim(), email: email.trim(), agreedTerms: true });
    try { sessionStorage.setItem("vb-tab-open", "1"); sessionStorage.removeItem("vb-email-verified"); } catch {}
    setTimeout(() => router.push("/verify"), reduce ? 150 : 500);
  };

  const rows = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } };
  const stack = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.05 } } };

  return (
    <JourneyShell wide>
      <JourneyCard className="max-w-5xl overflow-hidden p-0">
        <div className="grid lg:grid-cols-[1fr_1.1fr]">
          {/* LEFT — cup + what's on the house */}
          <aside className="flex flex-col justify-between border-b border-foam bg-oat/40 p-7 lg:border-b-0 lg:border-r">
            <div>
              <h2 className="font-serif text-xl font-semibold text-coffee">Start free — open a tab.</h2>
              <p className="mt-1 text-sm text-mocha">50 free sips ≈ 6 minutes of AI calls. No card needed.</p>
            </div>
            <div className="mx-auto my-4 w-[240px] max-w-full">
              <ListeningCup ref={cupRef} focus={focus === "password" ? "password" : focus ? "email" : null}
                fill={fill} deaf={focus === "password"} phase="form" errorTick={0} stained={false} />
            </div>
            {/* what's on the house — dashboard list card */}
            <div className="rounded-xl border border-foam bg-card p-4 shadow-glass">
              <div className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-mocha">On the house</div>
              <ul className="mt-2 space-y-1.5 text-[13px] text-coffee">
                <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-steam" /> 50 free sips (≈ 6 call minutes) · never expire</li>
                <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-steam" /> Every language on the shelf</li>
                <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-steam" /> DND scrubbed, TRAI-safe hours</li>
              </ul>
            </div>
          </aside>

          {/* RIGHT — the 3-field form */}
          <section className="p-7 lg:p-9">
            <motion.form variants={stack} initial="hidden" animate="show" onSubmit={submit} noValidate className="space-y-4">
              <motion.header variants={rows} className="mb-6">
                <h1 className="font-serif text-[26px] font-semibold leading-tight text-coffee">Create your account</h1>
                <p className="mt-1 text-sm text-muted-foreground">Three details and the tab is yours — pull up a chair.</p>
              </motion.header>

              <motion.div variants={rows}>
                <label htmlFor="su-name" className={labelCls}>Name on the tab</label>
                <input id="su-name" autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocus("name")} onBlur={() => setFocus(null)}
                  onKeyDown={() => cupRef.current?.spike(name.length % 24)}
                  className={inputCls} style={{ caretColor: "#b8763d" }} />
              </motion.div>

              <motion.div variants={rows}>
                <label htmlFor="su-email" className={labelCls}>Work email</label>
                <input id="su-email" type="email" autoComplete="email" inputMode="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErr(null); }}
                  onFocus={() => setFocus("email")} onBlur={() => setFocus(null)}
                  onKeyDown={() => cupRef.current?.spike(email.length % 24)}
                  className={inputCls} style={{ borderColor: err ? "#a5432c" : undefined, caretColor: "#b8763d" }} />
                {focus === "email" && !err && <p className="mt-1.5 font-[family-name:var(--font-data)] text-[10px] text-latte">we&apos;ll save your seat here</p>}
                {err && (
                  <p role="alert" className="mt-1.5 text-[13px] text-danger">
                    {err === "email" ? "That doesn't look like an email — one more look?" : "That seat's taken — back to the counter?"}
                  </p>
                )}
              </motion.div>

              <motion.div variants={rows}>
                <AnimatePresence initial={false}>
                  {!magic && (
                    <motion.div key="pw" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24, ease: EASE }} className="overflow-hidden">
                      <label htmlFor="su-pass" className={labelCls}>Password</label>
                      <input id="su-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocus("password")} onBlur={() => setFocus(null)}
                        className={inputCls} style={{ caretColor: "#b8763d" }} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button type="button" onClick={() => setMagic((v) => !v)} className="mt-2 block text-[13px] text-mocha underline-offset-4 hover:underline">
                  {magic ? "I'll set a password instead" : <>or skip the password — we'll email you a sign-in link <span className="text-steam">✳</span></>}
                </button>
              </motion.div>

              {/* consent */}
              <motion.div variants={rows}>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <button type="button" role="checkbox" aria-checked={agreed} onClick={() => setAgreed((v) => !v)}
                    className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[5px] border-2 transition-colors"
                    style={{ borderColor: agreed ? "#b8763d" : "#c9a87c", background: agreed ? "#b8763d" : "#fffdf9" }}>
                    {agreed && <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.5 L4.8 9 L10 3" fill="none" stroke="#fffdf9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                  <span onClick={() => setAgreed((v) => !v)} className="text-[12px] leading-relaxed text-mocha">
                    I agree to the{" "}
                    <a className="font-medium text-caramel underline underline-offset-2" href="/terms" target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>
                      House Rules — Terms &amp; Acceptable Use
                    </a>
                    : business calling only, no prank or nuisance calls, no spoofing, and I&apos;m responsible for consent &amp; DND compliance on every number I dial.
                  </span>
                </label>
              </motion.div>

              <motion.div variants={rows} className="pt-1">
                <motion.button type="submit" aria-disabled={!done} whileTap={done ? { scale: 0.98 } : undefined}
                  className="h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
                  {opening ? "Creating your account…" : magic ? "Create account — email me a link ✳" : "Create free account"}
                </motion.button>
              </motion.div>

              <motion.div variants={rows} className="border-t border-foam pt-4 text-center">
                <span className="text-[13px] text-mocha">Already have a tab? </span>
                <button type="button" onClick={() => router.push("/login")} className="text-[13px] font-semibold text-caramel underline-offset-4 hover:underline">
                  Sign in →
                </button>
              </motion.div>
            </motion.form>
          </section>
        </div>
      </JourneyCard>
    </JourneyShell>
  );
}
