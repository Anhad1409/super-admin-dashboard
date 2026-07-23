"use client";

/* /admin/funnel — the activation funnel: signup → live → paid, with the
   drop-off at each step and the headline conversion metrics. */

import { UserPlus, Rocket, CreditCard, Clock3 } from "lucide-react";
import { CpHeader, StatTile, Card, mono } from "@/components/admin/cp";
import { funnel, funnelStats } from "@/lib/admin-analytics";
import { companyDetail, listDetail } from "@/lib/metric-details";
import { clients, platform, PLAN_META } from "@/lib/clients-mock";

export default function FunnelPage() {
  const top = funnel[0].count;

  const signupsDetail = listDetail(
    "Signups · last 90 days",
    funnel[0].count.toLocaleString("en-IN"),
    "Everyone who created an account in the last 90 days, and how far down the activation funnel each slice got.",
    "By funnel stage",
    funnel.map((s, i) => {
      const kept = i === 0 ? 100 : Math.round((s.count / funnel[i - 1].count) * 100);
      return {
        name: s.label,
        value: s.count.toLocaleString("en-IN"),
        pct: s.count,
        tint: i === 0 ? "var(--color-steam)" : kept >= 70 ? "var(--color-success)" : kept >= 50 ? "var(--color-warning)" : "var(--color-danger)",
        sub: i === 0 ? s.hint : `${kept}% kept from previous · ${s.hint}`,
        flag: i > 0 && kept < 60,
      };
    }),
    [{ label: "All clients", href: "/admin/clients" }],
    "Each stage counts only signups that reached it inside the 90-day window.",
  );

  const activationDetail = listDetail(
    "Activation rate",
    `${funnelStats.activation}%`,
    "Share of the last 90 days' signups that reached their first real customer call — the kept-% at each step shows where activation leaks.",
    "Kept at each step · signup → live",
    funnel.slice(1, 6).map((s, i) => {
      const prev = funnel[i].count;
      const kept = Math.round((s.count / prev) * 100);
      return {
        name: `${funnel[i].label} → ${s.label}`,
        value: `${kept}% kept`,
        pct: kept,
        tint: kept >= 70 ? "var(--color-success)" : kept >= 50 ? "var(--color-warning)" : "var(--color-danger)",
        sub: `−${(prev - s.count).toLocaleString("en-IN")} dropped · ${s.count.toLocaleString("en-IN")} remain`,
        flag: kept < 60,
      };
    }),
    undefined,
    "Biggest leak: heard a sample call → built first campaign — a nudge sequence is the cheapest fix.",
  );

  const trialDetail = companyDetail({
    title: "Trial → paid conversion",
    value: `${funnelStats.trialToPaid}%`,
    description: `${funnel[6].count} trials converted to paid in the window; these are the trials still in flight, ranked by usage — the strongest conversion signal.`,
    of: (c) => c.callsMonth,
    pool: clients.filter((c) => c.status === "trial"),
    includeZero: true,
    sub: (c) => `${PLAN_META[c.plan].label} · health ${c.health} · wallet ₹${c.walletBalance.toLocaleString("en-IN")}`,
    flag: (c) => c.health < 65 || c.walletBalance < 1000,
    label: "Trials in flight · calls this month",
    note: `${platform.trial} trials currently active — low health or an empty wallet usually precedes a lost conversion.`,
    links: [{ label: "All clients", href: "/admin/clients" }],
  });

  // cumulative median days from signup to reach each stage (verified … paid)
  const ttlDays = [0.1, 0.9, 1.6, 2.4, 3.2, 6.8];
  const timeToLiveDetail = listDetail(
    "Median time to live",
    funnelStats.medianTimeToLive,
    "Median days from signup for a new client to reach each activation stage — going live is the headline number.",
    "Median days from signup",
    funnel.slice(1).map((s, i) => ({
      name: s.label,
      value: `${ttlDays[i].toFixed(1)} days`,
      pct: ttlDays[i],
      tint: s.key === "live" ? "var(--color-blueberry)" : "var(--color-mocha)",
      sub: i === 0 ? "from signup" : `+${(ttlDays[i] - ttlDays[i - 1]).toFixed(1)} d after ${funnel[i].label.toLowerCase()}`,
    })),
    undefined,
    "The longest single wait is went live → converted to paid — teams tend to buy only after a week of real calls.",
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <CpHeader title="Activation funnel" subtitle="Where new signups turn into live, paying clients — and where they fall away." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={UserPlus} label="Signups · 90d" value={funnel[0].count} sub="top of funnel" tint="var(--color-steam)" detail={signupsDetail} />
        <StatTile icon={Rocket} label="Activation rate" value={`${funnelStats.activation}%`} sub="signup → live" tint="var(--color-caramel)" detail={activationDetail} />
        <StatTile icon={CreditCard} label="Trial → paid" value={`${funnelStats.trialToPaid}%`} sub="conversion" tint="var(--color-success)" detail={trialDetail} />
        <StatTile icon={Clock3} label="Median time to live" value={funnelStats.medianTimeToLive} sub="from signup" tint="var(--color-blueberry)" detail={timeToLiveDetail} />
      </div>

      <Card title="Funnel" right={<span className={`${mono} text-[11px] text-latte`}>last 90 days</span>}>
        <div className="space-y-2.5">
          {funnel.map((s, i) => {
            const pctOfTop = Math.round((s.count / top) * 100);
            const prev = i === 0 ? s.count : funnel[i - 1].count;
            const stepConv = Math.round((s.count / prev) * 100);
            const dropped = prev - s.count;
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-medium text-coffee">{s.label} <span className="text-latte">· {s.hint}</span></span>
                  <span className="tabular-nums text-mocha">{s.count.toLocaleString("en-IN")} <span className="text-latte">({pctOfTop}%)</span></span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-7 flex-1 overflow-hidden rounded-lg bg-foam">
                    <div className="flex h-full items-center rounded-lg bg-gradient-to-r from-mocha to-caramel pl-2.5" style={{ width: `${Math.max(pctOfTop, 6)}%` }}>
                      {pctOfTop > 12 && <span className="text-[10px] font-semibold text-cream tabular-nums">{s.count.toLocaleString("en-IN")}</span>}
                    </div>
                  </div>
                  {i > 0 && (
                    <span className={`${mono} w-28 shrink-0 text-right text-[10px] uppercase tracking-wide`} style={{ color: stepConv >= 70 ? "var(--color-success)" : stepConv >= 50 ? "var(--color-warning)" : "var(--color-danger)" }}>
                      {stepConv}% kept · −{dropped.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 rounded-lg bg-oat/50 px-3.5 py-2.5 text-[12px] text-mocha">
          Biggest drop-off: <span className="font-semibold text-coffee">Heard a sample call → Built first campaign</span> ({Math.round((funnel[4].count / funnel[3].count) * 100)}% kept). Worth a nudge sequence for clients who tasted but haven&apos;t built.
        </p>
      </Card>
    </div>
  );
}
