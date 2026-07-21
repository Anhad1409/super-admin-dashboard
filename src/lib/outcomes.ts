// Single source of truth for collapsing raw call dispositions into 4 operator-facing
// outcome buckets. Used by Calls, the dashboard donut, and anywhere outcomes appear.
export type Bucket = "reached" | "callback" | "dropped" | "failed";

export function bucketOf(disposition: string): Bucket {
  const d = (disposition || "").toLowerCase();
  if (/callback/.test(d)) return "callback";
  // failure patterns first — "not_answered" must not match the "answered" in "reached"
  if (/not[_ -]?answer|no[_ -]?answer|busy|fail|unreachable|rejected|invalid|no[_ -]?contact/.test(d)) return "failed";
  if (/hangup|dropped|silent|no_greeting|voicemail|disconnect|abandon/.test(d)) return "dropped";
  if (/answered|completed|interested|converted|success|connected|reached/.test(d)) return "reached";
  return "failed";
}

export const bucketMeta: Record<Bucket, { label: string; color: string; badge: string }> = {
  reached: { label: "Reached", color: "var(--color-success)", badge: "bg-success/12 text-success border-success/25" },
  callback: { label: "Callback", color: "var(--color-info)", badge: "bg-info/12 text-info border-info/25" },
  dropped: { label: "Dropped", color: "var(--color-warning)", badge: "bg-warning/12 text-warning border-warning/25" },
  failed: { label: "Failed", color: "var(--color-danger)", badge: "bg-danger/12 text-danger border-danger/25" },
};

export const bucketOrder: Bucket[] = ["reached", "callback", "dropped", "failed"];
