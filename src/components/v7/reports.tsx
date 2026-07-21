"use client";

/* v7 Reports — banner + catalog cards with icon tiles, category chips and
   a spark deco; run/schedule stay as toasts. */

import type { LucideIcon } from "lucide-react";
import { Phone, Megaphone, Filter, Sparkles, Gauge, List, ShieldCheck, Wallet, Download, CalendarClock } from "lucide-react";
import { motion } from "framer-motion";
import { reportsCatalog } from "@/lib/ops-mock";
import { timeSeries } from "@/lib/data";
import { toast } from "@/components/notifications/toaster";
import { MiniSpark } from "@/components/ui-bits/mini-spark";
import { Button } from "@/components/ui/button";
import { V7Banner, monoLabel, rowStagger, rowItem } from "./kit";
import { GlazedTile } from "@/components/settings/glaze";

const icons: Record<string, LucideIcon> = {
  phone: Phone, megaphone: Megaphone, filter: Filter, sparkles: Sparkles,
  gauge: Gauge, list: List, shield: ShieldCheck, wallet: Wallet,
};
const catColor: Record<string, string> = {
  Operations: "var(--color-caramel)", Leads: "var(--color-blueberry)", Quality: "var(--color-matcha)",
  Capacity: "var(--color-mango)", Compliance: "var(--color-danger)", Finance: "var(--color-mocha)",
};

export function V7Reports() {
  const cats = [...new Set(reportsCatalog.map((r) => r.cat))];
  return (
    <div className="mx-auto max-w-7xl">
      <V7Banner
        eyebrow="Overview"
        title="Reports"
        subtitle={<>{reportsCatalog.length} reports — run one now or schedule the morning batch.</>}
        stats={[
          { label: "Reports", value: reportsCatalog.length },
          { label: "Categories", value: cats.length },
          { label: "7-day activity", value: "7d", spark: timeSeries.map((p) => p.calls) },
        ]}
      />

      <motion.div variants={rowStagger} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportsCatalog.map((r, i) => {
          const Icon = icons[r.icon] ?? List;
          const color = catColor[r.cat] ?? "var(--color-caramel)";
          return (
            <motion.div key={r.id} variants={rowItem}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-foam bg-porcelain p-5 shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glass-hover">
              <div className="flex items-start justify-between">
                <GlazedTile icon={Icon} tint={color} size="lg" className="transition-transform group-hover:scale-105" />
                <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
                  style={{ color, borderColor: `color-mix(in srgb, ${color} 30%, transparent)`, background: `color-mix(in srgb, ${color} 8%, transparent)` }}>
                  {r.cat}
                </span>
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold text-coffee">{r.name}</h3>
              <p className="mt-1 flex-1 text-sm text-mocha">{r.desc}</p>
              <div className="mt-3 flex items-end justify-between gap-2 border-t border-foam/70 pt-3">
                <div>
                  <span className={monoLabel}>Last 7 days</span>
                  <MiniSpark data={timeSeries.map((p, j) => p.calls * ((i + j) % 3 ? 1 : 0.6))} color={color} w={72} h={20} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => toast({ title: "Report ready", body: `“${r.name}” generated — downloading CSV.`, severity: "success" })}
                    className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark"><Download className="size-3.5" /> Run</Button>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Scheduled", body: `“${r.name}” will run daily at 8:00 IST.`, severity: "info" })}
                    className="gap-1.5 border-foam text-mocha hover:text-coffee"><CalendarClock className="size-3.5" /> Schedule</Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
