"use client";

import { useState } from "react";
import { Search, Download, Terminal } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

type Sev = "info" | "warn" | "error";
const logs: { sev: Sev; source: string; msg: string; at: string }[] = [
  { sev: "info", source: "dialer", msg: "Outreach campaign — 312 calls dispatched", at: "11:40:02" },
  { sev: "warn", source: "capacity", msg: "EMI Reminders nearing channel cap (2/3)", at: "11:38:51" },
  { sev: "info", source: "webhook", msg: "POST /events → 200 (HubSpot)", at: "11:37:10" },
  { sev: "error", source: "telephony", msg: "Carrier timeout on 1 dial — auto-retried", at: "11:35:44" },
  { sev: "info", source: "compliance", msg: "DNC list refreshed — 1,204 numbers", at: "06:00:00" },
];
const sevCls: Record<Sev, string> = { info: "bg-secondary text-mocha", warn: "bg-warning/12 text-warning", error: "bg-danger/12 text-danger" };
const FILTERS: ("all" | Sev)[] = ["all", "info", "warn", "error"];

export default function SystemLogsPage() {
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<"all" | Sev>("all");
  const list = logs.filter((l) => (sev === "all" || l.sev === sev) && (l.msg.toLowerCase().includes(q.toLowerCase()) || l.source.includes(q.toLowerCase())));
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="System Logs" subtitle="Searchable platform event stream"
        actions={<Button size="sm" variant="outline" onClick={() => toast({ title: "Export", body: "Logs downloading…", severity: "info" })} className="gap-1.5 text-mocha"><Download className="size-3.5" /> Export</Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-foam bg-porcelain px-3 shadow-glass"><Search className="size-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events or source…" className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" /></div>
        {FILTERS.map((x) => <button key={x} onClick={() => setSev(x)} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium capitalize", sev === x ? "border-caramel bg-caramel/10 text-caramel" : "border-foam text-muted-foreground hover:border-latte")}>{x}</button>)}
      </div>
      <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
        <ul className="divide-y divide-foam font-data text-sm">
          {list.map((l, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">{l.at}</span>
              <span className={cn("w-14 shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] font-semibold uppercase", sevCls[l.sev])}>{l.sev}</span>
              <span className="flex w-24 shrink-0 items-center gap-1 text-xs text-mocha"><Terminal className="size-3" />{l.source}</span>
              <span className="flex-1 text-coffee">{l.msg}</span>
            </li>
          ))}
          {list.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted-foreground">No matching events.</li>}
        </ul>
      </div>
    </div>
  );
}
