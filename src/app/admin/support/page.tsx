"use client";

/* /admin/support — support tickets across every client, prioritised. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LifeBuoy, AlertTriangle, Clock3, CheckCircle2 } from "lucide-react";
import { CpHeader, StatTile, Card, Tag, mono } from "@/components/admin/cp";
import { tickets, PRIORITY_META, type Priority } from "@/lib/admin-mock";
import { companyDetail, listDetail } from "@/lib/metric-details";

const STATUS_TONE = { open: "var(--color-danger)", pending: "var(--color-warning)", resolved: "var(--color-success)" } as const;
const FILTERS = ["All", "urgent", "high", "normal", "low"] as const;

export default function SupportPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const rows = useMemo(() => filter === "All" ? tickets : tickets.filter((t) => t.priority === filter), [filter]);
  const urgent = tickets.filter((t) => t.priority === "urgent").length;
  const open = tickets.filter((t) => t.status === "open").length;

  const openDetail = companyDetail({
    title: "Open tickets", value: String(open),
    description: "Open tickets per company. Compare against call volume — a small caller with many tickets is drowning.",
    of: (c) => c.openTickets,
    fmt: (n) => `${n} ticket${n > 1 ? "s" : ""}`,
    sub: (c) => `${(c.callsMonth / 1000).toFixed(1)}k calls`,
    flag: (c) => c.openTickets >= 4,
  });
  const urgentSet = tickets.filter((t) => t.priority === "urgent");
  const urgentDetail = listDetail("Urgent tickets", String(urgent),
    "Every urgent ticket in the queue — respond today.", "By company",
    urgentSet.map((t) => ({ name: t.client.name, value: t.subject, tint: "var(--color-danger)", href: `/admin/clients/${t.client.id}`, sub: `${t.id} · ${t.age} old · ${t.assignee}`, flag: true })));
  const assignees = [...new Set(tickets.map((t) => t.assignee))];
  const responseDetail = listDetail("Avg first response", "2.4h",
    "Queue load by assignee — response time tracks inversely with open load.", "By assignee",
    assignees.map((a) => {
      const mine = tickets.filter((t) => t.assignee === a);
      return { name: a, value: `${mine.length} tickets`, pct: mine.length, tint: "var(--color-caramel)", sub: `${mine.filter((t) => t.priority === "urgent").length} urgent` };
    }));

  return (
    <div className="mx-auto max-w-[1300px] space-y-5">
      <CpHeader title="Support" subtitle="Every open ticket across the platform, prioritised by urgency." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={LifeBuoy} label="Open tickets" value={open} sub={`${tickets.length} total in queue`} tint="var(--color-steam)" detail={openDetail} />
        <StatTile icon={AlertTriangle} label="Urgent" value={urgent} sub="need a response today" tint="var(--color-danger)" detail={urgentDetail} />
        <StatTile icon={Clock3} label="Avg first response" value="2.4h" sub="last 30 days" tint="var(--color-caramel)" detail={responseDetail} />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full border px-2.5 py-1 text-[12px] font-medium capitalize transition-colors ${filter === f ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-mocha hover:border-latte"}`}>
              {f}{f !== "All" && <span className="ml-1 text-latte tabular-nums">{tickets.filter((t) => t.priority === (f as Priority)).length}</span>}
            </button>
          ))}
        </div>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <CheckCircle2 className="size-7 text-success" />
            <p className="text-sm font-medium text-coffee">No {filter} tickets</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
                <th className="py-2.5 font-medium">Ticket</th><th className="font-medium">Client</th><th className="font-medium">Subject</th><th className="font-medium">Priority</th><th className="font-medium">Status</th><th className="font-medium">Age</th><th className="pl-2 font-medium">Assignee</th>
              </tr></thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} onClick={() => router.push(`/admin/clients/${t.client.id}`)} className="cursor-pointer border-b border-foam/60 last:border-0 hover:bg-oat/30">
                    <td className={`${mono} py-3 text-[11px] text-mocha`}>{t.id}</td>
                    <td className="text-[13px] font-medium text-coffee">{t.client.name}</td>
                    <td className="max-w-[240px] truncate text-[12.5px] text-mocha">{t.subject}</td>
                    <td><Tag c={PRIORITY_META[t.priority].tint}>{PRIORITY_META[t.priority].label}</Tag></td>
                    <td><Tag c={STATUS_TONE[t.status]}>{t.status[0].toUpperCase() + t.status.slice(1)}</Tag></td>
                    <td className="text-[12px] text-latte tabular-nums">{t.age}</td>
                    <td className="pl-2 text-[12px] text-muted-foreground">{t.assignee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
