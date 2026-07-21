"use client";

/* /welcome/v2 — "YOUR TAB, PRINTING", in the v2 visual language.
   Same beloved paystub receipt + grant + sample call — richer chrome:
   accent halos, steam ribbons, gradient progress.
   Original v1 comment follows.
   /welcome — 4-step chip wizard where every answer
   prints as a receipt line item; ends in THE OPENING BALANCE (50 sips on
   the house, wax-stamped with your TABLE No.) → THE POUR wipe → /dashboard.
   V3: questions read plainly first — the café metaphor is garnish (eyebrows,
   receipt, animations), never the carrier of meaning. */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { Check, Phone } from "lucide-react";
import { VoiceBrewMark } from "@/components/layout/voicebrew-logo";
import {
  ROLES, VERTICALS, LANGS, VOLUMES, GREETINGS, STEP_LABELS, GRANT, readback,
  BREWS, PROMO_BREWS, DIRECTIONS, DLT_STATUS, PERSONAS, WINDOWS, type RLine,
} from "../wizard";
import { getProfile, setProfile, ensureTableNo, grantOpeningBalance } from "@/lib/tab-mock";
import { Backdrop } from "@/components/auth/v2-kit";
import { Ticker } from "../../login/Ticker";

const EASE = [0.22, 1, 0.36, 1] as const;
const mono = "font-[family-name:var(--font-data)]";
const ZIGZAG = "polygon(0 0,100% 0,100% calc(100% - 8px),97.5% 100%,95% calc(100% - 8px),92.5% 100%,90% calc(100% - 8px),87.5% 100%,85% calc(100% - 8px),82.5% 100%,80% calc(100% - 8px),77.5% 100%,75% calc(100% - 8px),72.5% 100%,70% calc(100% - 8px),67.5% 100%,65% calc(100% - 8px),62.5% 100%,60% calc(100% - 8px),57.5% 100%,55% calc(100% - 8px),52.5% 100%,50% calc(100% - 8px),47.5% 100%,45% calc(100% - 8px),42.5% 100%,40% calc(100% - 8px),37.5% 100%,35% calc(100% - 8px),32.5% 100%,30% calc(100% - 8px),27.5% 100%,25% calc(100% - 8px),22.5% 100%,20% calc(100% - 8px),17.5% 100%,15% calc(100% - 8px),12.5% 100%,10% calc(100% - 8px),7.5% 100%,5% calc(100% - 8px),2.5% 100%,0 calc(100% - 8px))";

/* ---------- rubber-stamp chip ---------- */
function Chip({ label, on, onTap }: { label: string; on: boolean; onTap: () => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      aria-pressed={on}
      onClick={onTap}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      whileHover={reduce ? undefined : { scale: 1.05, y: -1 }}
      animate={on && !reduce ? { scale: [1.12, 1] } : {}}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
      style={on
        ? { background: "#b8763d", borderColor: "#b8763d", color: "#fdf8f0", boxShadow: "0 2px 8px rgba(184,118,61,0.4)" }
        : { background: "#fffdf9", borderColor: "#d8bf9a", color: "#3d2817" }}
    >
      {label}
    </motion.button>
  );
}

/* ---------- animated waveform strip (product motif) ---------- */
function WaveStrip() {
  return (
    <div aria-hidden className="flex h-6 items-center gap-[3px] overflow-hidden">
      <style>{`@keyframes vbWStrip{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`}</style>
      {Array.from({ length: 40 }).map((_, i) => (
        <span key={i} className="w-[3px] flex-1 rounded-full"
          style={{ background: i % 4 === 0 ? "#4fb0a5" : "#b8763d", height: "100%", transformOrigin: "center", opacity: 0.75, animation: `vbWStrip ${700 + (i % 5) * 130}ms ease-in-out ${(i % 8) * 90}ms infinite` }} />
      ))}
    </div>
  );
}

/* ---------- espresso brew-bar line-art (pours above the receipt) ---------- */
function BrewBar() {
  return (
    <svg viewBox="0 0 260 150" className="w-full max-w-[300px]" aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
      <style>{`
        @keyframes vbDrip{0%{transform:translateY(-4px);opacity:0}30%{opacity:1}100%{transform:translateY(26px);opacity:0}}
        @keyframes vbSteamB{0%{opacity:0;transform:translateY(4px)}40%{opacity:.8}100%{opacity:0;transform:translateY(-10px)}}
      `}</style>
      <line x1="16" y1="132" x2="244" y2="132" stroke="#b8935e" strokeWidth="2.5" />
      <g stroke="#b8763d" strokeWidth="2.2">
        <path d="M150 34 c-5 -6 5 -10 0 -16 c-4 -5 4 -9 1 -14" style={{ animation: "vbSteamB 3s ease-in-out infinite" }} />
        <path d="M166 37 c-5 -6 5 -10 0 -16 c-4 -5 4 -9 1 -14" style={{ animation: "vbSteamB 3.6s ease-in-out .5s infinite" }} />
      </g>
      <rect x="42" y="40" width="96" height="72" rx="8" stroke="#2a1a0f" strokeWidth="2.6" />
      <rect x="56" y="52" width="30" height="14" rx="3" stroke="#2a1a0f" strokeWidth="2" />
      <circle cx="118" cy="59" r="7" stroke="#2a1a0f" strokeWidth="2" />
      <path d="M74 112 v8 h32 v-8" stroke="#2a1a0f" strokeWidth="2.4" />
      <rect x="82" y="98" width="16" height="8" rx="2" fill="#2a1a0f" />
      <rect x="88.5" y="108" width="3" height="7" rx="1.5" fill="#b8763d" style={{ animation: "vbDrip 1.4s ease-in infinite" }} />
      <path d="M76 126 h28 l-2.6 -14 h-22.8 Z" stroke="#2a1a0f" strokeWidth="2.4" fill="#fdf8f0" />
      <rect x="168" y="58" width="44" height="54" rx="6" stroke="#2a1a0f" strokeWidth="2.6" />
      <path d="M176 58 v-10 h28 v10" stroke="#2a1a0f" strokeWidth="2.2" />
      <circle cx="190" cy="86" r="9" stroke="#b8763d" strokeWidth="2.2" />
    </svg>
  );
}

/* ---------- mini cup progress token ---------- */
function CupToken({ quarter }: { quarter: number }) {
  const fill = Math.min(1, quarter / 4);
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
      <path d="M8 12 h24 l-3.4 22 a4 4 0 0 1 -4 3.4 h-9.2 a4 4 0 0 1 -4 -3.4 Z" fill="#fffdf9" stroke="#d3b78f" strokeWidth="1.5" />
      <clipPath id="ctk"><path d="M8 12 h24 l-3.4 22 a4 4 0 0 1 -4 3.4 h-9.2 a4 4 0 0 1 -4 -3.4 Z" /></clipPath>
      <motion.rect x="6" width="28" height="30" fill="#c9a87c" clipPath="url(#ctk)"
        initial={false} animate={{ y: 38 - fill * 24 }} transition={{ type: "spring", stiffness: 140, damping: 20 }} />
      <path d="M32 16 a6 6 0 0 1 0 12" fill="none" stroke="#d3b78f" strokeWidth="2.4" />
    </svg>
  );
}

/* ---------- the receipt ---------- */
function Receipt({ name, brand, lines, tableNo, stamped }: { name: string; brand: string; lines: RLine[]; tableNo: string | null; stamped: boolean }) {
  const reduce = useReducedMotion();
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className={`${mono} relative w-full max-w-[360px] px-5 pb-6 pt-5 text-[11px] leading-relaxed`}
      style={{ background: "#fffdf9", border: "1.5px solid #cbb086", clipPath: ZIGZAG, color: "#3d2817", boxShadow: "0 8px 30px -18px rgba(42,26,15,0.25)" }}>
      <div className="text-center uppercase tracking-[0.18em]" style={{ color: "#6b4423" }}>
        Voicebrew estd. MMXXV
        <div className="mt-0.5 text-[9px] tracking-[0.12em]" style={{ color: "#c9a87c" }}>{today.toUpperCase()} · DELHI NCR</div>
      </div>
      <div className="my-2 border-b border-dashed" style={{ borderColor: "#d8bf9a" }} />
      <div className="uppercase">TAB — {name || "…"}</div>
      {brand && <div className="uppercase tracking-[0.06em]" style={{ color: "#2a1a0f" }}>{brand}</div>}
      <div className="my-2 border-b border-dashed" style={{ borderColor: "#d8bf9a" }} />
      <ul aria-live="polite" className="space-y-1.5">
        <AnimatePresence initial={false}>
          {lines.map((l, i) => (
            <motion.li key={l.label + i}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: reduce ? 0 : 0.04 }}
              className="flex items-baseline gap-1.5 uppercase">
              <span className="shrink-0">{l.label}</span>
              <span className="mx-1 flex-1 border-b border-dotted" style={{ borderColor: "#c9a87c", transform: "translateY(-3px)" }} />
              <span className="shrink-0 text-right"
                style={l.tone === "milk" ? { fontFamily: "var(--font-brew)", fontStyle: "italic", textTransform: "none", color: "#c9a87c" }
                  : l.tone === "free" ? { color: "#4fb0a5", fontWeight: 600 }
                  : l.tone === "verified" ? { color: "#4fb0a5", fontWeight: 600 }
                  : { color: "#2a1a0f" }}>
                {l.value}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {stamped && tableNo && (
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, rotate: -12, scale: 1.3 }}
          animate={{ opacity: 1, rotate: -6, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="mt-4 border-2 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ borderColor: "#b8763d", color: "#b8763d", borderRadius: 6, transformOrigin: "center" }}>
          Tab opened — {today} — Table No. {tableNo}
        </motion.div>
      )}
    </div>
  );
}

/* ---------- ORDER READBACK call sheet ---------- */
function ReadbackSheet({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const lines = readback(getProfile());
  const [li, setLi] = useState(0);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (reduce) { setLi(lines.length - 1); setChars(lines[lines.length - 1].length); return; }
    const id = setInterval(() => {
      setChars((c) => {
        if (c < lines[li].length) return c + 1;
        if (li < lines.length - 1) { setLi((v) => v + 1); return 0; }
        clearInterval(id);
        return c;
      });
    }, 34);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [li, reduce]);
  const finished = li === lines.length - 1 && chars >= lines[lines.length - 1].length;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] grid place-items-center p-5" style={{ background: "rgba(42,26,15,0.45)", backdropFilter: "blur(6px)" }}>
      <motion.div initial={reduce ? {} : { y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="w-full max-w-[420px] rounded-3xl p-6" style={{ background: "#fffdf9", border: "1px solid #d8bf9a" }}>
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full" style={{ background: "#4fb0a5" }}><Phone className="size-4 text-white" /></span>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#2a1a0f" }}>VoiceBrew · tasting call</div>
            <div className={`${mono} text-[10px] uppercase tracking-[0.12em]`} style={{ color: "#4fb0a5" }}>On the house — 0 sips</div>
          </div>
        </div>
        {/* waveform speaking */}
        <div className="mt-4 flex h-10 items-center justify-center gap-[3px] rounded-xl px-4" style={{ background: "#f4e9d8" }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} className="w-[3px] flex-1 rounded-full" style={{ background: i % 3 ? "#b8763d" : "#4fb0a5", height: "30%", transformOrigin: "center", animation: reduce || finished ? undefined : `vbEq ${640 + (i % 5) * 110}ms ease-in-out ${(i % 7) * 80}ms infinite` }} />
          ))}
          <style>{`@keyframes vbEq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`}</style>
        </div>
        {/* transcript */}
        <div className="mt-4 min-h-[110px] space-y-2">
          {lines.slice(0, li + 1).map((l, i) => (
            <p key={i} className={`${mono} rounded-xl px-3 py-2 text-[12.5px] leading-snug`} style={{ background: "#fdf8f0", color: "#3d2817" }}>
              {i === li ? l.slice(0, chars) : l}
              {i === li && !finished && <span className="ml-0.5 inline-block w-[2px]" style={{ height: 12, background: "#b8763d" }} />}
            </p>
          ))}
        </div>
        <button onClick={onDone} className="mt-4 h-11 w-full rounded-xl font-serif text-[15px] font-semibold" style={{ background: finished ? "#b8763d" : "#f4e9d8", color: finished ? "#fffdf9" : "#6b4423" }}>
          {finished ? "That's my order — hang up" : "Skip the tasting"}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ========================================================================= */
export default function WelcomePage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"wizard" | "grant">("wizard");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [role, setRole] = useState("");
  const [vertical, setVertical] = useState("");
  const [brews, setBrews] = useState<string[]>([]); // the one what-will-you-brew question
  const [direction, setDirection] = useState("");
  const [dlt, setDlt] = useState("");
  const [volume, setVolume] = useState("");
  const [persona, setPersona] = useState("");
  const [window_, setWindow_] = useState("");
  const [langs, setLangs] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [verified, setVerified] = useState(false);
  const [calling, setCalling] = useState(false);
  const [tasted, setTasted] = useState(false);
  const [lines, setLines] = useState<RLine[]>([]);
  const [tableNo, setTableNo] = useState<string | null>(null);
  const [stamped, setStamped] = useState(false);
  const [granted, setGranted] = useState(false);
  const [pourOnly, setPourOnly] = useState(false); // onboarded-but-unverified: step 4 only
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const grantStart = useRef(0);
  const wiped = useRef(false);
  const t = (ms: number, fn: () => void) => timeouts.current.push(setTimeout(fn, ms));

  // guards + resume
  useEffect(() => {
    try {
      const p = getProfile();
      if (localStorage.getItem("vb-onboarded")) {
        // already granted: allow "pour later" users back in for step 4 only
        if (p.phoneVerified) { router.replace("/dashboard"); return; }
        setName(p.name || ""); setPourOnly(true); setStep(3);
        return;
      }
      if (!p.name) { router.replace("/signup/v2"); return; }
      setName(p.name);
      const saved = Number(sessionStorage.getItem("vb-wizard-step-v2") || "0");
      if (saved > 0 && saved < 4) setStep(saved);
    } catch {}
    return () => timeouts.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { try { sessionStorage.setItem("vb-wizard-step-v2", String(step)); } catch {} }, [step]);

  const print = useCallback((label: string, value: string, tone?: RLine["tone"]) =>
    setLines((ls) => [...ls.filter((x) => x.label !== label), { label, value, tone }]), []);

  /* ---- THE OPENING BALANCE ---- */
  const runWipe = useCallback(() => {
    if (wiped.current) return;
    wiped.current = true;
    timeouts.current.forEach(clearTimeout);
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;left:50%;top:50%;width:120px;height:120px;margin:-60px;border-radius:50%;background:#fffdf9;transform:scale(0);z-index:2147483000;pointer-events:none;transition:transform ${reduce ? 200 : 450}ms ease-in-out;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = "scale(40)"; }));
    setTimeout(() => {
      grantOpeningBalance();
      try { sessionStorage.setItem("vb-just-granted", "1"); sessionStorage.removeItem("vb-wizard-step-v2"); } catch {}
      router.push("/dashboard");
    }, reduce ? 180 : 400);
    setTimeout(() => { el.style.transition = "opacity 250ms"; el.style.opacity = "0"; }, reduce ? 420 : 700);
    setTimeout(() => el.remove(), 1000);
  }, [reduce, router]);

  const startGrant = useCallback(() => {
    setPhase("grant");
    grantStart.current = performance.now();
    const no = ensureTableNo();
    setTableNo(no);
    if (reduce) { setStamped(true); setGranted(true); t(600, runWipe); return; }
    t(GRANT.STAMP, () => setStamped(true));
    t(GRANT.POUR, () => setGranted(true));
    t(GRANT.WIPE, runWipe);
  }, [reduce, runWipe, t]);

  // skip-to-wipe on any key/click during grant
  useEffect(() => {
    if (phase !== "grant") return;
    const skip = () => { if (performance.now() - grantStart.current > GRANT.SKIP_AFTER) runWipe(); };
    window.addEventListener("keydown", skip); window.addEventListener("pointerdown", skip);
    return () => { window.removeEventListener("keydown", skip); window.removeEventListener("pointerdown", skip); };
  }, [phase, runWipe]);

  /* ---- step navigation ---- */
  // labels each step owns on the receipt — wiped before re-printing so
  // going back and changing an answer never leaves a stale line
  const STEP_LABELS_OWNED: string[][] = [
    ["ROLE", "INDUSTRY"],
    ["BREWING", "DIRECTION", "VOLUME", "DLT PAPERS"],
    ["LANGUAGES", "VOICE", "CALL HOURS"],
    ["FIRST POUR"],
  ];
  const wipeStepLines = (s: number) =>
    setLines((prev) => prev.filter((l) => !STEP_LABELS_OWNED[s]?.includes(l.label)));

  const goBack = () => {
    if (phase !== "wizard" || step === 0 || pourOnly) return;
    setStep((s) => s - 1);
  };

  const advance = (skip: boolean) => {
    wipeStepLines(step);
    if (step === 0) {
      if (skip || (!brand && !role && !vertical)) print("HOUSE BLEND", "LEFT ROOM FOR MILK", "milk");
      else {
        if (role) print("ROLE", role.toUpperCase());
        if (vertical) print("INDUSTRY", vertical.toUpperCase());
      }
      setProfile({ brand, role, vertical, skipped: skip ? ["house"] : [] });
      setStep(1);
    } else if (step === 1) {
      // THE ORDER — one unified list; compliance path derived, never re-asked
      if (skip || brews.length === 0) print("BREWING", "LEFT ROOM FOR MILK", "milk");
      else print("BREWING", brews.map((b) => b.toUpperCase()).join(" · "));
      if (direction) print("DIRECTION", direction.toUpperCase());
      if (volume) print("VOLUME", volume.toUpperCase());
      const promo = brews.some((b) => PROMO_BREWS.has(b));
      if (promo && dlt) print("DLT PAPERS", dlt.toUpperCase());
      setProfile({
        useCase: brews[0], campaignKinds: brews, goals: brews, callDirection: direction,
        volume, dltStatus: dlt || undefined, compliancePath: promo ? "promo" : brews.length ? "service" : undefined,
      });
      setStep(2);
    } else if (step === 2) {
      // THE VOICE — everything the tasting call needs, in one place
      if (skip || langs.length === 0) print("LANGUAGES", "LEFT ROOM FOR MILK", "milk");
      else print("LANGUAGES", langs.map((l) => l.toUpperCase()).join(" · "));
      if (persona) print("VOICE", persona.split(" (")[0].toUpperCase());
      if (window_) print("CALL HOURS", window_.toUpperCase());
      setProfile({ languages: langs, baristaPersona: persona, callingWindow: window_ });
      setStep(3);
    } else {
      // step 4 done (verified+tasted, or pour later)
      if (pourOnly) { router.push("/dashboard"); return; } // already granted
      if (!verified) print("FIRST POUR", "POUR LATER", "milk");
      startGrant();
    }
  };

  const otpDone = otp.every((d) => d !== "");
  const verify = () => {
    if (!otpDone) return;
    setVerified(true);
    setProfile({ phone: `+91 ${phone}`, phoneVerified: true });
    print("CUP VERIFIED", `+91 ${phone.replace(/(\d{5})(\d{5})/, "$1 $2")}`, "verified");
  };
  const finishTasting = () => {
    setCalling(false);
    setTasted(true);
    print(`1 × SAMPLE CALL (${(langs[0] || "HINGLISH").toUpperCase()})`, "ON THE HOUSE — FREE", "free");
  };

  const eyebrow = (plain: string, garnish?: string) => (
    <div className={`${mono} mb-2 text-[11px] uppercase tracking-[0.14em]`} style={{ color: "#6b4423" }}>
      {plain}{garnish && <span style={{ color: "#a3906e" }}> · {garnish}</span>}
    </div>
  );

  const stepBody = [
    /* 1 — THE HOUSE: who you are */
    <div key="s1" className="space-y-5">
      <div>
        <label className={`${mono} mb-1.5 block text-[11px] uppercase tracking-[0.14em]`} style={{ color: "#6b4423" }}>Company / brand name</label>
        <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Blostem Finance"
          className="h-11 w-full rounded-xl border bg-[#fdf8f0] px-3.5 text-[15px] outline-none focus:border-[#b8763d]"
          style={{ borderColor: "#d8bf9a", color: "#2a1a0f", caretColor: "#b8763d" }} />
      </div>
      <div>
        {eyebrow("Your industry")}
        <div className="flex flex-wrap gap-2">{VERTICALS.map((v) => <Chip key={v} label={v} on={vertical === v} onTap={() => setVertical(vertical === v ? "" : v)} />)}</div>
      </div>
      <div>
        {eyebrow("Your role")}
        <div className="flex flex-wrap gap-2">{ROLES.map((r) => <Chip key={r} label={r} on={role === r} onTap={() => setRole(role === r ? "" : r)} />)}</div>
      </div>
    </div>,
    /* 2 — THE ORDER: what you'll use it for (asked once) */
    <div key="s2" className="space-y-5">
      <div>
        {eyebrow("What kind of calls will you run?", "pick all that apply")}
        <div className="flex flex-wrap gap-2">{BREWS.map((b) => <Chip key={b} label={b} on={brews.includes(b)} onTap={() => setBrews((xs) => xs.includes(b) ? xs.filter((x) => x !== b) : [...xs, b])} />)}</div>
        {brews.some((b) => PROMO_BREWS.has(b)) && (
          <p className={`${mono} mt-2 text-[10px] uppercase tracking-[0.1em]`} style={{ color: "#b8763d" }}>Promotional calls go out 10:00–19:00 IST only — TRAI rules, house rules.</p>
        )}
      </div>
      <div>
        {eyebrow("Which way do your calls flow?")}
        <div className="flex flex-wrap gap-2">{DIRECTIONS.map((d) => <Chip key={d} label={d} on={direction === d} onTap={() => setDirection(direction === d ? "" : d)} />)}</div>
      </div>
      <div>
        {eyebrow("Calls per month", "optional")}
        <div className="flex flex-wrap gap-2">{VOLUMES.map((v) => <Chip key={v} label={v} on={volume === v} onTap={() => setVolume(volume === v ? "" : v)} />)}</div>
      </div>
      <AnimatePresence>
        {brews.some((b) => PROMO_BREWS.has(b)) && (
          <motion.div key="dlt" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28, ease: EASE }} className="overflow-hidden">
            <div className="rounded-2xl border-[1.5px] p-4" style={{ borderColor: "#b8935e", background: "#fbf4e4" }}>
              {eyebrow("Promotional calls in India need DLT registration — got yours?", "the health inspector's stamp")}
              <div className="flex flex-wrap gap-2">{DLT_STATUS.map((d) => <Chip key={d} label={d} on={dlt === d} onTap={() => setDlt(dlt === d ? "" : d)} />)}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    /* 3 — THE VOICE: everything the caller's voice needs */
    <div key="s3" className="space-y-5">
      <div>
        {eyebrow("Which languages should we call in?")}
        <div className="flex flex-wrap gap-2">{LANGS.map((l) => <Chip key={l} label={l} on={langs.includes(l)} onTap={() => setLangs((xs) => xs.includes(l) ? xs.filter((x) => x !== l) : [...xs, l])} />)}</div>
        <AnimatePresence mode="wait">
          {langs.length > 0 && (
            <motion.p key={langs[langs.length - 1]} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`${mono} mt-3 rounded-xl px-3 py-2 text-[12px]`} style={{ background: "#f4e9d8", color: "#3d2817" }}>
              ☕ “{GREETINGS[langs[langs.length - 1]]}”
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div>
        {eyebrow("How should the caller sound?", "your barista's manner")}
        <div className="flex flex-wrap gap-2">{PERSONAS.map((p) => <Chip key={p} label={p} on={persona === p} onTap={() => setPersona(persona === p ? "" : p)} />)}</div>
        <AnimatePresence>
          {persona && persona !== "Surprise me" && (
            <motion.p key={persona} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`${mono} mt-3 rounded-xl px-3 py-2 text-[12px]`} style={{ background: "#f4e9d8", color: "#3d2817" }}>
              🎙 Your sample call will sound {persona.split(" (")[0].toLowerCase()} — you&apos;ll hear it in the next step.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div>
        {eyebrow("When may we call your customers?")}
        <div className="flex flex-wrap gap-2">{WINDOWS.map((w) => <Chip key={w} label={w} on={window_ === w} onTap={() => setWindow_(window_ === w ? "" : w)} />)}</div>
        <p className={`${mono} mt-2 text-[10px] uppercase tracking-[0.1em]`} style={{ color: "#b8763d" }}>We never call outside 9am–9pm. TRAI&apos;s rules — and ours.</p>
      </div>
    </div>,
    /* 4 — THE FIRST POUR: verify your number, hear a live sample call */
    <div key="s4" className="space-y-5">
      <p className="text-[14px] leading-relaxed" style={{ color: "#3d2817" }}>
        Verify your own mobile number and we&apos;ll place a <b>free sample call</b>{" "} to it — you&apos;ll hear
        exactly what your customers will hear. <span style={{ color: "#6b4423" }}>The free call only goes to your own verified number.</span>
      </p>
      <div className="flex items-center gap-2">
        <span className={`${mono} rounded-xl border px-3 py-2.5 text-[14px]`} style={{ borderColor: "#d8bf9a", background: "#f4e9d8", color: "#6b4423" }}>+91</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="98••• •••10" disabled={verified}
          className={`${mono} h-11 flex-1 rounded-xl border bg-[#fdf8f0] px-3.5 text-[15px] tracking-[0.08em] outline-none focus:border-[#b8763d]`}
          style={{ borderColor: "#d8bf9a", color: "#2a1a0f", caretColor: "#b8763d" }} />
      </div>
      {phone.length === 10 && !verified && (
        <div>
          {eyebrow("Enter the 6-digit OTP", "any digits work in the demo")}
          <div className="flex gap-2">
            {otp.map((d, i) => (
              <input key={i} ref={(el) => { otpRefs.current[i] = el; }} value={d} inputMode="numeric" maxLength={1}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(-1);
                  setOtp((o) => o.map((x, j) => (j === i ? v : x)));
                  if (v && i < 5) otpRefs.current[i + 1]?.focus();
                }}
                onKeyDown={(e) => { if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus(); }}
                className={`${mono} h-12 w-10 rounded-xl border bg-[#fdf8f0] text-center text-[18px] outline-none focus:border-[#b8763d]`}
                style={{ borderColor: "#d8bf9a", color: "#2a1a0f", caretColor: "#b8763d" }} />
            ))}
          </div>
          <button onClick={verify} disabled={!otpDone} className="mt-3 h-11 rounded-xl px-5 font-serif text-[15px] font-semibold transition-colors"
            style={{ background: otpDone ? "#b8763d" : "#eadbc8", color: otpDone ? "#fffdf9" : "#c9a87c" }}>Verify my number</button>
        </div>
      )}
      {verified && !tasted && (
        <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} onClick={() => setCalling(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-serif text-[17px] font-semibold" style={{ background: "#2a1a0f", color: "#fffdf9" }}>
          <Phone className="size-4" /> Call me now — free sample
        </motion.button>
      )}
      {verified && tasted && (
        <p className={`${mono} flex items-center gap-1.5 text-[12px]`} style={{ color: "#4fb0a5" }}><Check className="size-4" /> Sample call poured — on the house.</p>
      )}
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-cream" style={{ backgroundImage: "radial-gradient(1200px 620px at 78% -12%, #f9ead2 0%, transparent 58%), radial-gradient(900px 500px at 0% 104%, #f1e3d2 0%, transparent 60%), radial-gradient(560px 380px at 96% 88%, rgba(79,176,165,0.08) 0%, transparent 70%)" }}>
      {/* ===== header — dashboard topbar treatment ===== */}
      <div className="shrink-0 border-b border-foam bg-porcelain/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-3.5">
          <span className="flex items-center gap-2.5">
            <VoiceBrewMark className="size-8 text-coffee" />
            <span className="leading-tight">
              <span className="block font-serif text-[15px] font-semibold text-coffee">Voice<span className="text-caramel">Brew</span></span>
              <span className={`${mono} block text-[9px] uppercase tracking-[0.16em] text-latte`}>Your tab, printing…</span>
            </span>
          </span>
          <div className="hidden w-56 md:block"><WaveStrip /></div>
          <div className="flex items-center gap-3">
            <CupToken quarter={phase === "grant" ? 6 : step + (verified ? 1 : 0)} />
            <span className={`${mono} text-[10px] uppercase tracking-[0.12em] text-mocha`}>
              {phase === "grant" ? "TAB OPENED" : `Step ${step + 1} of 4 — ${STEP_LABELS[step]}`}
            </span>
          </div>
        </div>
        {/* progress rule */}
        <div className="h-[3px] w-full bg-foam">
          <motion.div className="h-full rounded-r-full" style={{ background: "linear-gradient(90deg, var(--color-caramel), var(--color-mango) 55%, var(--color-steam))" }}
            initial={false} animate={{ width: `${phase === "grant" ? 100 : ((step + 1) / 4) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 24 }} />
        </div>
      </div>

      <div className="relative flex-1">
        <Backdrop />
        <div className="mx-auto grid max-w-[1080px] gap-8 px-6 py-10 lg:grid-cols-[1fr_380px]">
          {/* STEP PANEL — porcelain card */}
          <div>
            <AnimatePresence mode="wait">
              {phase === "wizard" ? (
                <motion.div key={step}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -26 }}
                  transition={{ duration: 0.32, ease: EASE }}
                  className="rounded-3xl p-7"
                  style={{ background: "#fffdf9", border: "1px solid #eadbc8", boxShadow: "0 1px 2px rgba(60,40,20,.05), 0 16px 40px -24px rgba(60,40,20,.25)" }}>
                  {step > 0 && !pourOnly && (
                    <button
                      onClick={goBack}
                      aria-label="Back to the previous step"
                      className={`${mono} mb-3 inline-flex items-center gap-1.5 rounded-full border border-foam bg-card px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-mocha transition-colors hover:bg-oat/60`}
                    >
                      ← Step {step} — {STEP_LABELS[step - 1].toLowerCase()}
                    </button>
                  )}
                  <h1 className="mb-1 font-serif text-[28px] leading-tight" style={{ color: "#2a1a0f" }}>
                    {["Tell us about your company", "What will you use VoiceBrew for?", "How should your calls sound?", "Hear your first call — free"][step]}
                  </h1>
                  <div className="mb-6 mt-2 h-[3px] w-14 rounded-full" style={{ background: "linear-gradient(90deg,#b8763d,#4fb0a5)" }} />
                  {stepBody[step]}
                  <div className="mt-8 flex items-center justify-between border-t pt-5" style={{ borderColor: "#e6d5b8" }}>
                    <div className="flex items-center gap-2.5">
                      {step > 0 && !pourOnly && (
                        <motion.button
                          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                          whileHover={reduce ? undefined : { x: -2 }} whileTap={{ scale: 0.97 }}
                          onClick={goBack}
                          className="flex h-12 items-center gap-1.5 rounded-xl border border-foam bg-card px-4 text-[14px] font-medium text-mocha transition-colors hover:bg-oat/60"
                          aria-label="Back to the previous step"
                        >
                          ← Back
                        </motion.button>
                      )}
                      <motion.button whileHover={reduce ? undefined : { y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => advance(false)}
                        className="h-12 rounded-xl bg-brand px-7 font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark">
                        {step === 3 ? (pourOnly ? "Done" : verified ? "Finish — open my tab ☕" : "Finish setup") : "Continue →"}
                      </motion.button>
                    </div>
                    <button onClick={() => advance(true)} className={`${mono} text-[11px] uppercase tracking-[0.1em] underline-offset-4 hover:underline`} style={{ color: "#a3906e" }}>
                      {step === 3 ? "Skip — I'll verify later" : "Skip this step"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* THE OPENING BALANCE */
                <motion.div key="grant" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-3xl p-8"
                  style={{ background: "#fffdf9", border: "1px solid #eadbc8", boxShadow: "0 1px 2px rgba(60,40,20,.05), 0 16px 40px -24px rgba(60,40,20,.25)" }}>
                  <h1 className="font-serif text-[32px] leading-tight" style={{ color: "#2a1a0f" }}>Your first fifty sips are on the house.</h1>
                  <div className="relative mt-8 flex items-end gap-3">
                    {granted && !reduce && (
                      <motion.span aria-hidden className="absolute -top-16 left-12 w-[7px] rounded-full" style={{ background: "#b8763d", transformOrigin: "top" }}
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 72, opacity: [0, 1, 1, 0] }} transition={{ duration: 1.4, times: [0, 0.15, 0.8, 1] }} />
                    )}
                    {granted && !reduce && (
                      <svg aria-hidden width="48" height="34" viewBox="0 0 48 34" className="absolute -top-10 left-20">
                        <path d="M8 32 C 4 24 12 20 8 10" fill="none" stroke="#b8935e" strokeWidth="2.2" strokeLinecap="round" style={{ animation: "vbSteamW 2.4s ease-in-out infinite" }} />
                        <path d="M22 32 C 18 24 26 20 22 8" fill="none" stroke="#b8935e" strokeWidth="2.2" strokeLinecap="round" style={{ animation: "vbSteamW 2.9s ease-in-out .3s infinite" }} />
                        <path d="M36 32 C 32 24 40 20 36 12" fill="none" stroke="#b8935e" strokeWidth="2.2" strokeLinecap="round" style={{ animation: "vbSteamW 3.3s ease-in-out .6s infinite" }} />
                        <style>{`@keyframes vbSteamW{0%{opacity:0;transform:translateY(3px)}40%{opacity:.85}100%{opacity:0;transform:translateY(-8px)}}`}</style>
                      </svg>
                    )}
                    <span className={`${mono} text-[84px] font-semibold leading-none`} style={{ color: "#2a1a0f" }}>
                      <NumberFlow value={granted ? 50 : 0} transformTiming={{ duration: reduce ? 0 : 1600, easing: "cubic-bezier(0.22,1,0.36,1)" }} />
                    </span>
                    <span className={`${mono} pb-2 text-[15px] font-semibold uppercase tracking-[0.14em]`} style={{ color: "#4fb0a5" }}>sips <span style={{ color: "#a3906e" }}>≈ 6 min of calls</span></span>
                  </div>
                  <AnimatePresence>
                    {granted && (
                      <motion.p initial={reduce ? { opacity: 1 } : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 1.7 }}
                        className="mt-4 max-w-sm text-[15px] leading-relaxed" style={{ color: "#3d2817" }}>
                        Opening balance: 50 sips on the house — ≈ 6 minutes of calling at ₹8/min. No card, no clock. Your cup stays warm.
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className={`${mono} mt-6 text-[10px] uppercase tracking-[0.12em]`} style={{ color: "#a3906e" }}>Pouring you in…</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* THE COUNTER — brew bar + receipt on a pinboard */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl p-5" style={{ background: "rgba(244,233,216,0.6)", border: "1px solid #eadbc8", boxShadow: "inset 0 2px 8px rgba(60,40,20,0.06)" }}>
              <div className="-mb-1 flex justify-center"><BrewBar /></div>
              <div className="relative">
                {/* receipt clip */}
                <div className="absolute -top-2 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-b-md" style={{ background: "#b8935e", boxShadow: "0 2px 4px rgba(42,26,15,0.25)" }} />
                <Receipt name={name} brand={brand} lines={lines} tableNo={tableNo} stamped={stamped} />
              </div>
              <p className={`${mono} mt-3 text-center text-[9px] uppercase tracking-[0.16em]`} style={{ color: "#8a6f4d" }}>Every answer prints on your tab</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== bottom NOW SERVING band ===== */}
      <div className="shrink-0 border-t px-6 py-3" style={{ borderColor: "#cbb086", background: "#fffdf9" }}>
        <div className="mx-auto max-w-[1080px]"><Ticker dimmed={false} stamp={null} /></div>
      </div>

      <AnimatePresence>{calling && <ReadbackSheet onDone={finishTasting} />}</AnimatePresence>
    </div>
  );
}
