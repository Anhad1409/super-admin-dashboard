"use client";

/* v7 Leads — temperature bands as chips, latte-art initial avatars, score
   meters, hover-reveal Call. Same data as the live page. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Upload, Flame, Thermometer, Snowflake, Phone, ChevronDown } from "lucide-react";
import { toast } from "@/components/notifications/toaster";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { leads as rawLeads, campaigns } from "@/lib/data";
import { titleCase } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { V7Banner, Chip, SearchPill, SectionCard, Meter, InitialBean, monoLabel, rowStagger, rowItem } from "./kit";

type Band = "hot" | "warm" | "cold";
const bandOf = (s: number): Band => (s >= 70 ? "hot" : s >= 40 ? "warm" : "cold");
const campaignNames = campaigns.map((c) => c.name);

// same enrichment as the live /leads page — campaign + 0–100 score
const leads = rawLeads.map((l, i) => {
  const score = l.score != null ? Math.round(l.score * 10) : (i * 37) % 100;
  return { ...l, idx: i, campaign: campaignNames[i % campaignNames.length] ?? "Unassigned", score, band: bandOf(score) };
});

const bandMeta: Record<Band, { label: string; icon: React.ReactNode; dot: string; meter: string; pill: string }> = {
  hot: { label: "Hot", icon: <Flame className="size-3.5" />, dot: "var(--color-danger)", meter: "var(--color-danger)", pill: "bg-danger/10 text-danger border-danger/25" },
  warm: { label: "Warm", icon: <Thermometer className="size-3.5" />, dot: "var(--color-caramel)", meter: "var(--color-caramel)", pill: "bg-caramel/12 text-caramel border-caramel/30" },
  cold: { label: "Cold", icon: <Snowflake className="size-3.5" />, dot: "var(--color-steam)", meter: "var(--color-steam)", pill: "bg-steam/10 text-steam border-steam/25" },
};

export function V7Leads() {
  const router = useRouter();
  const [band, setBand] = useState<Band | "all">("all");
  const [campaign, setCampaign] = useState("All campaigns");
  const [q, setQ] = useState("");
  const [campOpen, setCampOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Band, number> = { hot: 0, warm: 0, cold: 0 };
    for (const l of leads) c[l.band] += 1;
    return c;
  }, []);

  const rows = leads.filter((l) => {
    if (band !== "all" && l.band !== band) return false;
    if (campaign !== "All campaigns" && l.campaign !== campaign) return false;
    if (q && !(`${l.name} ${l.phone}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl">
      <V7Banner
        eyebrow="Overview"
        title="Leads"
        subtitle={<><span className="font-medium text-coffee">{leads.length} leads</span> — ranked by score.</>}
        stats={[
          { label: "Hot", value: <span className="text-danger">{counts.hot}</span> },
          { label: "Warm", value: <span className="text-caramel">{counts.warm}</span> },
          { label: "Cold", value: <span className="text-steam">{counts.cold}</span> },
        ]}
        actions={
          <>
            <Button size="sm" onClick={() => toast({ title: "Add leads", body: "Opens the add-leads form.", severity: "info" })}
              className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark"><Plus className="size-4" /> Add leads</Button>
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Import CSV", body: "Opens the CSV import wizard.", severity: "info" })}
              className="gap-1.5 border-foam bg-porcelain text-mocha hover:text-coffee"><Upload className="size-4" /> Import</Button>
          </>
        }
      />

      {/* filters: bands as chips + campaign + search */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Chip active={band === "all"} onClick={() => setBand("all")} dot="var(--color-caramel)" count={leads.length}>All</Chip>
        {(Object.keys(bandMeta) as Band[]).map((b) => (
          <Chip key={b} active={band === b} onClick={() => setBand(band === b ? "all" : b)} icon={bandMeta[b].icon} count={counts[b]}>
            {bandMeta[b].label}
          </Chip>
        ))}

        <div className="relative ml-auto">
          <button onClick={() => setCampOpen((o) => !o)}
            className="flex h-8 items-center gap-2 rounded-full border border-foam bg-porcelain px-3 text-[12px] shadow-glass hover:border-latte">
            <span className="text-latte">Campaign:</span>
            <span className="max-w-[180px] truncate font-medium text-coffee">{campaign}</span>
            <ChevronDown className="size-3.5 text-latte" />
          </button>
          {campOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCampOpen(false)} />
              <div className="absolute right-0 z-50 mt-1 max-h-72 w-72 overflow-y-auto rounded-xl border border-foam bg-porcelain p-1 shadow-card-lg">
                {["All campaigns", ...campaignNames].map((o) => (
                  <button key={o} onClick={() => { setCampaign(o); setCampOpen(false); }}
                    className={cn("block w-full truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-oat/70", o === campaign ? "bg-oat text-coffee" : "text-coffee")}>{o}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <SearchPill value={q} onChange={setQ} placeholder="Search name or phone…" className="w-60" />
      </div>

      <SectionCard title="All leads" count={`${rows.length} of ${leads.length}`}
        help="Score is 0–100 from call outcomes. Hot ≥ 70, warm ≥ 40.">
        <div className={cn("hidden grid-cols-[minmax(0,2.1fr)_minmax(0,1.4fr)_150px_72px_minmax(0,1.2fr)_96px] gap-3 border-b border-foam px-4 py-1.5 lg:grid", monoLabel)}>
          <span>Lead</span><span>Campaign</span><span>Score</span><span className="text-right">Calls</span><span>Last outcome</span><span />
        </div>

        <motion.ul variants={rowStagger} initial="hidden" animate="show">
          {rows.map((l) => {
            const meta = bandMeta[l.band];
            return (
              <motion.li key={l.idx} variants={rowItem}
                onClick={() => router.push(`/leads/${l.idx}`)}
                className="group grid cursor-pointer grid-cols-1 gap-2 border-b border-foam/70 px-4 py-2 transition-colors last:border-b-0 hover:bg-oat/40 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.4fr)_150px_72px_minmax(0,1.2fr)_96px] lg:items-center lg:gap-3">
                {/* who */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <InitialBean name={l.name} band={l.band} />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-coffee transition-colors group-hover:text-brand-dark">{titleCase(l.name)}</div>
                    <div className="font-[family-name:var(--font-data)] text-[11px] text-latte">{l.phone}</div>
                  </div>
                </div>

                {/* campaign */}
                <div className="truncate text-[13px] text-mocha">{l.campaign}</div>

                {/* score: pill + meter + number */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", meta.pill)}>
                      {meta.icon}{meta.label}
                    </span>
                    <span className="font-[family-name:var(--font-data)] text-[11px] text-mocha tabular-nums">{l.score}</span>
                  </div>
                  <Meter pct={l.score} color={meta.meter} className="mt-1.5 w-[120px]" />
                </div>

                {/* calls */}
                <div className="text-right font-[family-name:var(--font-data)] text-[13px] text-coffee tabular-nums">{l.calls}</div>

                {/* last outcome */}
                <div className="min-w-0"><StatusBadge value={l.lastDisposition} /></div>

                {/* call */}
                <div className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" onClick={() => toast({ title: "Calling…", body: `Dialing ${titleCase(l.name)} (${l.phone}).`, severity: "info" })}
                    className="gap-1.5 bg-brand text-brand-foreground opacity-0 shadow-cta transition-opacity hover:bg-brand-dark group-hover:opacity-100 max-lg:opacity-100">
                    <Phone className="size-3.5" /> Call
                  </Button>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Snowflake className="size-5 text-steam" />
            <p className="font-serif text-lg text-coffee">No leads match these filters</p>
            <p className="text-sm text-mocha">Loosen the filters or add new leads.</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
