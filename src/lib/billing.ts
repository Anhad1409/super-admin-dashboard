"use client";

/* Billing-model state. VoiceBrew sells on two commercial models:
   - "subscription": flat fee for N channels — capacity is the resource,
     so the UI talks in channels/agents live. No minute meter.
   - "metered": per-minute pricing — minutes are the resource, so the UI
     talks in minutes left + burn. No channel math shown.
   - "free": the freemium tab (50 credits) — treated like metered, in credits.

   The chrome (topbar chip, sidebar meter, dashboard hero) switches on this —
   one resource concept at a time, never both. Legacy behaviour (no explicit
   vb-billing key and not on the free plan) keeps the old chip+meter combo so
   untouched sessions look exactly as before. */

import { useEffect, useState } from "react";
import { getPlan } from "./tab-mock";

export type BillingModel = "subscription" | "metered" | "free";

const KEY = "vb-billing";
const EVT = "vb-billing-change";

const safe = <T,>(fn: () => T, fb: T): T => { try { return fn(); } catch { return fb; } };

/** The explicit vb-billing value, or null if the user never chose one. */
export const getExplicitBilling = (): "subscription" | "metered" | null =>
  safe(() => {
    const v = localStorage.getItem(KEY);
    return v === "subscription" || v === "metered" ? v : null;
  }, null);

export const getBillingModel = (): BillingModel => {
  if (getPlan() === "free") return "free";
  return getExplicitBilling() ?? "subscription";
};

export const setBillingModel = (m: "subscription" | "metered") =>
  safe(() => {
    localStorage.setItem(KEY, m);
    window.dispatchEvent(new CustomEvent(EVT));
    return undefined;
  }, undefined);

/** Reactive billing model; `explicit` is false while on legacy default. */
export function useBillingModel(): { model: BillingModel; explicit: boolean } {
  const [state, setState] = useState<{ model: BillingModel; explicit: boolean }>({ model: "subscription", explicit: false });
  useEffect(() => {
    const sync = () => setState({ model: getBillingModel(), explicit: getExplicitBilling() !== null || getPlan() === "free" });
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("vb-credits-change", sync); // plan changes ride this
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("vb-credits-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}

/* ---- plan facts (mock; real impl reads the org's plan from the API) ---- */

export const subscriptionPlan = {
  name: "Growth",
  channels: 10,
  priceMonthly: 24000, // ₹/month flat
};

export const meteredPlan = {
  planMinutes: 1000,
  minutesLeft: 412,
  ratePerMin: 8, // ₹
  avgDailyBurnMin: 46,
};

/** Days of runway at the current burn (metered model). */
export const meteredRunwayDays = () =>
  meteredPlan.avgDailyBurnMin > 0 ? Math.ceil(meteredPlan.minutesLeft / meteredPlan.avgDailyBurnMin) : Infinity;
