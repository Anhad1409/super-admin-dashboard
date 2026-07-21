"use client";

/* /magic — where the emailed magic bean ✳ link lands. A short "verifying the
   bean" beat (sprouting bean + waveform), then pours into /dashboard. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { JourneyShell, JourneyCard } from "@/components/auth/journey-shell";

export default function MagicPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<"checking" | "good">("checking");

  useEffect(() => {
    const a = setTimeout(() => setStage("good"), reduce ? 200 : 1500);
    const b = setTimeout(() => {
      try { sessionStorage.setItem("vb-poured", "1"); } catch {}
      router.push("/dashboard");
    }, reduce ? 500 : 2600);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [router, reduce]);

  return (
    <JourneyShell>
      <JourneyCard className="max-w-sm text-center">
        {/* the bean, sprouting a waveform */}
        <div className="relative mx-auto h-24 w-24">
          <motion.svg viewBox="0 0 96 96" className="h-full w-full"
            animate={reduce ? {} : stage === "checking" ? { rotate: [0, -6, 6, 0] } : {}}
            transition={{ duration: 1.2, repeat: stage === "checking" ? Infinity : 0, ease: "easeInOut" }}>
            <ellipse cx="48" cy="52" rx="26" ry="36" fill="#6b4423" />
            <path d="M48 18 C 36 38 60 66 48 86" stroke="#fdf8f0" strokeWidth="4" fill="none" strokeLinecap="round" />
            {stage === "good" && [0, 1, 2, 3, 4].map((i) => (
              <motion.rect key={i} x={30 + i * 9} width="4" rx="2" fill="#4fb0a5"
                initial={{ y: 30, height: 0 }}
                animate={{ y: 30 - (i % 2 ? 10 : 4), height: 12 + (i % 3) * 8 }}
                transition={{ delay: reduce ? 0 : 0.15 + i * 0.07, type: "spring", stiffness: 300, damping: 18 }} />
            ))}
          </motion.svg>
          {stage === "good" && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 320, damping: 16 }}
              className="absolute -right-1 -top-1 text-xl text-steam">✳</motion.span>
          )}
        </div>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-coffee">
          {stage === "checking" ? "Checking the bean…" : "Fresh bean. You're in."}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {stage === "checking" ? "Verifying your magic link with the house." : "Pouring you into the roastery…"}
        </p>
        <div className="mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full bg-foam">
          <motion.div className="h-full rounded-full bg-brand"
            initial={{ width: "8%" }} animate={{ width: stage === "good" ? "100%" : "55%" }}
            transition={{ duration: reduce ? 0.2 : 1.1, ease: "easeInOut" }} />
        </div>
      </JourneyCard>
    </JourneyShell>
  );
}
