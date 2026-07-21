"use client";

/* /login — sign in to the roastery, in the DASHBOARD's design language.
   Keeps every signature interaction: the Listening Cup (plays as you type,
   goes deaf on password), NOW SERVING ticker, THE POUR → /dashboard.
   Mock auth: everything succeeds except error@… */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { JourneyShell, JourneyCard } from "@/components/auth/journey-shell";
import { ListeningCup, type CupHandle } from "./ListeningCup";
import { Ticker, type Stamp } from "./Ticker";
import { MagicFace } from "./MagicFlip";
import { POUR, EMAIL_RE } from "./pour";

const EASE = [0.22, 1, 0.36, 1] as const;
const inputCls =
  "h-11 w-full rounded-xl border border-foam bg-cream px-3.5 text-[15px] text-coffee outline-none transition-[border-color,box-shadow] duration-150 focus:border-caramel focus:shadow-[0_0_0_3px_rgba(184,118,61,0.25)]";
const labelCls = "mb-1.5 block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em] text-mocha";

type Phase = "form" | "brewing" | "pouring" | "error";

export default function LoginPage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focus, setFocus] = useState<"email" | "password" | null>(null);
  const [emailValid, setEmailValid] = useState(false);
  const [emailFmtErr, setEmailFmtErr] = useState(false);
  const [remember, setRemember] = useState(false);
  const [lidOff, setLidOff] = useState(false);
  const [caps, setCaps] = useState(false);
  const [face, setFace] = useState<"signin" | "magic">("signin");
  const [phase, setPhase] = useState<Phase>("form");
  const [authErr, setAuthErr] = useState(false);
  const [errorTick, setErrorTick] = useState(0);
  const [stained, setStained] = useState(false);
  const [stamp, setStamp] = useState<Stamp>(null);
  const [greeting, setGreeting] = useState("Good morning");
  const [subline, setSubline] = useState("Sign in to the roastery");
  const [skipStagger, setSkipStagger] = useState(false);
  const [glide, setGlide] = useState<{ x: number; y: number } | null>(null);
  const [streamOn, setStreamOn] = useState(false);

  const cupRef = useRef<CupHandle>(null);
  const cupWrapRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pourStart = useRef(0);
  const prefetched = useRef(false);
  const stampTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wiped = useRef(false);

  const t = (ms: number, fn: () => void) => timeouts.current.push(setTimeout(fn, ms));
  const clearAll = () => { timeouts.current.forEach(clearTimeout); timeouts.current = []; };

  useEffect(() => {
    const h = new Date().getHours();
    let g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    try {
      if (sessionStorage.getItem("vb-poured")) setSkipStagger(true);
      const warm = localStorage.getItem("vb-warm-email");
      if (warm) {
        setEmail(warm); setRemember(true);
        if (EMAIL_RE.test(warm)) setEmailValid(true);
        g = "Welcome back"; setSubline("Your usual, coming right up.");
      }
    } catch {}
    setGreeting(g);
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deaf = focus === "password";
  const fill = phase === "pouring" ? 1 : password.length > 0 ? 0.85 : emailValid ? 0.55 : 0.22;
  const canSubmit = email.trim().length > 0 && password.length > 0;
  const localpart = email.split("@")[0] || "you";
  const cinematic = phase === "brewing" || phase === "pouring";

  const onEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.length === 1 || e.key === "Backspace") cupRef.current?.spike((email.length + 1) % 24);
  };
  const onEmailBlur = () => {
    setFocus(null);
    const v = email.trim();
    if (!v) return;
    if (EMAIL_RE.test(v)) {
      setEmailFmtErr(false);
      if (!emailValid) {
        setEmailValid(true);
        cupRef.current?.ping();
        if (!prefetched.current) { prefetched.current = true; router.prefetch("/dashboard"); }
        if (stampTimer.current) clearTimeout(stampTimer.current);
        setStamp({ kind: "order", text: `ORDER RECEIVED · ${v.split("@")[0]}@…` });
        stampTimer.current = setTimeout(() => setStamp(null), 2000);
      }
    } else { setEmailValid(false); setEmailFmtErr(true); }
  };
  const onPassKey = (e: React.KeyboardEvent) => { try { setCaps(e.getModifierState("CapsLock")); } catch {} };

  const runWipe = useCallback((fast: boolean) => {
    if (wiped.current) return;
    wiped.current = true;
    clearAll();
    const rect = cupWrapRef.current?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const el = document.createElement("div");
    const dur = fast ? 200 : 450;
    el.style.cssText = `position:fixed;left:${cx - 60}px;top:${cy - 60}px;width:120px;height:120px;border-radius:50%;background:#fffdf9;transform:scale(0);z-index:2147483000;pointer-events:none;transition:transform ${dur}ms ease-in-out;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = "scale(40)"; }));
    setTimeout(() => { try { sessionStorage.setItem("vb-poured", "1"); } catch {} router.push("/dashboard"); }, fast ? 180 : 400);
    setTimeout(() => { el.style.transition = "opacity 250ms ease-out"; el.style.opacity = "0"; }, fast ? 420 : 700);
    setTimeout(() => el.remove(), fast ? 750 : 1000);
  }, [router]);

  const fail = useCallback(() => {
    clearAll(); setPhase("error"); setAuthErr(true); setErrorTick((n) => n + 1); setStained(true);
  }, []);

  const startPour = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phase !== "form" && phase !== "error") return;
    if (!canSubmit) { (email.trim() ? passRef : emailRef).current?.focus(); return; }
    setAuthErr(false); setFocus(null);
    try { if (remember) localStorage.setItem("vb-warm-email", email.trim()); else localStorage.removeItem("vb-warm-email"); } catch {}
    setPhase("brewing");
    pourStart.current = performance.now();
    const isErr = email.trim().toLowerCase().startsWith("error@");
    if (isErr) { t(POUR.MOCK_LATENCY, fail); return; }
    if (reduce) { t(250, () => runWipe(true)); return; }
    t(POUR.GLIDE, () => {
      setPhase("pouring");
      const rect = cupWrapRef.current?.getBoundingClientRect();
      if (rect) setGlide({ x: window.innerWidth / 2 - (rect.left + rect.width / 2), y: window.innerHeight / 2 - (rect.top + rect.height / 2) });
    });
    t(POUR.STREAM, () => { setStreamOn(true); cupRef.current?.wave(); });
    t(POUR.STEAM, () => { setStamp({ kind: "final", text: `NOW SERVING — ${localpart}@…` }); cupRef.current?.ping(); });
    t(POUR.WIPE, () => runWipe(false));
  };

  useEffect(() => {
    if (!cinematic || reduce) return;
    const skip = () => { if (performance.now() - pourStart.current > POUR.SKIP_AFTER) runWipe(false); };
    window.addEventListener("keydown", skip); window.addEventListener("pointerdown", skip);
    return () => { window.removeEventListener("keydown", skip); window.removeEventListener("pointerdown", skip); };
  }, [cinematic, reduce, runWipe]);

  const rows = {
    hidden: skipStagger ? {} : { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  };
  const stack = { hidden: {}, show: { transition: { staggerChildren: skipStagger || reduce ? 0 : 0.05 } } };

  return (
    <JourneyShell wide>
      <JourneyCard className="max-w-5xl overflow-hidden p-0">
        <div className="grid lg:min-h-[620px] lg:grid-cols-[1fr_1.1fr]">
          {/* ===== LEFT — the cup, in an oat well (dashboard panel treatment) ===== */}
          <motion.aside
            className="relative flex flex-col justify-between border-b border-foam bg-oat/40 p-7 lg:border-b-0 lg:border-r"
            animate={{ opacity: phase === "pouring" ? 0.3 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h2 className="font-serif text-xl font-semibold text-coffee">Every call, freshly brewed.</h2>
              <p className="mt-1 text-sm text-mocha">The cup listens while you type — and goes deaf for your password.</p>
            </div>
            <motion.div
              ref={cupWrapRef}
              className="relative mx-auto my-4 w-[280px] max-w-full"
              animate={glide ? { x: glide.x, y: glide.y, scale: 1.25 } : { x: 0, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
              style={{ zIndex: 5 }}
            >
              <AnimatePresence>
                {streamOn && (
                  <motion.div key="stream" className="absolute left-1/2 z-10 -ml-[3px] w-[6px] rounded-full bg-caramel"
                    style={{ top: -60, transformOrigin: "top" }}
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 130, opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeIn" }} />
                )}
              </AnimatePresence>
              <ListeningCup ref={cupRef} focus={focus} fill={fill} deaf={deaf} phase={phase} errorTick={errorTick} stained={stained} />
              <div className="mt-1 h-[18px] text-center font-[family-name:var(--font-data)] text-[11px] text-mocha">
                <AnimatePresence mode="wait">
                  {deaf && (
                    <motion.span key="deaf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, delay: 0.3 }}>
                      not listening, promise.
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            <div className="rounded-xl border border-foam bg-card px-3.5 py-2.5 shadow-glass">
              <Ticker dimmed={focus !== null} stamp={stamp} />
            </div>
          </motion.aside>

          {/* ===== RIGHT — the form (dashboard card interior) ===== */}
          <motion.section
            className="relative p-7 lg:p-9"
            animate={phase === "pouring" ? { x: "24%", opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ perspective: 1200 }}
          >
            <motion.div className="relative" animate={{ rotateY: face === "magic" && !reduce ? 180 : 0 }} transition={{ duration: 0.5, ease: EASE }} style={{ transformStyle: "preserve-3d" }}>
              {/* FACE A */}
              <motion.div style={{ backfaceVisibility: "hidden", pointerEvents: face === "signin" ? "auto" : "none" }} animate={reduce ? { opacity: face === "signin" ? 1 : 0 } : {}}>
                <motion.form variants={stack} initial={skipStagger ? false : "hidden"} animate="show" onSubmit={startPour} noValidate>
                  <motion.div animate={authErr && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.32 }} key={errorTick} className="space-y-4">
                    <motion.header variants={rows} className="mb-6">
                      <h1 className="font-serif text-[26px] font-semibold leading-tight text-coffee">{greeting}</h1>
                      <p className="mt-1 text-sm text-muted-foreground">{subline}</p>
                    </motion.header>

                    {/* email */}
                    <motion.div variants={rows}>
                      <label htmlFor="vb-email" className={labelCls}>Work email</label>
                      <div className="relative">
                        <input ref={emailRef} id="vb-email" type="email" autoComplete="email" inputMode="email" value={email} disabled={cinematic}
                          onChange={(e) => { setEmail(e.target.value); setEmailFmtErr(false); }}
                          onFocus={() => setFocus("email")} onBlur={onEmailBlur} onKeyDown={onEmailKeyDown}
                          className={inputCls} style={{ borderColor: emailFmtErr || (authErr && phase === "error") ? "#a5432c" : undefined, caretColor: "#b8763d" }} />
                        <AnimatePresence>
                          {emailValid && (
                            <motion.svg key="check" width="20" height="20" viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <motion.path d="M4 10.5 L8.5 15 L16 5.5" fill="none" stroke="#4fb0a5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : 0.3, ease: "easeOut" }} />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="mt-1 min-h-[20px]">
                        {emailFmtErr && <p className="text-[12px] text-danger">That doesn&apos;t look like an email — one more look?</p>}
                        {authErr && phase === "error" && <p role="alert" className="text-[13px] text-danger">That blend didn&apos;t match — try again.</p>}
                      </div>
                    </motion.div>

                    {/* password */}
                    <motion.div variants={rows}>
                      <div className="mb-1.5 flex h-[22px] items-center justify-between">
                        <label htmlFor="vb-pass" className={`${labelCls} mb-0`}>Password</label>
                        <AnimatePresence>
                          {caps && focus === "password" && (
                            <motion.span initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                              className="rounded-full border border-foam bg-oat px-2 py-0.5 font-[family-name:var(--font-data)] text-[10px] text-caramel">
                              CAPS ON
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="relative">
                        <input ref={passRef} id="vb-pass" type={lidOff ? "text" : "password"} autoComplete="current-password" value={password} disabled={cinematic}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocus("password")} onBlur={() => { setFocus(null); setCaps(false); }}
                          onKeyDown={onPassKey} onKeyUp={onPassKey}
                          className={inputCls} style={{ paddingRight: 44, caretColor: "#b8763d" }} />
                        <button type="button" aria-label={lidOff ? "Hide password" : "Show password"} aria-pressed={lidOff} title="take the lid off"
                          onClick={() => { setLidOff((v) => !v); cupRef.current?.ping(); }}
                          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg transition-colors hover:bg-oat">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <motion.g animate={{ rotateX: lidOff ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{ transformOrigin: "10px 8px" }}>
                              <path d="M4 7.5 h12 a1.6 1.6 0 0 0 -1.6 -2 h-8.8 a1.6 1.6 0 0 0 -1.6 2 Z" fill="#b8763d" opacity={lidOff ? 0.35 : 1} />
                            </motion.g>
                            <path d="M5 9 h10 l-1.4 6.2 a1.8 1.8 0 0 1 -1.8 1.3 h-3.6 a1.8 1.8 0 0 1 -1.8 -1.3 Z" fill="none" stroke="#6b4423" strokeWidth="1.4" />
                            <path d="M15 10.5 q3 .6 2 3 q-.8 1.8 -3 1.4" fill="none" stroke="#6b4423" strokeWidth="1.2" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>

                    {/* remember + forgot */}
                    <motion.div variants={rows} className="flex items-center justify-between pt-1">
                      <button type="button" role="switch" aria-checked={remember} onClick={() => setRemember((v) => !v)} className="flex items-center gap-2.5">
                        <span className="relative h-[22px] w-10 rounded-full border border-foam transition-colors duration-200" style={{ background: remember ? "#b8763d" : "#f4e9d8" }}>
                          <motion.span className="absolute top-[1px] grid size-[18px] place-items-center rounded-full bg-porcelain shadow-sm"
                            animate={{ left: remember ? 19 : 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                            <svg width="12" height="12" viewBox="0 0 18 18"><path d="M4.5 6 h8 l-1 6.5 a1.5 1.5 0 0 1 -1.5 1.2 h-3 a1.5 1.5 0 0 1 -1.5 -1.2 Z" fill="none" stroke="#6b4423" strokeWidth="1.4" /></svg>
                          </motion.span>
                        </span>
                        <span className="text-[13px] text-mocha">Remember me <span className="text-latte">· keeps the cup warm</span></span>
                      </button>
                      <button type="button" onClick={() => router.push("/forgot")} className="text-[13px] font-medium text-caramel underline-offset-4 hover:underline">
                        Forgot password?
                      </button>
                    </motion.div>

                    {/* submit */}
                    <motion.div variants={rows} className="pt-1">
                      <motion.button type="submit" aria-disabled={!canSubmit} whileTap={canSubmit ? { scale: 0.98 } : undefined}
                        className="h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
                        <AnimatePresence mode="wait" initial={false}>
                          {cinematic ? (
                            <motion.span key="brew" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5">
                              {[0, 1, 2].map((i) => (
                                <motion.span key={i} className="inline-block h-[6px] w-[5px] rounded-full bg-cream"
                                  animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.72, repeat: Infinity, delay: i * 0.12 }} />
                              ))}
                              <span className="ml-1.5">Brewing…</span>
                            </motion.span>
                          ) : (
                            <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Sign in — start the pour</motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </motion.div>

                    {/* divider + google + magic + signup */}
                    <motion.div variants={rows} className="flex items-center gap-3 py-1">
                      <span className="h-px flex-1 bg-foam" />
                      <span className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.2em] text-latte">or</span>
                      <span className="h-px flex-1 bg-foam" />
                    </motion.div>
                    <motion.div variants={rows}>
                      <button type="button"
                        onClick={() => { if (phase === "form" || phase === "error") { setEmail(email || "you@company.com"); setPassword(password || "·"); setTimeout(() => startPour(), 0); } }}
                        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-foam bg-card text-sm text-coffee transition-colors hover:bg-oat/60">
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" fill="#34A853" />
                          <path d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </button>
                    </motion.div>
                    <motion.div variants={rows} className="text-center">
                      <button type="button" onClick={() => setFace("magic")} className="text-[13px] text-mocha underline-offset-4 hover:underline">
                        no password? get a sign-in link by email <span className="text-steam">✳</span>
                      </button>
                    </motion.div>
                    <motion.div variants={rows} className="border-t border-foam pt-4 text-center">
                      <span className="text-[13px] text-mocha">New here? </span>
                      <button type="button"
                        onClick={() => { try { sessionStorage.setItem("vb-card-flip", "1"); } catch {} router.push("/signup"); }}
                        className="text-[13px] font-semibold text-caramel underline-offset-4 hover:underline">
                        Create a free account →
                      </button>
                    </motion.div>
                  </motion.div>
                </motion.form>
              </motion.div>

              {/* FACE B — magic link */}
              <motion.div className="absolute inset-0"
                style={{ backfaceVisibility: "hidden", transform: reduce ? undefined : "rotateY(180deg)", pointerEvents: face === "magic" ? "auto" : "none" }}
                animate={reduce ? { opacity: face === "magic" ? 1 : 0 } : {}}>
                {face === "magic" && <MagicFace initialEmail={email} onBack={() => setFace("signin")} />}
              </motion.div>
            </motion.div>
          </motion.section>
        </div>
      </JourneyCard>
      <button onClick={() => router.push("/login/v2")}
        className="fixed bottom-4 right-4 z-[110] flex items-center gap-1.5 rounded-full border border-foam bg-porcelain px-3.5 py-2 font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.12em] text-mocha shadow-glass transition-colors hover:border-caramel hover:text-coffee">
        ✨ try the new counter — v2
      </button>
    </JourneyShell>
  );
}
