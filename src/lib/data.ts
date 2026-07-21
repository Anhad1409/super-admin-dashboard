// Mock data layer — seeded from real GET responses captured at vox.blostem.info
// (demo-org test data). Swap these imports for fetch() calls to wire a real API.
import overview from "@/data/overview.json";
import timeseries from "@/data/timeseries.json";
import campaignsRaw from "@/data/campaigns.json";
import callsRaw from "@/data/calls.json";
import walletRaw from "@/data/wallet.json";
import orgRaw from "@/data/org.json";
import meRaw from "@/data/me.json";

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "paused" | "completed" | string;
  company_name: string;
  agent_name: string;
  default_language: string;
  llm_provider: string;
  voice_provider: string;
  total_leads: number;
  leads_called: number;
  leads_converted: number;
  created_at: string;
};

export type Call = {
  id: string;
  lead_name: string;
  lead_phone: string;
  status: string;
  disposition: string;
  disposition_label: string | null;
  disposition_category: string | null;
  duration_seconds: number;
  initiated_at: string;
  ended_at: string | null;
  post_call_score: number | null;
  current_score: number | null;
  next_action: string | null;
};

export type Overview = {
  total_campaigns: number;
  active_campaigns: number;
  total_leads: number;
  total_calls: number;
  calls_completed: number;
  calls_failed: number;
  overall_conversion_rate: number;
  total_cost: number;
  avg_call_duration: number;
  avg_agent_quality: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
};

export type TimePoint = {
  date: string; calls: number; completed: number; conversions: number; cost: number; avg_duration: number;
};

export const organization = orgRaw as Record<string, unknown> & { name: string };
export const currentUser = meRaw as { full_name: string; email: string; role: string };
export const wallet = (walletRaw as { wallet: Record<string, unknown> & { balance_inr: string; balance_paisa: number } }).wallet;
export const overviewStats = overview as Overview;
export const timeSeries = (timeseries as { points: TimePoint[] }).points;
export const campaigns = (campaignsRaw as { items: Campaign[] }).items;
export const calls = (callsRaw as { items: Call[] }).items;

// The demo campaign ships zero leads, so derive a leads view from call activity.
export type Lead = {
  name: string; phone: string; calls: number; lastDisposition: string;
  score: number | null; band: "hot" | "warm" | "cold";
};

export const leads: Lead[] = (() => {
  const byPhone = new Map<string, Lead>();
  for (const c of calls) {
    const key = c.lead_phone || c.lead_name;
    const existing = byPhone.get(key);
    const score = c.post_call_score ?? c.current_score ?? null;
    const band: Lead["band"] = score == null ? "cold" : score >= 7 ? "hot" : score >= 4 ? "warm" : "cold";
    if (existing) {
      existing.calls += 1;
      existing.lastDisposition = c.disposition;
      if (score != null) { existing.score = score; existing.band = band; }
    } else {
      byPhone.set(key, { name: c.lead_name, phone: c.lead_phone, calls: 1, lastDisposition: c.disposition, score, band });
    }
  }
  return [...byPhone.values()];
})();
