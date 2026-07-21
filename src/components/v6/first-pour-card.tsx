"use client";

/* First test call nudge — persists on /dashboard for free-plan users until
   they hear their agent once. Numbers are provisioned by the platform, so
   there is nothing for the customer to verify. Spec §3 step 4. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { getPlan, getProfile } from "@/lib/tab-mock";

export function FirstPourCard() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const sync = () => { try { setShow(getPlan() === "free" && !getProfile().phoneVerified); } catch {} };
    sync();
    window.addEventListener("vb-credits-change", sync);
    return () => window.removeEventListener("vb-credits-change", sync);
  }, []);
  if (!show) return null;
  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-foam bg-gradient-to-r from-oat/70 to-cream px-4 py-3 shadow-glass">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl" style={{ background: "#4fb0a5" }}><Phone className="size-4 text-white" /></span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-coffee">Make your first test call</div>
        <div className="text-xs text-muted-foreground">We&apos;ll call your phone so you can hear your agent live — free, and your calling number is already set up by us.</div>
      </div>
      <Link href="/welcome" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-coffee px-3.5 py-1.5 text-xs font-semibold text-cream hover:bg-espresso">
        Call me now <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
