"use client";

/* /verify/v2 — email verification between signup and onboarding, v2 chrome.
   6-digit code (any digits pass in the demo), resend with cooldown. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { V2Frame, V2Card, mono } from "@/components/auth/v2-kit";
import { getProfile } from "@/lib/tab-mock";

export default function VerifyV2Page() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("you@company.com");
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    try {
      const p = getProfile();
      if (!p.email) { router.replace("/signup/v2"); return; }
      setEmail(p.email);
      if (sessionStorage.getItem("vb-email-verified")) router.replace("/welcome/v2");
    } catch {}
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const done = code.every((d) => d !== "");
  const verify = () => {
    if (!done || checking) return;
    setChecking(true);
    setTimeout(() => {
      try { sessionStorage.setItem("vb-email-verified", "1"); } catch {}
      router.push("/welcome/v2");
    }, 600);
  };

  return (
    <V2Frame>
      <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }} className="w-full max-w-md">
        <V2Card className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl"
            style={{ background: "color-mix(in srgb, var(--color-steam) 15%, #fffdf9)", border: "1px solid color-mix(in srgb, var(--color-steam) 30%, var(--color-foam))" }}>
            <MailCheck className="size-6 text-steam" />
          </span>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-coffee">Check your email</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium text-coffee">{email}</span>.
          </p>
          <p className={`${mono} mt-0.5 text-[10px] uppercase tracking-[0.12em] text-latte`}>
            demo: any six digits open the door
          </p>

          <div className="mt-6 flex justify-center gap-2">
            {code.map((d, i) => (
              <motion.input key={i} ref={(el) => { refs.current[i] = el; }} value={d} autoFocus={i === 0}
                inputMode="numeric" maxLength={1}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(-1);
                  setCode((c) => c.map((x, j) => (j === i ? v : x)));
                  if (v && i < 5) refs.current[i + 1]?.focus();
                }}
                onKeyDown={(e) => { if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus(); if (e.key === "Enter") verify(); }}
                onPaste={(e) => {
                  const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  if (txt.length >= 2) { e.preventDefault(); setCode(Array.from({ length: 6 }, (_, j) => txt[j] || "")); refs.current[Math.min(txt.length, 5)]?.focus(); }
                }}
                whileFocus={{ scale: 1.06 }}
                className="w-11 rounded-xl border border-foam bg-cream text-center font-[family-name:var(--font-data)] text-[20px] text-coffee outline-none transition-colors focus:border-caramel"
                style={{ height: 52 }} />
            ))}
          </div>

          <button onClick={verify} aria-disabled={!done}
            className="mt-6 h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
            {checking ? "Checking…" : "Confirm — take my seat"}
          </button>

          <div className="mt-4 text-[13px] text-mocha">
            Nothing arrived?{" "}
            {cooldown > 0 ? (
              <span className={`${mono} text-[12px] text-latte`}>resend in {cooldown}s</span>
            ) : (
              <button onClick={() => setCooldown(30)} className="font-medium text-caramel underline-offset-4 hover:underline">Send a new code</button>
            )}
          </div>
          <button onClick={() => router.push("/signup/v2")} className="mt-3 text-[12px] text-latte underline-offset-4 hover:underline">
            Wrong email? Go back and edit it
          </button>
        </V2Card>
      </motion.div>
    </V2Frame>
  );
}
