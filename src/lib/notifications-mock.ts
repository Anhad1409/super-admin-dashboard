// Mock notification feed. Real impl: stream these over the same SSE channel as capacity.
export type Notif = {
  id: string;
  kind: "handoff" | "campaign" | "leads" | "compliance" | "channel" | "system";
  severity: "info" | "success" | "warning" | "danger";
  title: string;
  body: string;
  ago: string;
  unread: boolean;
};

export const notifications: Notif[] = [
  { id: "n1", kind: "handoff", severity: "warning", title: "Handoff requested", body: "AI agent escalated lead ‘Ashish’ on Outreach campaign.", ago: "just now", unread: true },
  { id: "n2", kind: "compliance", severity: "danger", title: "DNC flag", body: "1 number in EMI Reminders matched the DNC registry and was skipped.", ago: "3m", unread: true },
  { id: "n3", kind: "leads", severity: "warning", title: "Low on leads", body: "Personal Campaign has 12 leads remaining at current pace.", ago: "11m", unread: true },
  { id: "n4", kind: "campaign", severity: "success", title: "Campaign completed", body: "‘Welcome activation’ finished — 142 calls, 38 conversions.", ago: "1h", unread: false },
  { id: "n5", kind: "channel", severity: "info", title: "Capacity peaked", body: "You hit 27/30 slots at 11:40. No calls were queued.", ago: "2h", unread: false },
];
