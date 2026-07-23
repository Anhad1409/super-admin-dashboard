"use client";

/* v7 Campaigns — same actions as v6, re-skinned in the dashboard language:
   warm banner, chip filters, rich porcelain rows. Rows and banner stats read
   the derived layer so they reconcile with the v7 dashboard. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, SlidersHorizontal, MoreHorizontal, Pencil, ChevronRight } from "lucide-react";
import { toast } from "@/components/notifications/toaster";
import { BeanDot, LiveDot } from "@/components/coffee/bean-dot";
import { MiniSpark } from "@/components/ui-bits/mini-spark";
import { timeSeries } from "@/lib/data";
import { worldCampaigns, activeCampaigns, rangeMetrics } from "@/lib/derived";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { V7Banner, Chip, SearchPill, SectionCard, Meter, Equalizer, monoLabel, rowStagger, rowItem } from "./kit";

const STATUS = ["all", "draft", "active", "paused", "completed"] as const;
type Status = (typeof STATUS)[number];

const statusDot: Record<string, string> = {
  draft: "var(--color-latte)", active: "var(--color-success)",
  paused: "var(--color-warning)", completed: "var(--color-mocha)",
};
const statusPill: Record<string, string> = {
  draft: "bg-oat/80 text-mocha border-foam",
  active: "bg-success/12 text-success border-success/25",
  paused: "bg-warning/12 text-warning border-warning/25",
  completed: "bg-foam/60 text-mocha border-foam",
};

// deterministic per-campaign sparkline seeded off the id (mock cosmetics)
const sparkFor = (id: string) =>
  Array.from({ length: 10 }, (_, i) => 4 + ((id.charCodeAt(i % id.length) * (i + 3)) % 9));

export function V7Campaigns() {
  const router = useRouter();
  const [tab, setTab] = useState<Status>("all");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: worldCampaigns.length };
    for (const s of STATUS.slice(1)) c[s] = worldCampaigns.filter((x) => x.status === s).length;
    return c;
  }, []);

  const rows = worldCampaigns
    .filter((c) => tab === "all" || c.status === tab)
    .filter((c) => !q || `${c.name} ${c.agent_name}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (newestFirst ? 1 : -1) * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  const active = activeCampaigns.length;
  const called = worldCampaigns.reduce((s, c) => s + c.leads_called, 0);
  const converted = worldCampaigns.reduce((s, c) => s + c.leads_converted, 0);
  const convPct = called ? ((converted / called) * 100).toFixed(1) : "0.0";
  const week = rangeMetrics(7);

  return (
    <div className="mx-auto max-w-7xl">
      <V7Banner
        eyebrow="Overview"
        title="Campaigns"
        subtitle={<>{worldCampaigns.length} campaigns — <span className="font-medium text-coffee">{active} active</span> now.</>}
        stats={[
          { label: "Active now", value: <span className="flex items-center gap-2">{active} {active > 0 && <LiveDot />}</span> },
          { label: "Calls · 7 days", value: week.calls.toLocaleString(), spark: timeSeries.map((p) => p.calls) },
          { label: "Conversion", value: `${convPct}%`, spark: timeSeries.map((p) => p.conversions), color: "var(--color-steam)" },
        ]}
        actions={
          <>
            <Button size="sm" onClick={() => router.push("/campaigns/quick")} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">
              <Plus className="size-4" /> Quick Campaign
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/campaigns/new")} className="gap-1.5 border-foam bg-porcelain text-mocha hover:text-coffee">
              <SlidersHorizontal className="size-4" /> Advanced
            </Button>
          </>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {STATUS.map((s) => (
          <Chip key={s} active={tab === s} onClick={() => setTab(s)}
            dot={s === "all" ? "var(--color-caramel)" : statusDot[s]} count={counts[s] ?? 0}>
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
          </Chip>
        ))}
        <SearchPill value={q} onChange={setQ} placeholder="Search campaigns…" className="ml-auto w-64" />
      </div>

      <SectionCard title="All campaigns" count={`${rows.length} campaign${rows.length === 1 ? "" : "s"}`}
        help="Progress is leads called out of total. Click a row to open the campaign.">
        {/* column labels */}
        <div className={cn("hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_92px_88px_110px_96px_68px] gap-3 border-b border-foam px-4 py-1.5 lg:grid", monoLabel)}>
          <span>Campaign</span><span>Progress</span><span className="text-right">Conv.</span>
          <span className="text-right">7-day</span><span>Status</span>
          <button onClick={() => setNewestFirst((v) => !v)} title="Sort by created date"
            className="flex items-center justify-end gap-1 text-right uppercase tracking-[0.14em] text-mocha transition-colors hover:text-coffee">
            Created <span className="text-caramel">{newestFirst ? "↓" : "↑"}</span>
          </button><span />
        </div>

        <motion.ul variants={rowStagger} initial="hidden" animate="show">
          {rows.map((c) => {
            const progressPct = c.total_leads > 0 ? (c.leads_called / c.total_leads) * 100 : 0;
            const conv = c.leads_called > 0 ? ((c.leads_converted / c.leads_called) * 100).toFixed(1) : "0.0";
            const live = c.status === "active";
            return (
              <motion.li key={c.id} variants={rowItem}
                onClick={() => router.push(`/campaigns/${c.id}`)}
                className="group grid cursor-pointer grid-cols-1 gap-2 border-b border-foam/70 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-oat/40 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_92px_88px_110px_96px_68px] lg:items-center lg:gap-3">
                {/* campaign */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <BeanDot color={statusDot[c.status] ?? "var(--color-latte)"} className="size-3" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-coffee transition-colors group-hover:text-brand-dark">{c.name}</span>
                      {live && <Equalizer />}
                    </div>
                    <div className="truncate font-[family-name:var(--font-data)] text-[11px] text-latte">
                      {[c.agent_name, c.default_language].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>

                {/* progress */}
                <div>
                  <Meter pct={progressPct} color={live ? "var(--color-caramel)" : "var(--color-latte)"} />
                  <div className="mt-1 font-[family-name:var(--font-data)] text-[11px] text-mocha tabular-nums">
                    {c.leads_called} / {c.total_leads} leads
                  </div>
                </div>

                {/* conversion */}
                <div className="text-right">
                  <span className="font-serif text-[15px] font-semibold text-coffee tabular-nums">{conv}%</span>
                  <div className="font-[family-name:var(--font-data)] text-[10px] text-latte tabular-nums">{c.leads_converted} won</div>
                </div>

                {/* spark */}
                <div className="hidden justify-end lg:flex">
                  <MiniSpark data={sparkFor(c.id)} color={live ? "var(--color-caramel)" : "var(--color-latte)"} w={64} h={22} />
                </div>

                {/* status */}
                <div>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize", statusPill[c.status] ?? statusPill.draft)}>
                    {c.status}
                  </span>
                </div>

                {/* created */}
                <div className="text-right font-[family-name:var(--font-data)] text-[11px] text-latte">{formatDate(c.created_at)}</div>

                {/* actions: edit + menu */}
                <div className="relative flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => router.push(`/campaigns/${c.id}/edit`)} title="Edit campaign" aria-label={`Edit ${c.name}`}
                    className="rounded-lg p-1.5 text-latte transition-colors hover:bg-foam hover:text-coffee">
                    <Pencil className="size-4" />
                  </button>
                  <button onClick={() => setMenuId(menuId === c.id ? null : c.id)} aria-label="More actions"
                    className="rounded-lg p-1.5 text-latte transition-colors hover:bg-foam hover:text-coffee">
                    <MoreHorizontal className="size-4" />
                  </button>
                  {menuId === c.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuId(null)} />
                      <div className="absolute right-0 z-50 mt-1 w-40 rounded-xl border border-foam bg-porcelain p-1 text-left text-sm shadow-card-lg">
                        {[
                          { l: "Open", fn: () => router.push(`/campaigns/${c.id}`) },
                          { l: "Edit", fn: () => router.push(`/campaigns/${c.id}/edit`) },
                          { l: c.status === "active" ? "Pause" : "Activate", fn: () => toast({ title: c.status === "active" ? "Paused" : "Activated", body: `“${c.name}”`, severity: "info" }) },
                          { l: "Duplicate", fn: () => toast({ title: "Campaign duplicated", body: `“${c.name} (Copy)” created as draft.`, severity: "success" }) },
                          { l: "Delete", fn: () => toast({ title: "Delete campaign?", body: "This would remove the campaign.", severity: "warning" }), danger: true },
                        ].map((m) => (
                          <button key={m.l} onClick={() => { setMenuId(null); m.fn(); }}
                            className={cn("block w-full rounded-lg px-3 py-1.5 text-left hover:bg-oat/70", m.danger ? "text-danger" : "text-coffee")}>{m.l}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <BeanDot color="var(--color-latte)" className="size-5" />
            <p className="font-serif text-lg text-coffee">No {tab} campaigns</p>
            <p className="text-sm text-mocha">Create one in about two minutes.</p>
            <Button size="sm" onClick={() => router.push("/campaigns/quick")} className="mt-2 gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">
              <Plus className="size-4" /> New campaign <ChevronRight className="size-3.5" />
            </Button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
