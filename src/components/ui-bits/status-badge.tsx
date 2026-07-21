import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/format";

// warm-palette status colors approximating the original pill styles
const MAP: Record<string, string> = {
  // campaign statuses
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-sky-100 text-sky-700 border-sky-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
  draft: "bg-stone-100 text-stone-600 border-stone-200",
  // call dispositions / categories
  answered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  callback: "bg-sky-100 text-sky-700 border-sky-200",
  customer_hangup: "bg-amber-100 text-amber-700 border-amber-200",
  no_greeting_response: "bg-amber-100 text-amber-700 border-amber-200",
  silent_pickup: "bg-stone-100 text-stone-600 border-stone-200",
  not_answered: "bg-rose-100 text-rose-700 border-rose-200",
  failed: "bg-rose-100 text-rose-700 border-rose-200",
  // lead bands
  hot: "bg-orange-100 text-orange-700 border-orange-200",
  warm: "bg-amber-100 text-amber-700 border-amber-200",
  cold: "bg-slate-100 text-slate-600 border-slate-200",
};

export function StatusBadge({ value, label }: { value: string; label?: string | null }) {
  const cls = MAP[value] ?? "bg-stone-100 text-stone-600 border-stone-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        cls
      )}
    >
      {label || titleCase(value)}
    </span>
  );
}
