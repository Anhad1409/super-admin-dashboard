"use client";

/* /admin/audit — the super-admin action log: who did what to which client. */

import { useMemo, useState } from "react";
import { History, LogIn, Wallet, SlidersHorizontal, ShieldCheck, RefreshCw, UserPlus } from "lucide-react";
import { CpHeader, Card, mono } from "@/components/admin/cp";
import { audit, type AuditEntry } from "@/lib/admin-mock";

const KIND_META: Record<AuditEntry["kind"], { icon: typeof History; tint: string; label: string }> = {
  access:     { icon: LogIn, tint: "var(--color-blueberry)", label: "Access" },
  billing:    { icon: Wallet, tint: "var(--color-mango)", label: "Billing" },
  feature:    { icon: SlidersHorizontal, tint: "var(--color-caramel)", label: "Feature" },
  compliance: { icon: ShieldCheck, tint: "var(--color-steam)", label: "Compliance" },
  plan:       { icon: RefreshCw, tint: "var(--color-success)", label: "Plan" },
  staff:      { icon: UserPlus, tint: "var(--color-danger)", label: "Staff" },
};
const KINDS = ["All", "access", "billing", "feature", "compliance", "plan", "staff"] as const;

export default function AuditPage() {
  const [filter, setFilter] = useState<(typeof KINDS)[number]>("All");
  const rows = useMemo(() => filter === "All" ? audit : audit.filter((a) => a.kind === filter), [filter]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Audit log" subtitle="Every privileged action in the control plane — who did what, to which client, when." />

      <Card>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {KINDS.map((k) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`rounded-full border px-2.5 py-1 text-[12px] font-medium capitalize transition-colors ${filter === k ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-mocha hover:border-latte"}`}>
              {k === "All" ? "All" : KIND_META[k].label}
            </button>
          ))}
        </div>
        <ul className="relative space-y-1 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-foam">
          {rows.map((a, i) => {
            const meta = KIND_META[a.kind];
            const Icon = meta.icon;
            return (
              <li key={i} className="relative flex items-start gap-3 rounded-xl py-2.5 pl-0 pr-2 hover:bg-oat/30">
                <span className="z-[1] mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-foam bg-porcelain" style={{ color: `color-mix(in srgb, ${meta.tint} 78%, #2a1a0f)` }}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-coffee">
                    <span className="font-semibold">{a.actor}</span> {a.action.toLowerCase()} · <span className="font-medium">{a.target}</span>
                  </p>
                  <p className={`${mono} mt-0.5 text-[10px] uppercase tracking-wide text-latte`}>{a.when}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
