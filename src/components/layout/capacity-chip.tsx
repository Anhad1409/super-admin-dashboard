"use client";

import { Coffee, Clock, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { useSharedCapacity } from "@/lib/capacity-store";
import { CHANNELS, CAPACITY, HEALTHY_CEILING } from "@/lib/channel-mock";
import { useBillingModel, meteredPlan } from "@/lib/billing";
import { getCredits } from "@/lib/tab-mock";
import { cn } from "@/lib/utils";

/* Top-bar resource readout. Shows THE billed resource for the org's model:
   - subscription (and legacy default): channels live
   - metered: minutes left
   - free: credits left
   One concept at a time — never channels and minutes together. */
export function CapacityChip() {
  const active = useSharedCapacity();
  const { model } = useBillingModel();
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const sync = () => setCredits(getCredits());
    sync();
    window.addEventListener("vb-credits-change", sync);
    return () => window.removeEventListener("vb-credits-change", sync);
  }, []);

  if (model === "metered") {
    const low = meteredPlan.minutesLeft / meteredPlan.planMinutes;
    const tone = low <= 0.1 ? "border-danger/30 bg-danger/10 text-danger"
      : low <= 0.25 ? "border-warning/30 bg-warning/10 text-warning"
      : "border-success/30 bg-success/10 text-success";
    return (
      <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5", tone)} title="Minute balance — per-minute plan">
        <Clock className="size-3.5" />
        <span className="text-sm font-semibold tabular-nums">{meteredPlan.minutesLeft.toLocaleString("en-IN")}</span>
        <span className="text-[11px] opacity-70">min left</span>
      </div>
    );
  }

  if (model === "free") {
    const tone = credits <= 5 ? "border-danger/30 bg-danger/10 text-danger"
      : credits <= 20 ? "border-warning/30 bg-warning/10 text-warning"
      : "border-success/30 bg-success/10 text-success";
    return (
      <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5", tone)} title="Free trial credits">
        <Ticket className="size-3.5" />
        <span className="text-sm font-semibold tabular-nums">{credits}</span>
        <span className="text-[11px] opacity-70">credits</span>
      </div>
    );
  }

  // subscription / legacy: live channel utilisation
  const level = active / CAPACITY;
  const tone =
    level >= 1 ? "border-danger/30 bg-danger/10 text-danger"
    : level >= HEALTHY_CEILING ? "border-warning/30 bg-warning/10 text-warning"
    : "border-success/30 bg-success/10 text-success";

  return (
    <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5", tone)} title="Live channel capacity — 1 channel = 1 call">
      <Coffee className="size-3.5" />
      <span className="text-sm font-semibold tabular-nums">{active}/{CHANNELS}</span>
      <span className="text-[11px] opacity-70">channels live</span>
    </div>
  );
}
