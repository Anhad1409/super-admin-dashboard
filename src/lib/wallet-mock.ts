// Minute-balance wallet (the per-minute billing model, alongside channel purchase).
export const wallet = {
  minutes: 720,          // current minute balance
  planMinutes: 5000,     // this cycle's allowance (for the usage bar)
  usedThisCycle: 4280,
  lowThreshold: 1000,    // <= low  → amber
  criticalThreshold: 300, // <= critical → red
  ratePerMin: 8,         // ₹ per minute (minute model)
  cycleResets: "1 Jul",
};

export type WalletTxn = {
  id: string;
  type: "topup" | "usage" | "bonus";
  label: string;
  minutes: number;       // + for credit, − for debit
  at: string;
  balanceAfter: number;
};

export const walletHistory: WalletTxn[] = [
  { id: "w1", type: "usage", label: "Outreach campaign · 312 calls", minutes: -210, at: "Today 11:40", balanceAfter: 720 },
  { id: "w2", type: "usage", label: "EMI Reminders · 148 calls", minutes: -96, at: "Today 09:15", balanceAfter: 930 },
  { id: "w3", type: "topup", label: "Top-up · UPI", minutes: 1000, at: "Yesterday 18:02", balanceAfter: 1026 },
  { id: "w4", type: "usage", label: "IOB Activation · 60 calls", minutes: -74, at: "Yesterday 14:20", balanceAfter: 26 },
  { id: "w5", type: "bonus", label: "Onboarding bonus", minutes: 100, at: "18 Jun", balanceAfter: 100 },
];

// minutes used per day, last 7 days (for the usage sparkline)
export const walletUsage = [180, 240, 96, 310, 150, 268, 306];

export const topupPacks = [
  { minutes: 500, price: 4000 },
  { minutes: 1000, price: 7600, badge: "Popular" },
  { minutes: 2500, price: 18000, badge: "Best value" },
  { minutes: 5000, price: 34000 },
];

export type WalletState = "healthy" | "low" | "critical";
export function walletState(min: number): WalletState {
  if (min <= wallet.criticalThreshold) return "critical";
  if (min <= wallet.lowThreshold) return "low";
  return "healthy";
}
