"use client";

/* /verify — email verification between signup and onboarding.
   "Confirm your seat": 6-digit code (any digits pass in the demo), resend
   with cooldown. Dashboard design language. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { JourneyShell, JourneyCard } from "@/components/auth/journey-shell";
import { getProfile } from "@/lib/tab-mock";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("you@company.com");
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    try {
      const p = getProfile();
      if (!p.email) { router.replace("/signup"); return; }
      setEmail(p.email);
      if (sessionStorage.getItem("vb-email-verified")) router.replace("/welcome");
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
      router.push("/welcome");
    }, 600);
  };

  return (
    <JourneyShell>
      <JourneyCard className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-oat">
          <MailCheck className="size-6 text-caramel" />
        </span>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-coffee">Confirm your seat</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-coffee">{email}</span>.
        </p>
        <p className="mt-0.5 font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.12em] text-latte">
          demo: any six digits open the door
        </p>

        <div className="mt-6 flex justify-center gap-2">
          {code.map((d, i) => (
            <motion.input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              autoFocus={i === 0}
              inputMode="numeric"
              maxLength={1}
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
              className="h-13 w-11 rounded-xl border border-foam bg-cream text-center font-[family-name:var(--font-data)] text-[20px] text-coffee outline-none transition-colors focus:border-caramel"
              style={{ height: 52 }}
            />
          ))}
        </div>

        <button onClick={verify} aria-disabled={!done}
          className="mt-6 h-12 w-full rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
          {checking ? "Checking…" : "Confirm — take my seat"}
        </button>

        <div className="mt-4 text-[13px] text-mocha">
          Nothing arrived?{" "}
          {cooldown > 0 ? (
            <span className="font-[family-name:var(--font-data)] text-[12px] text-latte">resend in {cooldown}s</span>
          ) : (
            <button onClick={() => setCooldown(30)} className="font-medium text-caramel underline-offset-4 hover:underline">Pour another code</button>
          )}
        </div>
        <button onClick={() => router.push("/signup")} className="mt-3 text-[12px] text-latte underline-offset-4 hover:underline">
          Wrong email? Go back and edit it
        </button>
      </JourneyCard>
    </JourneyShell>
  );
}
