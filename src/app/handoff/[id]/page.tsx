"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, RotateCw, Tag, Pin, Play, Volume2, MoreHorizontal, FileText, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { handoffCalls } from "@/lib/handoff-mock";
import { formatDuration } from "@/lib/format";

const band = { hot: "text-orange-600", warm: "text-amber-600", cold: "text-stone-500" };
const statusTone: Record<string, string> = { Completed: "bg-success/12 text-success", Transferred: "bg-info/12 text-info", Callback: "bg-warning/12 text-warning" };
const Card = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
    <div className="mb-2.5 flex items-center justify-between"><h3 className="text-xs font-semibold uppercase tracking-wider text-mocha">{title}</h3>{action}</div>
    {children}
  </div>
);

export default function HandoffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const c = handoffCalls.find((x) => x.id === String(params.id)) ?? handoffCalls[0];
  const [note, setNote] = useState("");
  const [pin, setPin] = useState(false);

  return (
    <div className="mx-auto max-w-7xl">
      <button onClick={() => router.push("/handoff")} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to queue</button>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-semibold text-coffee">{c.name}</h1>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusTone[c.status])}>{c.status}</span>
          </div>
          <div className="mt-0.5 text-sm text-muted-foreground">{c.phone} · {c.email}</div>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <div><div className="text-[11px] uppercase text-muted-foreground">Score</div><div className={cn("font-data text-lg font-semibold", band[c.band])}>{c.score}</div></div>
          <div><div className="text-[11px] uppercase text-muted-foreground">Duration</div><div className="font-data text-lg font-semibold text-coffee">{formatDuration(c.durationSec)}</div></div>
          <div><div className="text-[11px] uppercase text-muted-foreground">Campaign</div><div className="max-w-[180px] truncate text-sm font-medium text-coffee">{c.campaign}</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr_1fr]">
        {/* LEFT */}
        <div className="space-y-4">
          <Card title="Conversation summary" action={<button onClick={() => toast({ title: "Regenerating…", body: "Re-summarising the call.", severity: "info" })} className="inline-flex items-center gap-1 text-xs text-caramel hover:text-mocha"><RotateCw className="size-3" /> Regenerate</button>}>
            <p className="text-sm leading-relaxed text-coffee/90">{c.summary}</p>
            {c.lowConfidence && <p className="mt-2 rounded-lg bg-warning/10 px-2 py-1 text-[11px] text-warning">Low-confidence — recommend manual review.</p>}
          </Card>
          <Card title="Concerns flagged" action={<button onClick={() => toast({ title: "Re-tag", body: "Adjust the flagged concerns.", severity: "info" })} className="inline-flex items-center gap-1 text-xs text-caramel hover:text-mocha"><Tag className="size-3" /> Re-tag</button>}>
            <div className="flex flex-wrap gap-1.5">{c.concerns.map((t) => <span key={t} className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-danger">{t}</span>)}</div>
          </Card>
          <Card title={`Notes`} action={<button onClick={() => setPin((v) => !v)} className={cn("inline-flex items-center gap-1 text-xs", pin ? "text-caramel" : "text-muted-foreground hover:text-coffee")}><Pin className="size-3" /> Pin to top</button>}>
            <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 4000))} placeholder="What did you tell the customer? Any next steps?" className="h-24 w-full rounded-lg border border-foam bg-card p-2.5 text-sm text-coffee outline-none focus:border-caramel" />
            <div className="mt-2 flex items-center justify-between"><span className="text-[11px] text-muted-foreground">{note.length}/4000</span><Button size="sm" onClick={() => toast({ title: "Note saved", body: "", severity: "success" })} className="bg-brand text-brand-foreground hover:bg-brand-dark">Save note</Button></div>
          </Card>
        </div>

        {/* CENTER — transcript */}
        <Card title="Conversation" action={<span className="inline-flex items-center gap-1 text-[11px] text-success"><span className="size-1.5 rounded-full bg-success" /> Live</span>}>
          <div className="space-y-2.5">
            {c.transcript.map((m, i) => (
              <div key={i} className={cn("max-w-[88%] rounded-2xl px-3 py-2 text-sm", m.who === "agent" ? "bg-card text-coffee" : "ml-auto bg-caramel/15 text-coffee")}>
                <div className="mb-0.5 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">{m.who === "agent" ? "Agent" : "Customer"}</div>
                {m.text}
              </div>
            ))}
          </div>
        </Card>

        {/* RIGHT */}
        <div className="space-y-4">
          <Card title="Call recording">
            <div className="rounded-xl border border-foam bg-card p-3">
              <div className="flex items-center gap-3">
                <button onClick={() => toast({ title: "Playing recording", body: "", severity: "info" })} className="flex size-9 items-center justify-center rounded-full bg-brand text-brand-foreground"><Play className="size-4" /></button>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full w-1/3 rounded-full bg-gradient-to-r from-mocha to-caramel" /></div>
                <span className="font-data text-xs text-muted-foreground">{formatDuration(c.durationSec)}</span>
                <Volume2 className="size-4 text-muted-foreground" />
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </div>
            </div>
          </Card>
          <Card title="Collected information">
            <ul className="space-y-1.5">
              {c.collected.map((kv) => <li key={kv.k} className="flex items-center justify-between border-b border-foam py-1.5 text-sm last:border-0"><span className="text-muted-foreground">{kv.k}</span><span className="font-medium text-coffee">{kv.v}</span></li>)}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
