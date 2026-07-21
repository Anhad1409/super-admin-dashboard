// Mock data for the operational pages (handoff, monitoring, automation, reports).
export const handoffQueue = [
  { id: "h1", lead: "Rahul Mehta", phone: "+91 98200 11223", campaign: "EMI Reminders", reason: "Asked for a payment extension", sentiment: "frustrated", waitSec: 95 },
  { id: "h2", lead: "Sneha Iyer", phone: "+91 99300 44556", campaign: "Outreach campaign", reason: "Wants to talk to a manager", sentiment: "neutral", waitSec: 42 },
  { id: "h3", lead: "Imran Khan", phone: "+91 98700 77889", campaign: "IOB : Activation", reason: "Complex query on charges", sentiment: "neutral", waitSec: 12 },
];

export const liveCalls = [
  { id: "c1", lead: "Ashish", phone: "+91 99996 43755", campaign: "Outreach campaign", agent: "Anjali", status: "talking", durationSec: 124 },
  { id: "c2", lead: "Tina", phone: "+91 84488 67606", campaign: "EMI Reminders", agent: "Anjali", status: "talking", durationSec: 38 },
  { id: "c3", lead: "Vikram", phone: "+91 90011 22334", campaign: "IOB : Activation", agent: "Rohan", status: "on-hold", durationSec: 76 },
  { id: "c4", lead: "Meera", phone: "+91 91234 55667", campaign: "Outreach campaign", agent: "Anjali", status: "ringing", durationSec: 4 },
  { id: "c5", lead: "Sanjay", phone: "+91 99880 11220", campaign: "EMI Reminders", agent: "Rohan", status: "talking", durationSec: 201 },
];

export const automationRules = [
  { id: "r1", when: "Promise to pay", then: "Send payment link", channel: "SMS", active: true, fired: 42 },
  { id: "r2", when: "No answer (3 attempts)", then: "Send reminder + retry tomorrow", channel: "WhatsApp", active: true, fired: 88 },
  { id: "r3", when: "Lead marked Interested", then: "Push to CRM (HubSpot)", channel: "CRM", active: true, fired: 17 },
  { id: "r4", when: "Callback requested", then: "Schedule callback + calendar invite", channel: "Calendar", active: false, fired: 9 },
  { id: "r5", when: "Wrong number", then: "Flag & remove from list", channel: "System", active: true, fired: 5 },
];

export const messageTemplates = [
  { id: "t1", name: "Payment link", channel: "SMS", preview: "Hi {name}, pay your EMI of ₹{amount} here: {link}" },
  { id: "t2", name: "Callback confirm", channel: "WhatsApp", preview: "Hi {name}, we'll call you back on {date} at {time}." },
  { id: "t3", name: "Missed call", channel: "SMS", preview: "We tried reaching you. Reply CALL to schedule." },
];

export const deliveryLogs = [
  { id: "d1", to: "+91 98200 11223", channel: "SMS", template: "Payment link", status: "delivered", at: "11:42" },
  { id: "d2", to: "+91 99300 44556", channel: "WhatsApp", template: "Callback confirm", status: "delivered", at: "11:39" },
  { id: "d3", to: "+91 98700 77889", channel: "SMS", template: "Missed call", status: "failed", at: "11:30" },
  { id: "d4", to: "+91 90011 22334", channel: "SMS", template: "Payment link", status: "delivered", at: "11:18" },
];

export type Report = { id: string; name: string; desc: string; cat: string; icon: string };
export const reportsCatalog: Report[] = [
  { id: "rp1", name: "Daily Call Summary", desc: "Calls, connects & outcomes by day", cat: "Operations", icon: "phone" },
  { id: "rp2", name: "Campaign Performance", desc: "Funnel & conversion per campaign", cat: "Operations", icon: "megaphone" },
  { id: "rp3", name: "Lead Conversion Funnel", desc: "Reached → qualified → converted", cat: "Leads", icon: "filter" },
  { id: "rp4", name: "Agent Quality Scorecard", desc: "AI agent quality & sentiment", cat: "Quality", icon: "sparkles" },
  { id: "rp5", name: "Channel Utilization", desc: "Concurrency & channel usage over time", cat: "Capacity", icon: "gauge" },
  { id: "rp6", name: "Disposition Breakdown", desc: "Outcomes by category & campaign", cat: "Operations", icon: "list" },
  { id: "rp7", name: "Compliance Audit Log", desc: "DNC, consent & calling-window checks", cat: "Compliance", icon: "shield" },
  { id: "rp8", name: "Wallet & Billing", desc: "Channel spend & transactions", cat: "Finance", icon: "wallet" },
];
