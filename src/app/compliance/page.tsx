"use client";

import { GlazedTile } from "@/components/settings/glaze";
import { Fragment, useState } from "react";
import { ShieldCheck, PhoneOff, FileCheck2, Clock, EyeOff, Download, Search, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/v7/kit";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

const TABS = ["Overview", "DNC / DND", "Consent & masking", "Audit log"];
const toggles = [
  ["DNC / DND scrubbing", "Skip Do-Not-Call numbers on every dial", true],
  ["Calling-window enforcement", "Only dial within TRAI / RBI permitted hours (9am–9pm)", true],
  ["Consent & recording disclosure", "Play the consent prompt at the start of every call", true],
  ["PII masking in recordings", "Redact names, phone numbers & account data in saved audio", true],
] as const;
const dnc = [
  { phone: "+91 98•••• ••21", reason: "Registered DND", at: "Today 10:12" },
  { phone: "+91 99•••• ••07", reason: "Opt-out on call", at: "Today 09:40" },
  { phone: "+91 90•••• ••88", reason: "Registered DND", at: "Yesterday 17:55" },
];
const audit = [
  { who: "System", what: "DNC list refreshed — 1,204 numbers scrubbed", at: "Today 06:00" },
  { who: "Arnika Raj", what: "Enabled PII masking on 'EMI Reminders'", at: "Yesterday 14:20" },
  { who: "System", what: "Blocked 12 dials outside calling window", at: "Yesterday 21:01" },
  { who: "Rohan Verma", what: "Exported consent report (Q2)", at: "18 Jun 10:30" },
];

/* ---------- compliance audit log: every pre-dial check, pass or fail ---------- */

const CHECK_TYPES = ["Consent", "Retry cooldown", "Call frequency", "Calling hours", "DND registry"] as const;
const RESULTS = ["All", "pass", "fail"] as const;

type PreDialCheck = {
  id: number;
  type: (typeof CHECK_TYPES)[number];
  result: "pass" | "fail";
  details: Record<string, unknown>;
  at: string;
};

const preDialChecks: PreDialCheck[] = [
  { id: 1, type: "Call frequency", result: "pass", details: { phone: "+919329385312", calls_today: 0, max_per_day: 3, calls_this_week: 2, max_per_week: 10 }, at: "14 Jul 2026, 04:20 pm" },
  { id: 2, type: "Consent", result: "pass", details: { phone: "+919329385312", consent_id: "cns_8f21a4", channel: "web_form", captured_at: "2026-07-02T11:14:09Z", status: "active" }, at: "14 Jul 2026, 04:19 pm" },
  { id: 3, type: "DND registry", result: "pass", details: { phone: "+919812078245", dnd_registered: false, registry: "TRAI_NCPR", last_synced: "2026-07-14T06:00:12Z", category: null }, at: "14 Jul 2026, 03:47 pm" },
  { id: 4, type: "Consent", result: "fail", details: { phone: "+919812078245", consent_id: null, channel: null, status: "missing", reason: "no_active_consent_on_record" }, at: "14 Jul 2026, 03:46 pm" },
  { id: 5, type: "Calling hours", result: "pass", details: { phone: "+919876504410", local_time: "14:55", window_start: "09:00", window_end: "21:00", timezone: "Asia/Kolkata", within_window: true }, at: "14 Jul 2026, 02:55 pm" },
  { id: 6, type: "Retry cooldown", result: "fail", details: { phone: "+919090412276", last_attempt: "2026-07-14T11:05:00+05:30", cooldown_minutes: 240, elapsed_minutes: 96, ok: false }, at: "14 Jul 2026, 12:41 pm" },
  { id: 7, type: "Call frequency", result: "fail", details: { phone: "+919090412276", calls_today: 3, max_per_day: 3, calls_this_week: 7, max_per_week: 10 }, at: "14 Jul 2026, 12:40 pm" },
  { id: 8, type: "DND registry", result: "fail", details: { phone: "+919876504410", dnd_registered: true, registry: "TRAI_NCPR", last_synced: "2026-07-14T06:00:12Z", category: "fully_blocked" }, at: "14 Jul 2026, 11:26 am" },
  { id: 9, type: "Consent", result: "pass", details: { phone: "+919090412276", consent_id: "cns_2d9c77", channel: "ivr_optin", captured_at: "2026-06-19T08:40:31Z", status: "active" }, at: "14 Jul 2026, 10:09 am" },
  { id: 10, type: "Retry cooldown", result: "pass", details: { phone: "+919329385312", last_attempt: "2026-07-13T18:58:00+05:30", cooldown_minutes: 240, elapsed_minutes: 872, ok: true }, at: "14 Jul 2026, 09:30 am" },
  { id: 11, type: "Calling hours", result: "fail", details: { phone: "+919812078245", local_time: "21:12", window_start: "09:00", window_end: "21:00", timezone: "Asia/Kolkata", within_window: false }, at: "13 Jul 2026, 09:12 pm" },
  { id: 12, type: "Call frequency", result: "pass", details: { phone: "+919876504410", calls_today: 1, max_per_day: 3, calls_this_week: 4, max_per_week: 10 }, at: "13 Jul 2026, 06:58 pm" },
  { id: 13, type: "Consent", result: "fail", details: { phone: "+919876504410", consent_id: null, channel: null, status: "expired", reason: "consent_expired_2026-06-30" }, at: "13 Jul 2026, 05:12 pm" },
  { id: 14, type: "DND registry", result: "pass", details: { phone: "+919329385312", dnd_registered: false, registry: "TRAI_NCPR", last_synced: "2026-07-13T06:00:04Z", category: null }, at: "13 Jul 2026, 02:40 pm" },
  { id: 15, type: "Calling hours", result: "pass", details: { phone: "+919090412276", local_time: "11:03", window_start: "09:00", window_end: "21:00", timezone: "Asia/Kolkata", within_window: true }, at: "13 Jul 2026, 11:03 am" },
  { id: 16, type: "Retry cooldown", result: "pass", details: { phone: "+919812078245", last_attempt: "2026-07-12T16:20:00+05:30", cooldown_minutes: 240, elapsed_minutes: 1010, ok: true }, at: "13 Jul 2026, 09:10 am" },
];

const monoTh = "px-4 py-2.5 text-left font-[family-name:var(--font-data)] text-[10px] font-medium uppercase tracking-[0.14em] text-mocha";

export default function CompliancePage() {
  const [tab, setTab] = useState(TABS[0]);
  const [checkFilter, setCheckFilter] = useState<string>("All");
  const [resultFilter, setResultFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredChecks = preDialChecks.filter(
    (c) => (checkFilter === "All" || c.type === checkFilter) && (resultFilter === "All" || c.result === resultFilter),
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Compliance" subtitle="DNC, consent, calling-window & audit trail"
        actions={<Button size="sm" variant="outline" onClick={() => toast({ title: "Export", body: "Compliance report downloading…", severity: "info" })} className="gap-1.5 text-mocha"><Download className="size-3.5" /> Export report</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="DNC scrubbed" value="1,204" icon={PhoneOff} sub="this cycle" />
        <StatCard label="Consent captured" value="99.2%" icon={FileCheck2} sub="of connected calls" />
        <StatCard label="Window violations" value="0" icon={Clock} sub="all dials in window" />
        <StatCard label="Recordings masked" value="100%" icon={EyeOff} sub="PII redacted" />
      </div>

      <div className="mb-4 flex gap-1 border-b border-foam">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === t ? "border-caramel text-caramel" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>)}
      </div>

      {tab === "Overview" && (
        <div className="space-y-3">
          {toggles.map(([t, d, on]) => (
            <div key={t} className="flex items-center justify-between rounded-xl border border-foam bg-porcelain p-4 shadow-glass">
              <div className="flex items-center gap-3"><GlazedTile icon={ShieldCheck} tint="var(--color-success)" /><div><div className="text-sm font-medium text-coffee">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div></div>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", on ? "bg-success/12 text-success" : "bg-foam text-muted-foreground")}>{on ? "On" : "Off"}</span>
            </div>
          ))}
          <div className="flex items-start gap-3 rounded-xl border border-caramel/30 bg-caramel/5 p-4">
            <EyeOff className="mt-0.5 size-4 shrink-0 text-caramel" />
            <p className="text-sm text-mocha"><span className="font-semibold text-coffee">All personal data in voice recordings is masked.</span> Names, phone numbers, and account identifiers are automatically redacted in stored audio and transcripts — the saved recording never contains raw PII.</p>
          </div>
        </div>
      )}

      {tab === "DNC / DND" && (
        <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
          <div className="flex items-center gap-2 border-b border-foam p-3"><Search className="size-4 text-muted-foreground" /><Input placeholder="Search suppressed numbers…" className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0" /></div>
          <table className="w-full text-sm">
            <thead><tr className="bg-oat/40 text-left text-xs text-mocha"><th className="px-4 py-2.5">Number</th><th className="px-4 py-2.5">Reason</th><th className="px-4 py-2.5 text-right">Suppressed</th></tr></thead>
            <tbody className="divide-y divide-foam">{dnc.map((d) => <tr key={d.phone}><td className="px-4 py-2.5 font-data text-coffee">{d.phone}</td><td className="px-4 py-2.5 text-muted-foreground">{d.reason}</td><td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{d.at}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {tab === "Consent & masking" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass"><h3 className="font-serif text-lg font-semibold text-coffee">Consent disclosure</h3><p className="mt-2 text-sm text-muted-foreground">Every call opens with a consent + recording disclosure prompt. Captured on 99.2% of connected calls; non-consenting contacts are dropped and suppressed.</p></div>
          <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass"><h3 className="font-serif text-lg font-semibold text-coffee">PII masking</h3><p className="mt-2 text-sm text-muted-foreground">Recordings and transcripts are stored with names, numbers and account data redacted. Masking is enforced org-wide and cannot be disabled per campaign.</p></div>
        </div>
      )}

      {tab === "Audit log" && (
        <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
          <ul className="divide-y divide-foam">{audit.map((a, i) => <li key={i} className="flex items-center gap-3 px-5 py-3"><span className="flex size-8 items-center justify-center rounded-full bg-secondary text-mocha"><FileCheck2 className="size-4" /></span><div className="flex-1"><div className="text-sm text-coffee">{a.what}</div><div className="text-[11px] text-muted-foreground">{a.who}</div></div><span className="text-xs text-muted-foreground">{a.at}</span></li>)}</ul>
        </div>
      )}

      <section className="mt-8 overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
        <div className="border-b border-foam p-5">
          <h2 className="font-serif text-lg font-semibold text-coffee">Compliance Audit Log</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Every pre-dial check the platform ran, pass or fail.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {["All", ...CHECK_TYPES].map((t) => (
              <Chip key={t} active={checkFilter === t} onClick={() => { setCheckFilter(t); setExpandedId(null); }}>{t}</Chip>
            ))}
            <select
              value={resultFilter}
              onChange={(e) => { setResultFilter(e.target.value); setExpandedId(null); }}
              aria-label="Filter by result"
              className="ml-auto h-8 rounded-full border border-foam bg-porcelain px-3 text-[12px] text-coffee shadow-glass outline-none focus:border-caramel"
            >
              {RESULTS.map((r) => <option key={r} value={r}>{r === "All" ? "All results" : r}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-oat/40">
                <th className={monoTh}>Check type</th>
                <th className={monoTh}>Result</th>
                <th className={monoTh}>Details</th>
                <th className={cn(monoTh, "text-right")}>Checked at</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.map((c) => {
                const open = expandedId === c.id;
                return (
                  <Fragment key={c.id}>
                    <tr
                      onClick={() => setExpandedId(open ? null : c.id)}
                      aria-expanded={open}
                      className={cn("cursor-pointer border-t border-foam transition-colors hover:bg-oat/30", open && "bg-oat/20")}
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-coffee">{c.type}</td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <span className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
                          c.result === "pass" ? "border-success/30 bg-success/12 text-success" : "border-danger/30 bg-danger/10 text-danger",
                        )}>{c.result}</span>
                      </td>
                      <td className="w-full max-w-0 px-4 py-2.5">
                        <span className="block truncate font-data text-xs text-mocha">{JSON.stringify(c.details)}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          {c.at}
                          <ChevronDown className={cn("size-3.5 text-latte transition-transform", open && "rotate-180")} />
                        </span>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={4} className="px-4 pb-4 pt-0">
                          <pre className="overflow-x-auto rounded-xl bg-oat/40 p-4 font-data text-[11px] leading-relaxed text-coffee">{JSON.stringify(c.details, null, 2)}</pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filteredChecks.length === 0 && (
                <tr className="border-t border-foam">
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No checks match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-foam bg-cream/60 px-5 py-3 text-xs text-muted-foreground">
          Checks run automatically before every dial — failures block the call and are logged here.
        </div>
      </section>
    </div>
  );
}
