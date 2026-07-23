"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Phone, User, Mail, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { toast } from "@/components/notifications/toaster";
import { leads as rawLeads, campaigns } from "@/lib/data";
import { titleCase } from "@/lib/format";

const bandOf = (s: number) => (s >= 70 ? "hot" : s >= 40 ? "warm" : "cold");
// synthesized lead-data fields for the detail view (schema columns)
const leadData = (name: string) => [
  ["Dob", "14 Aug 1991"], ["Father Name", "Suresh " + name.split(" ").slice(-1)[0]], ["Mother Name", "Kavita"],
  ["Company Name", "Infosys Ltd"], ["Employer", "Salaried"], ["Loan Amount", "₹3,50,000"],
  ["Loan Purpose", "Debt consolidation"], ["City", "Pune"], ["Spouse Name", "—"],
  ["Ref One Name", "Amit Verma"], ["Ref Two Name", "Pooja Shah"],
];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idx = Math.max(0, Math.min(rawLeads.length - 1, parseInt(String(params.id)) || 0));
  const l = rawLeads[idx];
  const pre = l.score != null ? Math.round(l.score * 10) : (idx * 37) % 100;
  const band = bandOf(pre);
  const current = l.calls > 0 ? Math.max(0, Math.min(100, pre + (band === "hot" ? 9 : band === "cold" ? -6 : 3))) : pre;
  const campaign = campaigns[idx % campaigns.length]?.name ?? "Unassigned";

  const Stat = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div><div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div><div className="mt-0.5 font-data text-lg font-semibold text-coffee">{v}</div></div>
  );
  const Card = ({ title, icon: Icon, rows }: { title: string; icon: typeof User; rows: [string, string][] }) => (
    <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mocha"><Icon className="size-3.5" /> {title}</div>
      <div className="space-y-0.5">{rows.map(([k, v]) => <div key={k} className="flex items-center justify-between border-b border-foam py-2 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium text-coffee">{v}</span></div>)}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <button onClick={() => router.push("/leads")} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Leads</button>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-coffee">{l.name}</h1>
          <div className="mt-0.5 text-sm text-muted-foreground">{l.phone} · {(l.name || "lead").toLowerCase().replace(/\s+/g, ".")}@example.com</div>
        </div>
        <Button onClick={() => toast({ title: "Calling", body: `Dialing ${l.name}…`, severity: "success" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Phone className="size-4" /> Call</Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass sm:grid-cols-5">
        <Stat k="Disposition" v={<StatusBadge value={band} />} />
        <Stat k="Pre score" v={pre} />
        <Stat k="Current score" v={current} />
        <Stat k="Calls made" v={l.calls} />
        <Stat k="Last called" v={l.calls > 0 ? "Today" : "—"} />
      </div>
      <div className="mb-5 flex flex-wrap gap-x-6 gap-y-1 rounded-xl border border-foam bg-oat/30 px-4 py-2.5 text-sm">
        <span className="text-muted-foreground">Status: <span className="text-coffee">{l.calls >= 6 ? "exhausted" : "active"}</span></span>
        <span className="text-muted-foreground">Source: <span className="text-coffee">file_upload</span></span>
        <span className="text-muted-foreground">Campaign: <span className="text-coffee">{campaign}</span></span>
        <span className="text-muted-foreground">Last result: <span className="text-coffee">{titleCase(l.lastDisposition)}</span></span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Fixed fields" icon={User} rows={[["Full Name", l.name], ["Phone", l.phone], ["Email", `${(l.name || "lead").toLowerCase().replace(/\s+/g, ".")}@example.com`]]} />
        <Card title="Lead data" icon={Hash} rows={leadData(l.name) as [string, string][]} />
      </div>
    </div>
  );
}
