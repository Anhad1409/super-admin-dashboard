import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-glass transition-shadow hover:shadow-glass-hover",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-brand">
            <Icon className="size-[18px]" strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="mt-3 text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </div>
      {sub && <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
