// Channel-capacity mock model (the new USP). The captured API had no channel data,
// so this synthesizes the capacity layer. Real impl: aggregate active calls server-side
// and stream over SSE. 1 channel = 1 agent = up to 3 concurrent calls.
import { calls } from "./data";

export const CHANNELS = 10;
export const SLOTS_PER_CHANNEL = 1; // 1 channel = 1 concurrent call
export const CAPACITY = CHANNELS * SLOTS_PER_CHANNEL; // 10
export const HEALTHY_CEILING = 0.85;

export const baselineActive = 6;
export const channelsEngaged = 6;
export const idleChannels = 4;
export const queued = 0;

export const connectRate = 0.61; // "gateway" KPI
export const conversionsToday = 12;

export type LiveCampaign = {
  id: string;
  name: string;
  slotsUsed: number;
  slotsCap: number;
  status: "running" | "paused" | "scheduled";
  hot: number;
  warm: number;
  cold: number;
  reached: number;
  total: number;
};

export const liveCampaigns: LiveCampaign[] = [
  { id: "c1", name: "Outreach campaign", slotsUsed: 3, slotsCap: 4, status: "running", hot: 18, warm: 34, cold: 20, reached: 48, total: 72 },
  { id: "c2", name: "EMI Reminders", slotsUsed: 2, slotsCap: 3, status: "running", hot: 9, warm: 15, cold: 22, reached: 31, total: 60 },
  { id: "c3", name: "IOB : Mobile Banking Activation", slotsUsed: 0, slotsCap: 2, status: "paused", hot: 4, warm: 11, cold: 9, reached: 14, total: 40 },
  { id: "c4", name: "Personal Campaign", slotsUsed: 0, slotsCap: 1, status: "scheduled", hot: 0, warm: 0, cold: 0, reached: 0, total: 25 },
];

export type Attention = {
  id: string;
  kind: "handoff" | "leads" | "compliance" | "channel";
  severity: "info" | "warning" | "danger";
  text: string;
  action: string;
};

export const attention: Attention[] = [
  { id: "a1", kind: "handoff", severity: "warning", text: "2 handoffs requested by AI agents", action: "Open queue" },
  { id: "a2", kind: "leads", severity: "warning", text: "Personal Campaign is low on leads (12 left)", action: "Import leads" },
  { id: "a3", kind: "compliance", severity: "danger", text: "1 number flagged on DNC registry", action: "Review" },
];

// --- outcome mix (4 buckets), derived from captured call dispositions ---
import { bucketOf, bucketMeta, bucketOrder } from "./outcomes";
export type OutcomeSlice = { key: string; label: string; value: number; color: string };

const counts = { reached: 0, callback: 0, dropped: 0, failed: 0 };
for (const c of calls) counts[bucketOf(c.disposition)] += 1;
// nudge so the donut reads well even on the tiny seed sample
const seed = { reached: 44, callback: 9, dropped: 16, failed: 31 };

export const outcomeMix: OutcomeSlice[] = bucketOrder.map((b) => ({
  key: b,
  label: bucketMeta[b].label,
  value: counts[b] + seed[b],
  color: bucketMeta[b].color,
}));
