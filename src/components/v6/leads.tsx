"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, Search, ChevronDown, Flame, Thermometer, Snowflake, X, Users, Download, Phone, PhoneOff } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { SetupGuideButton } from "@/components/setup-guide/setup-guide";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { EmptyState } from "@/components/ui-bits/empty-state";
import { leads as rawLeads, campaigns } from "@/lib/data";
import { titleCase } from "@/lib/format";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Band = "hot" | "warm" | "cold";
const bandOf = (s: number): Band => (s >= 70 ? "hot" : s >= 40 ? "warm" : "cold");
const campaignNames = campaigns.map((c) => c.name);

// enrich derived leads with a campaign + 0–100 score
const leads = rawLeads.map((l, i) => {
  const score = l.score != null ? Math.round(l.score * 10) : (i * 37) % 100;
  return { ...l, idx: i, campaign: campaignNames[i % campaignNames.length] ?? "Unassigned", score, band: bandOf(score) };
});

function Dropdown({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-xl border border-foam bg-card px-3 py-2 text-sm hover:bg-accent/40">
        <span className="text-muted-foreground">{label}:</span>
        <span className="max-w-[220px] truncate font-medium text-coffee">{value}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 max-h-72 w-72 overflow-y-auto rounded-xl border border-foam bg-porcelain p-1 shadow-card-lg">
            {options.map((o) => (
              <button key={o} onClick={() => { onChange(o); setOpen(false); }}
                className={cn("block w-full truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-oat/70", o === value ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-coffee")}>
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AddLeadsModal({ defaultCampaign, onClose }: { defaultCampaign: string; onClose: () => void }) {
  const [campaign, setCampaign] = useState(defaultCampaign === "All campaigns" ? campaignNames[0] : defaultCampaign);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-espresso/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-foam bg-porcelain p-5 shadow-card-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-coffee">Add leads</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-coffee"><X className="size-4" /></button>
        </div>
        <label className="text-sm font-medium text-coffee">Add to campaign</label>
        <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="mt-1.5 mb-4 w-full rounded-lg border border-foam bg-card px-3 py-2 text-sm text-coffee outline-none focus:border-caramel">
          {campaignNames.map((n) => <option key={n}>{n}</option>)}
        </select>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-latte/60 bg-oat/30 px-6 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-card text-caramel"><Upload className="size-5" /></span>
          <p className="text-sm font-medium text-coffee">Drop a CSV, or click to browse</p>
          <p className="text-xs text-muted-foreground">Columns auto-map to the campaign&apos;s lead schema.</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="text-mocha">Cancel</Button>
          <Button onClick={() => { toast({ title: "Leads imported", body: `Queued for “${campaign}”.`, severity: "success" }); onClose(); }} className="bg-caramel text-cream hover:bg-mocha">Import</Button>
        </div>
      </div>
    </div>
  );
}

const BAND_STYLE: Record<Band, { label: string; Icon: typeof Flame; tint: string; iconCls: string }> = {
  hot: { label: "Hot", Icon: Flame, tint: "border-orange-300 bg-orange-50 text-orange-700", iconCls: "text-orange-500 flicker" },
  warm: { label: "Warm", Icon: Thermometer, tint: "border-amber-300 bg-amber-50 text-amber-700", iconCls: "text-amber-500 bob" },
  cold: { label: "Cold", Icon: Snowflake, tint: "border-sky-300 bg-sky-50 text-sky-700", iconCls: "text-sky-500 twinkle" },
};

const currentScore = (score: number, calls: number, b: Band) => calls === 0 ? score : Math.max(0, Math.min(100, score + (b === "hot" ? 9 : b === "cold" ? -6 : 3)));

export function V6Leads() {
  const router = useRouter();
  const [campaign, setCampaign] = useState("All campaigns");
  const [band, setBand] = useState<Band | "all">("all");
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [onlyNotCalled, setOnlyNotCalled] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const scoped = useMemo(() => leads.filter((l) => campaign === "All campaigns" || l.campaign === campaign), [campaign]);
  const counts = useMemo(() => ({
    hot: scoped.filter((l) => l.band === "hot").length,
    warm: scoped.filter((l) => l.band === "warm").length,
    cold: scoped.filter((l) => l.band === "cold").length,
    notCalled: scoped.filter((l) => l.calls === 0).length,
  }), [scoped]);

  const rows = scoped.filter((l) => (band === "all" || l.band === band) && (!onlyNotCalled || l.calls === 0) && (!q || l.name.toLowerCase().includes(q.toLowerCase()) || l.phone.includes(q)));
  const toggleSel = (k: string) => setSelected((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const allSelected = rows.length > 0 && rows.every((l) => selected.has(l.phone));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((l) => l.phone)));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Leads"
        subtitle={`${scoped.length} leads${campaign !== "All campaigns" ? ` in ${campaign}` : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Dropdown label="Campaign" value={campaign} options={["All campaigns", ...campaignNames]} onChange={(v) => setCampaign(v)} />
            <button onClick={() => setTestMode((v) => !v)} className="flex items-center gap-2 rounded-xl border border-foam bg-card px-3 py-2 text-sm text-mocha"><span className={cn("relative h-5 w-9 rounded-full transition-colors", testMode ? "bg-success" : "bg-foam")}><span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-all", testMode ? "left-[18px]" : "left-0.5")} /></span>Test mode</button>
            <Button variant="outline" onClick={() => toast({ title: "Export", body: "Leads exporting as CSV…", severity: "info" })} className="gap-1.5 text-mocha"><Download className="size-4" /> Export</Button>
            <Button onClick={() => setModal(true)} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Add leads</Button>
          </div>
        }
      />

      {/* band filter chips */}
      <div data-tour="leads-filters" className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setBand("all")} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", band === "all" ? "border-caramel bg-sidebar-accent text-brand" : "border-foam bg-card text-muted-foreground")}>
          All <span className="tabular-nums">{scoped.length}</span>
        </button>
        {(["hot", "warm", "cold"] as Band[]).map((k) => {
          const s = BAND_STYLE[k];
          const Icon = s.Icon;
          const active = band === k;
          return (
            <button key={k} onClick={() => setBand(active ? "all" : k)}
              className={cn("relative flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all", s.tint, k === "hot" && "heat-glow", active && "ring-2 ring-offset-1 ring-caramel/50")}>
              <span className="relative inline-flex">
                {k === "hot" && (
                  <svg className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-orange-400" width="14" height="10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
                    <path className="steam-wisp" d="M4 9c-2-3 1-4 0-7" />
                    <path className="steam-wisp" d="M10 9c2-3 -1-4 0-7" />
                  </svg>
                )}
                <Icon className={cn("size-4", s.iconCls)} />
              </span>
              {s.label} <span className="tabular-nums">{counts[k]}</span>
            </button>
          );
        })}
        <button onClick={() => setOnlyNotCalled((v) => !v)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium", onlyNotCalled ? "border-caramel bg-caramel/10 text-caramel" : "border-foam bg-card text-muted-foreground hover:border-latte")}>
          <PhoneOff className="size-3.5" /> Not called yet <span className="tabular-nums">{counts.notCalled}</span>
        </button>
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone…" className="w-56 rounded-xl border border-foam bg-card py-2 pl-8 pr-3 text-sm text-coffee outline-none focus:border-caramel" />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-caramel/40 bg-caramel/8 px-4 py-2.5 text-sm">
          <span className="font-medium text-coffee">{selected.size} selected</span>
          <Button size="sm" onClick={() => toast({ title: "Calling selected", body: `${selected.size} leads queued to dial.`, severity: "success" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Phone className="size-3.5" /> Call</Button>
          <Button size="sm" variant="outline" onClick={() => toast({ title: "Export", body: `${selected.size} leads exporting…`, severity: "info" })} className="gap-1.5 text-mocha"><Download className="size-3.5" /> Export</Button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-coffee">Clear</button>
        </div>
      )}

      <div data-tour="leads-table" className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-caramel" /></TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Band</TableHead>
              <TableHead className="text-right">Pre score</TableHead>
              <TableHead className="text-right">Current score</TableHead>
              <TableHead className="text-right">Calls</TableHead>
              <TableHead>Last disposition</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((l, i) => {
              const cur = currentScore(l.score, l.calls, l.band);
              return (
              <TableRow key={i} className={cn(selected.has(l.phone) && "bg-oat/40")}>
                <TableCell><input type="checkbox" checked={selected.has(l.phone)} onChange={() => toggleSel(l.phone)} className="accent-caramel" /></TableCell>
                <TableCell><button onClick={() => router.push(`/leads/${l.idx}`)} className="font-medium text-coffee hover:text-caramel hover:underline">{l.name}</button><div className="text-xs text-muted-foreground">{l.phone}</div></TableCell>
                <TableCell className="text-muted-foreground">{l.campaign}</TableCell>
                <TableCell><StatusBadge value={l.band} /></TableCell>
                <TableCell className="text-right font-data tabular-nums text-muted-foreground">{l.score}</TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto flex w-28 items-center justify-end gap-1.5">
                    <span className="font-data text-xs tabular-nums text-coffee">{cur}</span>
                    {l.calls > 0 && <span className={cn("text-[10px]", cur >= l.score ? "text-success" : "text-danger")}>{cur >= l.score ? "▲" : "▼"}</span>}
                    <span className="text-[10px] text-muted-foreground">{l.calls > 0 ? `after ${l.calls}` : "—"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">{l.calls}</TableCell>
                <TableCell className="text-muted-foreground">{titleCase(l.lastDisposition)}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => toast({ title: "Calling", body: `Dialing ${l.name}…`, severity: "success" })} className="gap-1.5 text-mocha"><Phone className="size-3.5" /> Call</Button></TableCell>
              </TableRow>
            );})}
          </TableBody>
        </Table>
        {rows.length === 0 && <EmptyState icon={Users} title="No leads match" hint="Try a different band, campaign, or search." />}
      </div>

      {modal && <AddLeadsModal defaultCampaign={campaign} onClose={() => setModal(false)} />}
    </div>
  );
}
