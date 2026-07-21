// Mock data for v6 features: AI blocker analysis + scheduling / smart-pause.
// v6-only — not imported by v2–v5.

export type Blocker = {
  id: string;
  title: string;
  campaign: string;
  severity: "high" | "med" | "low";
  reportedBy: number;      // distinct customers who hit it
  windowMins: number;      // detected within last N minutes
  pctOfCalls: number;      // share of recent calls affected
  connectImpact: number;   // connect-rate change in pts (negative = worse)
  detectedAt: string;
  brief: string;           // one-liner for the notification
  summary: string;         // plain-language "what's happening"
  quotes: string[];        // representative customer lines
  rootCause: string;       // AI analysis
  recommendation: string;  // what to do
  fixBefore: string;       // current opening line
  fixAfter: string;        // suggested opening line
};

export const blocker: Blocker = {
  id: "blk-emi-scam",
  title: "Opening line is reading as a scam",
  campaign: "EMI Reminders",
  severity: "high",
  reportedBy: 14,
  windowMins: 60,
  pctOfCalls: 12,
  connectImpact: -9,
  detectedAt: "Today · 11:48 AM",
  brief: "14 customers in the last hour pushed back with “is this a scam?” right after the opening — connect rate on EMI Reminders is down 9 points.",
  summary:
    "VoiceBrew AI noticed the same objection clustering across calls: customers are challenging the agent’s legitimacy in the first 10 seconds. It happens right after the agent states the EMI amount before introducing the brand, so the call reads like a phishing attempt and people disengage.",
  quotes: [
    "Is this a real call or some scam?",
    "How did you get my number?",
    "I’m not sharing anything until I know who this is.",
    "Sounds like one of those fraud calls, bye.",
  ],
  rootCause:
    "The opening jumps straight to a money amount before identifying the brand and purpose. Without an upfront brand + reason + verification cue, the LLM’s strong open triggers fraud-pattern recognition in customers.",
  recommendation:
    "Lead with the brand and the reason for the call, offer a quick verification cue, and only then mention the amount. Re-test on a small batch before resuming at full volume.",
  fixBefore: "Hi, your EMI of ₹4,200 is due on the 5th — shall I set up auto-pay?",
  fixAfter: "Hi {full_name}, this is Anjali calling on behalf of {company} about your loan account ending 4421 — is now a good time for a quick reminder?",
};

// scheduling helpers
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const TIMEZONES = ["Asia/Kolkata (IST)", "Asia/Dubai (GST)", "Asia/Singapore (SGT)"];

// default smart-pause quiet window(s)
export type QuietWindow = { id: string; label: string; start: string; end: string };
export const defaultQuietHours: QuietWindow[] = [
  { id: "lunch", label: "Lunch break", start: "13:00", end: "14:00" },
];
