"use client";

/* /admin/clients/list — the full client directory: every column, searchable,
   filterable and sortable. The overview shows a compact roster; this is the
   working list. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Download } from "lucide-react";
import { toast } from "@/components/notifications/toaster";
import { CpHeader, Card, Tag, mono } from "@/components/admin/cp";
import { clients, churnRiskOf, PLAN_META, STATUS_META, type Client } from "@/lib/clients-mock";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Active", "Trial", "At-risk", "Past due", "Churned"] as const;
type Filter = (typeof FILTERS)[number];
type SortKey = "mrr" | "callsMonth" | "connectPct" | "health" | "seatsUsed" | "name";
const RISK_TONE = { low: "var(--color-success)", medium: "var(--color-warning)", high: "var(--color-danger)" };

export default function ClientsListPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<SortKey>("mrr");

  const rows = useMemo(() => {
    let list = clients.filter((c) => {
      if (q && !`${c.name} ${c.vertical} ${c.contactName}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (filter === "Active") return c.status === "active";
      if (filter === "Trial") return c.status === "trial";
      if (filter === "Past due") return c.status === "past_due";
      if (filter === "Churned") return c.status === "churned";
      if (filter === "At-risk") return churnRiskOf(c) === "high" && c.status !== "churned";
      return true;
    });
    return [...list].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : (b[sort] as number) - (a[sort] as number));
  }, [q, filter, sort]);

  const counts: Record<Filter, number> = {
    All: clients.length,
    Active: clients.filter((c) => c.status === "active").length,
    Trial: clients.filter((c) => c.status === "trial").length,
    "At-risk": clients.filter((c) => churnRiskOf(c) === "high" && c.status !== "churned").length,
    "Past due": clients.filter((c) => c.status === "past_due").length,
    Churned: clients.filter((c) => c.status === "churned").length,
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Clients" subtitle={`All ${clients.length} client organisations on the platform.`}
        right={<button onClick={() => toast({ title: "Export", body: "Client directory exported to CSV.", severity: "success" })} className="inline-flex items-center gap-1.5 rounded-full bg-caramel/20 px-3.5 py-2 text-xs font-semibold text-caramel hover:bg-caramel/30"><Download className="size-3.5" /> Export</button>} />

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-latte" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" className="h-9 w-56 rounded-full border border-foam bg-cream pl-8 pr-3 text-[13px] text-coffee outline-none focus:border-caramel" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-9 rounded-full border border-foam bg-cream px-3 text-[12.5px] text-mocha outline-none focus:border-caramel">
            <option value="mrr">Sort: MRR</option><option value="callsMonth">Sort: Calls</option><option value="connectPct">Sort: Connect %</option><option value="health">Sort: Health</option><option value="seatsUsed">Sort: Seats</option><option value="name">Sort: Name</option>
          </select>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors", filter === f ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-mocha hover:border-latte")}>
                {f} <span className={cn("tabular-nums", filter === f ? "text-brand-foreground/80" : "text-latte")}>{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
              <th className="py-2.5 pl-1 font-medium">Client</th><th className="px-2 font-medium">Plan</th><th className="px-2 font-medium">Status</th>
              <th className="px-2 text-right font-medium">MRR</th><th className="px-2 text-right font-medium">Calls</th><th className="px-2 text-right font-medium">Connect</th>
              <th className="px-2 text-right font-medium">Seats</th><th className="px-2 text-right font-medium">Health</th><th className="px-2 font-medium">Last active</th><th className="px-2 font-medium"></th>
            </tr></thead>
            <tbody>
              {rows.map((c) => <Row key={c.id} c={c} onOpen={() => router.push(`/admin/clients/${c.id}`)} />)}
              {rows.length === 0 && <tr><td colSpan={10} className="py-10 text-center text-sm text-muted-foreground">No clients match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Row({ c, onOpen }: { c: Client; onOpen: () => void }) {
  const risk = churnRiskOf(c);
  return (
    <tr onClick={onOpen} className="cursor-pointer border-b border-foam/60 last:border-0 hover:bg-oat/30">
      <td className="py-3 pl-1">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full font-serif text-[12px] font-semibold text-porcelain shadow-glass" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${PLAN_META[c.plan].tint} 55%, #c9a87c), ${PLAN_META[c.plan].tint})` }}>{c.name[0]}</span>
          <div className="min-w-0"><div className="truncate text-[13px] font-semibold text-coffee">{c.name}</div><div className="truncate text-[11px] text-muted-foreground">{c.vertical}</div></div>
        </div>
      </td>
      <td className="px-2"><span className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-cream px-2 py-0.5 text-[11px] font-medium text-coffee"><span className="size-2 rounded-full" style={{ background: PLAN_META[c.plan].tint }} />{PLAN_META[c.plan].label}</span></td>
      <td className="px-2"><span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", STATUS_META[c.status].badge)}>{STATUS_META[c.status].label}</span></td>
      <td className="px-2 text-right text-[13px] font-semibold text-coffee tabular-nums">{c.mrr ? `₹${c.mrr.toLocaleString("en-IN")}` : "—"}</td>
      <td className="px-2 text-right text-[12.5px] text-mocha tabular-nums">{c.callsMonth ? `${(c.callsMonth / 1000).toFixed(1)}k` : "—"}</td>
      <td className="px-2 text-right text-[12.5px] text-mocha tabular-nums">{c.connectPct ? `${c.connectPct}%` : "—"}</td>
      <td className="px-2 text-right text-[12.5px] text-mocha tabular-nums">{c.seatsUsed}/{c.seatsTotal}</td>
      <td className="px-2 text-right"><span className="text-[12.5px] font-semibold tabular-nums" style={{ color: RISK_TONE[risk] }}>{c.health}</span></td>
      <td className="px-2 text-[12px] text-muted-foreground">{new Date(c.lastActive + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
      <td className="px-2 text-right"><ChevronRight className="ml-auto size-4 text-latte" /></td>
    </tr>
  );
}
