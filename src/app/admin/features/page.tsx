"use client";

/* Admin → Feature Management — per-organization feature toggles.
   Disabled features are hidden for org users; Blostem staff always
   see everything. State is kept per org, so switching the selector
   preserves each organization's toggles. */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import { SectionCard } from "@/components/v7/kit";
import { toast } from "@/components/notifications/toaster";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { monoLabel } from "@/components/admin/cp";


const ORGS = [
  "Blostem Demo Organization",
  "Demo Organization",
  "Fintechglow Capital Consultancy Pvt Ltd",
  "MoneyBuddha",
  "Smoke Test Org",
  "test-vision",
  "Voice Harness Sandbox",
];

type Feature = { name: string; desc: string; route: string };
type Section = { title: string; features: Feature[] };

const SECTIONS: Section[] = [
  {
    title: "Top navigation",
    features: [
      { name: "Dashboard", desc: "Overview KPIs and live activity", route: "/dashboard" },
      { name: "Campaigns", desc: "Create and run outbound campaigns", route: "/campaigns" },
      { name: "Leads", desc: "Lead lists, imports and dispositions", route: "/leads" },
      { name: "Calls", desc: "Call history, recordings and transcripts", route: "/calls" },
      { name: "Analytics", desc: "Funnel, outcome and cost analytics", route: "/analytics" },
      { name: "Reports", desc: "Scheduled and on-demand exports", route: "/reports" },
      { name: "System Logs", desc: "Provider events and audit trail", route: "/system-logs" },
      { name: "Learning", desc: "AI learning engine suggestions", route: "/learning" },
      { name: "Testing", desc: "Agent test suites and simulations", route: "/testing" },
      { name: "Sequences", desc: "Multi-step outreach sequences", route: "/sequences" },
      { name: "Compliance", desc: "DNC, consent and guardrail policies", route: "/compliance" },
    ],
  },
  {
    title: "Settings · Quick Actions",
    features: [
      { name: "Organization", desc: "Company profile and branding", route: "/settings" },
      { name: "Team Members", desc: "Invite and manage teammates", route: "/settings" },
      { name: "Providers", desc: "Telephony and AI provider credentials", route: "/settings" },
      { name: "Compliance card", desc: "Compliance summary on the Settings home", route: "/settings" },
      { name: "API Keys", desc: "Programmatic access tokens", route: "/settings" },
    ],
  },
  {
    title: "Settings · Agent Configuration",
    features: [
      { name: "Outbound Caller IDs", desc: "Numbers used for outbound dials", route: "/settings/phone-numbers" },
      { name: "Usage & Metering", desc: "Per-period call volume and cost", route: "/settings/usage" },
      { name: "Email Configuration", desc: "SMTP and sender identities", route: "/settings/email" },
      { name: "SMS/DLT", desc: "DLT templates and SMS routes", route: "/settings/sms-dlt" },
      { name: "WhatsApp", desc: "WABA templates and session messaging", route: "/settings/whatsapp" },
    ],
  },
];

export default function FeatureManagementPage() {
  const [org, setOrg] = useState(ORGS[1]);
  // sparse per-org overrides; every feature defaults to enabled
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const isOn = (feature: string) => overrides[`${org}::${feature}`] ?? true;
  const toggle = (feature: string) => {
    const next = !isOn(feature);
    setOverrides((p) => ({ ...p, [`${org}::${feature}`]: next }));
    toast({
      title: `${feature} ${next ? "enabled" : "disabled"} for ${org}`,
      body: next ? "Org users will now see this item." : "Org users will no longer see this item.",
      severity: next ? "success" : "warning",
    });
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/admin" className="inline-flex items-center gap-1 hover:text-coffee">
          <ChevronLeft className="size-4" /> Admin
        </Link>
        <span className="text-latte">/</span>
        <span className="text-coffee">Features</span>
      </nav>

      <h1 className="flex items-center gap-2.5 font-serif text-3xl font-semibold tracking-tight text-coffee">
        <SlidersHorizontal className="size-6 text-caramel" /> Feature Management
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Disabled features are hidden for org users — Blostem staff always see every item.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <span className={monoLabel}>Organization</span>
        <select value={org} onChange={(e) => setOrg(e.target.value)}
          className="h-9 max-w-full rounded-full border border-foam bg-porcelain px-3.5 text-[13px] text-coffee shadow-glass outline-none focus:border-caramel">
          {ORGS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button onClick={() => { setOverrides((prev) => { const n = { ...prev }; SECTIONS.forEach((sec) => sec.features.forEach((f) => { n[`${org}::${f.name}`] = true; })); return n; }); toast({ title: "All features enabled", body: `Every section is now visible for ${org}.`, severity: "success" }); }}
            className="rounded-full border border-foam bg-porcelain px-3 py-1.5 text-xs font-medium text-mocha shadow-glass hover:border-caramel hover:text-coffee">Enable all</button>
          <button onClick={() => { setOverrides((prev) => { const n = { ...prev }; SECTIONS.forEach((sec) => sec.features.forEach((f) => { if (f.name !== "Dashboard") n[`${org}::${f.name}`] = false; })); return n; }); toast({ title: "All features disabled", body: `Org users of ${org} now see only the Dashboard (locked).`, severity: "warning" }); }}
            className="rounded-full border border-foam bg-porcelain px-3 py-1.5 text-xs font-medium text-mocha shadow-glass hover:border-caramel hover:text-coffee">Disable all</button>
          <button onClick={() => { setOverrides((prev) => { const n = { ...prev }; Object.keys(n).forEach((k) => { if (k.startsWith(`${org}::`)) delete n[k]; }); return n; }); toast({ title: "Reset", body: `${org} is back to platform defaults.`, severity: "info" }); }}
            className="rounded-full border border-foam bg-porcelain px-3 py-1.5 text-xs font-medium text-mocha shadow-glass hover:border-caramel hover:text-coffee">Reset</button>
          <Button size="sm" onClick={() => toast({ title: "Saved", body: `Feature visibility for ${org} updated — takes effect on the org's next page load.`, severity: "success" })}
            className="bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">Save changes</Button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {SECTIONS.map((section) => {
          const enabled = section.features.filter((f) => isOn(f.name)).length;
          return (
            <SectionCard key={section.title} title={section.title}
              aside={
                <span className="rounded-full border border-foam bg-cream px-2.5 py-1 font-[family-name:var(--font-data)] text-[11px] text-mocha tabular-nums">
                  {enabled} of {section.features.length} enabled
                </span>
              }>
              <div className="divide-y divide-foam">
                {section.features.map((f) => {
                  const on = isOn(f.name);
                  return (
                    <div key={f.name} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-coffee">{f.name}</span>
                          <code className="rounded bg-oat px-1.5 py-0.5 font-[family-name:var(--font-data)] text-[10px] text-mocha">{f.route}</code>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
                      </div>
                      {f.name === "Dashboard" ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-oat/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-mocha">🔒 Locked</span>
                      ) : (
                        <button role="switch" aria-checked={on} aria-label={`Toggle ${f.name}`} onClick={() => toggle(f.name)}
                          className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-success" : "bg-foam")}>
                          <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", on ? "left-[18px]" : "left-0.5")} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
