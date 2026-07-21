"use client";

/* Single shared live-capacity source. One random walk, one interval — every
   subscriber (topbar chip, dashboard hero, anywhere else) reads the SAME
   number, so the UI can never show two different "right now" values.
   Real impl: one EventSource('/api/v1/orgs/:id/capacity/stream') feeding this. */

import { useSyncExternalStore } from "react";
import { CAPACITY, baselineActive } from "./channel-mock";

let active = baselineActive;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function tick() {
  const step = Math.round((Math.random() - 0.5) * 2.4); // -1..+1, calm
  active = Math.max(3, Math.min(CAPACITY - 1, active + step));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) timer = setInterval(tick, 5000);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) { clearInterval(timer); timer = null; }
  };
}

const getSnapshot = () => active;
const getServerSnapshot = () => baselineActive;

/** Live slots in use — identical for every component that calls this. */
export function useSharedCapacity(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Nudge the walk once (used by the dashboard's manual refresh). */
export function refreshCapacity() { tick(); }
