// OPEN A TAB — single source of truth for the freemium tab state (mock).
// Keys: vb-credits, vb-plan, vb-table-no, vb-profile, vb-ledger, vb-onboarded.
// Dispatches 'vb-credits-change' on every write; listeners: WalletMeter etc.

export type TabProfile = {
  name?: string; email?: string; brand?: string; role?: string; teamSize?: string;
  useCase?: string; vertical?: string; languages?: string[]; volume?: string;
  goals?: string[]; campaignKinds?: string[];
  currentSetup?: string; callDirection?: string; dltStatus?: string; launchTimeline?: string;
  baristaPersona?: string; callingWindow?: string; crmStack?: string;
  compliancePath?: "promo" | "service"; phoneVerified?: boolean; phone?: string;
  skipped?: string[]; agreedTerms?: boolean;
};
export type LedgerLine = { label: string; delta: number | null; at: string }; // delta null = "on the house"

const safe = <T,>(fn: () => T, fallback: T): T => { try { return fn(); } catch { return fallback; } };
const emit = () => safe(() => window.dispatchEvent(new CustomEvent("vb-credits-change")), undefined);

export const getCredits = () => safe(() => Number(localStorage.getItem("vb-credits") ?? "0"), 0);
export const getPlan = () => safe(() => localStorage.getItem("vb-plan"), null);
export const getTableNo = () => safe(() => localStorage.getItem("vb-table-no"), null);
export const getProfile = (): TabProfile => safe(() => JSON.parse(localStorage.getItem("vb-profile") || "{}"), {});
export const getLedger = (): LedgerLine[] => safe(() => JSON.parse(localStorage.getItem("vb-ledger") || "[]"), []);

export const setProfile = (patch: Partial<TabProfile>) =>
  safe(() => {
    const next = { ...getProfile(), ...patch };
    localStorage.setItem("vb-profile", JSON.stringify(next));
    emit();
    return next;
  }, {} as TabProfile);

export const ensureTableNo = () =>
  safe(() => {
    let n = localStorage.getItem("vb-table-no");
    if (!n) { n = String(Math.floor(Math.random() * 188) + 12).padStart(3, "0"); localStorage.setItem("vb-table-no", n); }
    return n;
  }, "042");

export const addLedger = (label: string, delta: number | null) =>
  safe(() => {
    const l = getLedger();
    l.unshift({ label, delta, at: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }) });
    localStorage.setItem("vb-ledger", JSON.stringify(l.slice(0, 30)));
    emit();
  }, undefined);

export const grantOpeningBalance = () =>
  safe(() => {
    localStorage.setItem("vb-credits", "50");
    localStorage.setItem("vb-plan", "free");
    localStorage.setItem("vb-onboarded", "1");
    addLedger("OPENING BALANCE", 50);
    emit();
  }, undefined);

export const creditSips = (n: number, label: string) =>
  safe(() => {
    localStorage.setItem("vb-credits", String(getCredits() + n));
    addLedger(label, n);
    emit();
  }, undefined);

export const debitSips = (n: number, label: string) =>
  safe(() => {
    localStorage.setItem("vb-credits", String(Math.max(0, getCredits() - n)));
    addLedger(label, -n);
    emit();
  }, undefined);

export const setPlan = (p: "free" | "regular" | "house") =>
  safe(() => { localStorage.setItem("vb-plan", p); emit(); }, undefined);

/** Fresh tab for a new registration — clears all onboarding/credit state
    so the wizard always runs and captures everything again. */
export const resetTab = () =>
  safe(() => {
    ["vb-onboarded", "vb-credits", "vb-plan", "vb-ledger", "vb-table-no", "vb-profile", "vb-nudge-seen"].forEach((k) => localStorage.removeItem(k));
    ["vb-wizard-step", "vb-just-granted", "vb-tab-open"].forEach((k) => sessionStorage.removeItem(k));
    emit();
  }, undefined);

export const SIP_RATE = 8; // ₹8/min → 1 sip = ₹1 → 8 sips per minute
export const sipsToMin = (s: number) => (s / SIP_RATE).toFixed(1);
