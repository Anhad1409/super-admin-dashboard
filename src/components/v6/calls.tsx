"use client";

import { useMemo, useState, Fragment } from "react";
import { PhoneOff, Search, ChevronRight, ChevronDown, Headset, Play, FileText, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui-bits/page-header";
import { EmptyState } from "@/components/ui-bits/empty-state";
import { calls, campaigns } from "@/lib/data";
import { bucketOf, bucketMeta, bucketOrder, type Bucket } from "@/lib/outcomes";
import { formatDuration, formatDateTime, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const inputCls = "rounded-lg border border-foam bg-card px-3 py-1.5 text-sm text-coffee outline-none focus:border-caramel";
const businessOutcomes = ["All outcomes", "Not Connected", "Ended — No Outcome", "Transferred", "Callback Scheduled", "Do Not Call", "Not Interested", "Wrong Number"];
const preScore = (id: string) => 35 + (id.charCodeAt(id.length - 1) % 45);

export function V6Calls() {
  const router = useRouter();
  const [filter, setFilter] = useState<Bucket | "all">("all");
  const [campaign, setCampaign] = useState("All campaigns");
  const [q, setQ] = useState("");
  const [bizOutcome, setBizOutcome] = useState("All outcomes");
  const [testMode, setTestMode] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { reached: 0, callback: 0, dropped: 0, failed: 0 };
    for (const call of calls) c[bucketOf(call.disposition)] += 1;
    return c;
  }, []);

  const rows = calls.filter((c) => {
    if (filter !== "all" && bucketOf(c.disposition) !== filter) return false;
    if (q && !(`${c.lead_name} ${c.lead_phone} ${c.id}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Calls" subtitle={`${calls.length} calls`} />

      {/* controls bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className={inputCls}>
          <option>All campaigns</option>{campaigns.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-foam bg-card px-3"><Search className="size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, or call ID…" className="flex-1 bg-transparent py-1.5 text-sm text-coffee outline-none" /></div>
        <input type="date" className={inputCls} title="From" />
        <span className="text-muted-foreground">→</span>
        <input type="date" className={inputCls} title="To" />
        <select value={bizOutcome} onChange={(e) => setBizOutcome(e.target.value)} className={inputCls}>{businessOutcomes.map((b) => <option key={b}>{b}</option>)}</select>
        <button onClick={() => setTestMode((v) => !v)} className="flex items-center gap-2 text-sm text-mocha"><span className={cn("relative h-5 w-9 rounded-full transition-colors", testMode ? "bg-success" : "bg-foam")}><span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-all", testMode ? "left-[18px]" : "left-0.5")} /></span>Test mode</button>
      </div>

      {/* outcome chip filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", filter === "all" ? "border-caramel bg-caramel/10 text-caramel" : "border-foam bg-card text-muted-foreground hover:border-latte")}>All <span className="tabular-nums">{calls.length}</span></button>
        {bucketOrder.map((b) => (
          <button key={b} onClick={() => setFilter(filter === b ? "all" : b)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium", filter === b ? "border-caramel bg-caramel/10 text-caramel" : "border-foam bg-card text-muted-foreground hover:border-latte")}>
            <span className="size-2 rounded-full" style={{ backgroundColor: bucketMeta[b].color }} /> {bucketMeta[b].label} <span className="tabular-nums">{counts[b]}</span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Call outcome</TableHead>
              <TableHead>Business outcome</TableHead>
              <TableHead className="text-right">Pre score</TableHead>
              <TableHead className="text-right">After call</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => {
              const b = bucketOf(c.disposition);
              const pre = preScore(c.id);
              const after = Math.max(0, Math.min(100, pre + (b === "reached" ? 14 : b === "callback" ? 6 : b === "dropped" ? -8 : -3)));
              const open = expanded === c.id;
              return (
                <Fragment key={c.id}>
                  <TableRow onClick={() => setExpanded(open ? null : c.id)} className="cursor-pointer">
                    <TableCell>{open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}</TableCell>
                    <TableCell><div className="font-medium text-coffee">{c.lead_name}</div><div className="text-xs text-muted-foreground">{c.lead_phone}</div></TableCell>
                    <TableCell><span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", bucketMeta[b].badge)}>{c.disposition_label || titleCase(c.disposition)}</span></TableCell>
                    <TableCell className="text-muted-foreground">{c.disposition_category ? titleCase(c.disposition_category) : "—"}</TableCell>
                    <TableCell className="text-right font-data tabular-nums text-muted-foreground">{pre}</TableCell>
                    <TableCell className="text-right font-data tabular-nums text-coffee">{after}<span className={cn("ml-1 text-[10px]", after >= pre ? "text-success" : "text-danger")}>{after >= pre ? "▲" : "▼"}</span></TableCell>
                    <TableCell className="text-right tabular-nums">{formatDuration(c.duration_seconds)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatDateTime(c.initiated_at)}</TableCell>
                  </TableRow>
                  {open && (() => {
                    const summaryLine = b === "reached" ? `${c.lead_name} engaged on the call — ${c.disposition_label || titleCase(c.disposition)}. ${c.next_action ? titleCase(c.next_action) + " queued." : "No further action."}`
                      : b === "callback" ? `${c.lead_name} asked to be called back later.`
                      : b === "dropped" ? `Call with ${c.lead_name} dropped before completing.`
                      : `Couldn't connect to ${c.lead_name}.`;
                    const snippet = [
                      { who: "agent", text: "नमस्ते, मैं Blostem से Aria बोल रही हूँ। क्या अभी बात कर सकते हैं?" },
                      { who: "lead", text: b === "reached" ? "Haan, boliye." : b === "callback" ? "Abhi busy hoon, baad mein call karna." : "…" },
                      { who: "agent", text: b === "reached" ? "धन्यवाद! मैं details अभी भेज देती हूँ।" : "कोई बात नहीं, मैं callback schedule कर देती हूँ।" },
                    ];
                    const Fact = ({ k, v }: { k: string; v: React.ReactNode }) => <div><div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div><div className="mt-0.5 text-sm font-medium text-coffee">{v}</div></div>;
                    return (
                    <TableRow className="bg-oat/30 hover:bg-oat/30">
                      <TableCell></TableCell>
                      <TableCell colSpan={7} className="py-0">
                        <div className="grid grid-cols-1 gap-5 py-4 lg:grid-cols-[1.3fr_1fr]">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-mocha">Call summary</div>
                            <p className="mt-1 text-sm text-coffee/90">{summaryLine}</p>
                            <div className="mt-3 grid grid-cols-3 gap-x-6 gap-y-3">
                              <Fact k="Business outcome" v={c.disposition_category ? titleCase(c.disposition_category) : "—"} />
                              <Fact k="Pre → After" v={<span>{pre} → {after} <span className={cn("text-[10px]", after >= pre ? "text-success" : "text-danger")}>{after >= pre ? "▲" : "▼"}{Math.abs(after - pre)}</span></span>} />
                              <Fact k="Duration" v={formatDuration(c.duration_seconds)} />
                              <Fact k="Next action" v={c.next_action ? titleCase(c.next_action) : "—"} />
                              <Fact k="When" v={formatDateTime(c.initiated_at)} />
                              <Fact k="Call ID" v={<span className="font-data text-xs">{c.id.slice(0, 8)}</span>} />
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <button onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-card px-3 py-1.5 text-xs font-medium text-mocha hover:border-caramel"><Play className="size-3.5 text-caramel" /> Play recording</button>
                              <button onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-card px-3 py-1.5 text-xs font-medium text-mocha hover:border-caramel"><FileText className="size-3.5" /> Full transcript</button>
                              <button onClick={(e) => { e.stopPropagation(); router.push("/handoff"); }} className="inline-flex items-center gap-1.5 rounded-full bg-coffee px-3 py-1.5 text-xs font-medium text-cream hover:bg-espresso"><Headset className="size-3.5" /> Open in handoff</button>
                            </div>
                          </div>
                          <div className="rounded-xl border border-foam bg-card p-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground"><Play className="size-3.5" /></span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full w-1/4 rounded-full bg-gradient-to-r from-mocha to-caramel" /></div>
                              <span className="font-data text-[11px] text-muted-foreground">{formatDuration(c.duration_seconds)}</span>
                              <Volume2 className="size-3.5 text-muted-foreground" />
                            </div>
                            <div className="mt-3 space-y-1.5">
                              {snippet.map((m, k) => <div key={k} className={cn("max-w-[90%] rounded-xl px-2.5 py-1.5 text-xs", m.who === "agent" ? "bg-oat/60 text-coffee" : "ml-auto bg-caramel/15 text-coffee")}>{m.text}</div>)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ); })()}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
        {rows.length === 0 && <EmptyState icon={PhoneOff} title="No calls found" hint="Calls will appear here once campaigns start running." />}
      </div>
    </div>
  );
}
