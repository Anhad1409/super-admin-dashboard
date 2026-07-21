"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, Plug, ShieldCheck, KeyRound, Plus, Copy, ListChecks, Target, GitBranch, Wand2, FileText, Gauge, LayoutTemplate, BadgeCheck, MousePointerClick, MessageSquare, MessageCircle, RefreshCw, Wallet, BarChart3, ChevronRight, CheckCircle2, ArrowRight, Phone, X, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { SetupGuideButton } from "@/components/setup-guide/setup-guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { organization, currentUser } from "@/lib/data";
import { GlazedTile, ACCENT } from "@/components/settings/glaze";
import { titleCase } from "@/lib/format";

const TABS = [
  { key: "Organization", icon: Building2 },
  { key: "Team", icon: Users },
  { key: "Providers", icon: Plug },
  { key: "Compliance", icon: ShieldCheck },
  { key: "API Keys", icon: KeyRound },
];
const QUICK_TINT: Record<string, string> = {
  Organization: "var(--color-caramel)", Team: "var(--color-info)", Providers: "var(--color-steam)",
  Compliance: "var(--color-matcha)", "API Keys": "var(--color-mango)",
};
const QUICK_DESC: Record<string, string> = {
  Organization: "Profile, industry & website context",
  Team: "Users, roles & plan usage",
  Providers: "Telephony, STT, LLM & TTS",
  Compliance: "DND, calling hours & consent",
  "API Keys": "Webhook authentication keys",
};
const inputCls = "w-full rounded-lg border border-foam bg-card px-3 py-2 text-sm text-coffee outline-none focus:border-caramel focus:ring-1 focus:ring-caramel/30";
const team = [
  { name: currentUser.full_name, email: currentUser.email, role: "super_admin" },
  { name: "Rohan Verma", email: "rohan@blostem.com", role: "manager" },
  { name: "Priya Nair", email: "priya@blostem.com", role: "agent" },
];
const PROVIDER_TABS = ["Telephony", "STT", "LLM", "TTS"];
const providerCatalog: Record<string, { name: string; status: "Connected" | "Not connected"; def?: boolean }[]> = {
  Telephony: [{ name: "Plivo", status: "Connected", def: true }, { name: "Exotel", status: "Connected" }, { name: "Vapi", status: "Not connected" }],
  STT: [{ name: "Deepgram", status: "Connected", def: true }, { name: "Sarvam", status: "Not connected" }],
  LLM: [{ name: "Google Gemini", status: "Connected", def: true }, { name: "OpenAI", status: "Connected" }, { name: "Anthropic", status: "Not connected" }],
  TTS: [{ name: "Cartesia", status: "Connected", def: true }, { name: "ElevenLabs", status: "Connected" }, { name: "Sarvam Bulbul", status: "Not connected" }],
};
const apiKeys = [
  { name: "Production", key: "vb_live_••••••••3a91", created: "12 May 2026" },
  { name: "Sandbox", key: "vb_test_••••••••7c20", created: "02 Jun 2026" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-sm font-medium text-coffee">{label}</label>{children}</div>;
}

type Cfg = { icon: LucideIcon; title: string; desc: string; badge?: string; href?: string; color?: string };
const badgeTone: Record<string, string> = {
  REQUIRED: "bg-danger/12 text-danger", OPTIONAL: "bg-foam text-mocha",
  DEFAULT: "bg-success/12 text-success", SEEDED: "bg-caramel/15 text-caramel",
};
const AGENT_CFG: Cfg[] = [
  { icon: Phone, title: "Outbound Caller IDs", desc: "Caller-ID number pool — campaigns rotate round-robin.", badge: "REQUIRED", color: "var(--color-caramel)", href: "/settings/phone-numbers" },
  { icon: ListChecks, title: "Lead Schemas", desc: "Reusable lead-schema templates imported by the wizard.", badge: "DEFAULT", color: "var(--color-info)", href: "/settings/lead-schema-templates" },
  { icon: Target, title: "Scoring Configs", desc: "Reusable weights, in-call adjustments & thresholds.", badge: "DEFAULT", color: "var(--color-steam)", href: "/settings/scoring-config-templates" },
  { icon: GitBranch, title: "Conversation Flows", desc: "Reusable prompts, greetings & objection handlers.", badge: "REQUIRED", color: "var(--color-matcha)", href: "/settings/conversation-flow-templates" },
  { icon: Wand2, title: "Agent Skills", desc: "Real-time tools the agent can call mid-call.", badge: "SEEDED", color: "var(--color-blueberry)", href: "/settings/skills" },
  { icon: Phone, title: "Human Agent Numbers", desc: "Transfer numbers — one per agent for warm hand-offs.", badge: "OPTIONAL", color: "var(--color-info)", href: "/settings/agent-numbers" },
  { icon: FileText, title: "Documents", desc: "Upload PDFs/FAQs into the agent's knowledge base — with RAG retrieval testing.", badge: "OPTIONAL", color: "var(--color-danger)", href: "/settings/documents" },
  { icon: Gauge, title: "Call Quality", desc: "System presets + custom duration/pacing/LLM bundles.", badge: "DEFAULT", color: "var(--color-mango)", href: "/settings/call-quality" },
  { icon: LayoutTemplate, title: "Templates", desc: "Pre-built campaign templates by vertical — collections, surveys, sales.", badge: "OPTIONAL", color: "var(--color-matcha)", href: "/settings/templates" },
];
const CHANNELS: Cfg[] = [
  { icon: BadgeCheck, title: "Truecaller Identity", desc: "Verified business caller-ID; fewer spam flags.", badge: "OPTIONAL", color: "var(--color-info)", href: "/settings/truecaller" },
  { icon: MousePointerClick, title: "Click-to-Call Widgets", desc: "Embeddable callback button for your site.", badge: "OPTIONAL", color: "var(--color-matcha)", href: "/settings/widgets" },
  { icon: MessageSquare, title: "SMS / DLT", desc: "DLT-registered transactional SMS (India).", badge: "OPTIONAL", color: "var(--color-steam)", href: "/settings/sms-dlt" },
  { icon: MessageCircle, title: "WhatsApp", desc: "WhatsApp messages via Business API.", badge: "OPTIONAL", color: "var(--color-success)", href: "/settings/whatsapp" },
  { icon: MessageSquare, title: "Email Configuration", desc: "Providers (Resend/SendGrid/SMTP) + agent email templates.", badge: "OPTIONAL", color: "var(--color-steam)", href: "/settings/email" },
  { icon: RefreshCw, title: "CRM Sync", desc: "Two-way sync with LeadSquared, Salesforce, Zoho, HubSpot.", badge: "OPTIONAL", color: "var(--color-blueberry)" },
];
const BILLING: Cfg[] = [
  { icon: Wallet, title: "Billing & Wallet", desc: "Buy channels or top up minutes; view history.", badge: "REQUIRED", color: "var(--color-mango)", href: "/settings/billing" },
  { icon: BarChart3, title: "Usage & Metering", desc: "Volume, minutes & per-provider cost breakdown.", badge: "OPTIONAL", color: "var(--color-mocha)", href: "/settings/usage" },
];

function SettingsGroup({ title, blurb, items, accent = ACCENT.core }: { title: string; blurb: string; items: Cfg[]; accent?: string }) {
  const [open, setOpen] = useState<Cfg | null>(null);
  const [enabled, setEnabled] = useState(true);
  return (
    <section className="mt-6">
      <div className="flex items-center gap-2.5">
        <span className="size-2 rounded-full" style={{ background: accent, boxShadow: `0 0 0 3px color-mix(in srgb, ${accent} 18%, transparent)` }} />
        <h2 className="font-serif text-lg font-semibold text-coffee">{title}</h2>
        <span className="rounded-full bg-oat px-2 py-0.5 font-[family-name:var(--font-data)] text-[10px] text-mocha tabular-nums">{items.length}</span>
      </div>
      <p className="mb-3 mt-0.5 text-sm text-muted-foreground">{blurb}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((c) => {
          const Icon = c.icon;
          const inner = (
            <>
              <div className="flex items-start justify-between">
                <GlazedTile icon={Icon} tint={accent} className="transition-transform group-hover:scale-105" />
                {c.badge && <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide", badgeTone[c.badge])}>{c.badge}</span>}
              </div>
              <div className="mt-2.5 flex items-center gap-1 text-sm font-semibold text-coffee">{c.title}<ChevronRight className="size-3.5 text-caramel opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" /></div>
              <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">{c.desc}</p>
            </>
          );
          const cls = "group flex min-h-[118px] flex-col rounded-2xl border border-foam bg-porcelain p-4 text-left shadow-glass transition-all hover:-translate-y-0.5 hover:border-caramel hover:shadow-glass-hover";
          return c.href
            ? <Link key={c.title} href={c.href} className={cls}>{inner}</Link>
            : <button key={c.title} onClick={() => { setOpen(c); setEnabled(true); }} className={cls}>{inner}</button>;
        })}
      </div>

      {/* config sheet — every card opens a real panel, no dead ends */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-espresso/30 backdrop-blur-[2px]" onClick={() => setOpen(null)} />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-[420px] max-w-[94vw] flex-col border-l border-foam bg-porcelain shadow-card-lg">
            <div className="flex items-center gap-3 border-b border-foam px-5 py-4">
              <GlazedTile icon={open.icon} tint={accent} />
              <div className="min-w-0 flex-1">
                <div className="font-serif text-lg font-semibold text-coffee">{open.title}</div>
                <div className="truncate text-xs text-muted-foreground">{open.desc}</div>
              </div>
              <button onClick={() => setOpen(null)} aria-label="Close" className="text-muted-foreground hover:text-coffee"><X className="size-4" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="flex items-center justify-between rounded-xl border border-foam bg-card px-3.5 py-3">
                <div>
                  <div className="text-sm font-medium text-coffee">Enabled for this organization</div>
                  <div className="text-xs text-muted-foreground">{enabled ? "Live — using the configuration below." : "Paused — campaigns skip this capability."}</div>
                </div>
                <button role="switch" aria-checked={enabled} onClick={() => setEnabled((v) => !v)}
                  className={cn("relative h-5 w-9 rounded-full transition-colors", enabled ? "bg-success" : "bg-foam")}>
                  <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", enabled ? "left-[18px]" : "left-0.5")} />
                </button>
              </div>
              <div className="rounded-xl border border-foam bg-card px-3.5 py-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-mocha">Current configuration</div>
                <div className="mt-2 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="font-medium text-coffee">Org defaults</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Applies to</span><span className="font-medium text-coffee">All campaigns</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Last changed</span><span className="font-medium text-coffee">23 Jun 2026</span></div>
                </div>
              </div>
              <p className="rounded-xl bg-oat/50 px-3.5 py-3 text-xs text-mocha">
                Campaign-level overrides live in the campaign wizard — settings here are the organization-wide defaults new campaigns inherit.
              </p>
            </div>
            <div className="border-t border-foam p-4">
              <Button onClick={() => { setOpen(null); toast({ title: "Saved", body: `${open.title} settings updated.`, severity: "success" }); }}
                className="w-full bg-brand text-brand-foreground hover:bg-brand-dark">Save changes</Button>
            </div>
          </aside>
        </>
      )}
    </section>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("Organization");
  const [provTab, setProvTab] = useState("Telephony");
  const [orgTab, setOrgTab] = useState<"Basic Info" | "Website" | "Contact & KYB">("Basic Info");
  const [keyProcs, setKeyProcs] = useState<string[]>(["lead_qualification"]);
  const [newProc, setNewProc] = useState("");
  const [members, setMembers] = useState(team.map((m2) => ({ ...m2, status: "active" as "active" | "pending", last: "23/6/2026" })));
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inv, setInv] = useState({ name: "", email: "", phone: "", dept: "", title: "", role: "Org Admin" });
  const [compl, setCompl] = useState([true, true, true, true]);
  const o = organization as Record<string, string>;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Settings" subtitle="Organization, team, providers, compliance & keys" />

      {/* setup completion banner */}
      <div className="mb-6 rounded-2xl border border-caramel/30 bg-gradient-to-br from-cream to-oat/60 p-5 shadow-glass">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <div className="font-serif text-lg font-semibold text-coffee">Great start — keep going</div>
            <div className="text-xs text-muted-foreground">1 of 3 done · finish setup to start placing calls</div>
          </div>
          <div className="flex items-center gap-2"><div className="h-1.5 w-32 overflow-hidden rounded-full bg-foam"><div className="h-full w-1/3 rounded-full bg-gradient-to-r from-mocha to-caramel" /></div><span className="font-data text-sm font-medium text-mocha">33%</span></div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { t: "Complete organization profile", s: "~1 min", state: "next" },
            { t: "Connect call pipeline (Telephony, STT, LLM, TTS)", s: "~5 min", state: "todo" },
            { t: "Top up your wallet", s: "done", state: "done" },
          ].map((step) => (
            <div key={step.t} className={cn("flex items-center gap-2.5 rounded-xl border bg-card/70 px-3 py-2.5", step.state === "next" ? "border-caramel" : "border-foam")}>
              {step.state === "done" ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold", step.state === "next" ? "bg-caramel text-cream" : "bg-foam text-muted-foreground")}>{step.state === "next" ? "!" : ""}</span>}
              <span className={cn("flex-1 text-xs", step.state === "done" ? "text-muted-foreground line-through" : "text-coffee")}>{step.t}</span>
              {step.state === "next" && <button onClick={() => setTab("Organization")} className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-caramel">Start here <ArrowRight className="size-3" /></button>}
              {step.state === "todo" && <button onClick={() => setTab("Providers")} className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-mocha">Configure <ArrowRight className="size-3" /></button>}
            </div>
          ))}
        </div>
      </div>

      {/* quick settings cards */}
      <div data-tour="set-quick" className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TABS.map((t) => {
          const Icon = t.icon; const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn("group rounded-2xl border p-3.5 text-left shadow-glass transition-all", active ? "border-caramel bg-caramel/8 ring-1 ring-caramel/25" : "border-foam bg-porcelain hover:-translate-y-0.5 hover:border-latte hover:shadow-glass-hover")}>
              <GlazedTile icon={Icon} tint={ACCENT.core} active={active} className="transition-transform group-hover:scale-105" />
              <div className="mt-2.5 text-sm font-semibold text-coffee">{t.key}</div>
              <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{QUICK_DESC[t.key]}</div>
            </button>
          );
        })}
      </div>

      <div data-tour="set-content" className="rounded-2xl border border-foam bg-porcelain p-6 shadow-glass">
        {tab === "Organization" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-coffee">Organization Profile</h2>
              <p className="text-sm text-muted-foreground">Manage your organization details and industry context.</p>
            </div>
            <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-foam text-center text-sm font-medium">
              {(["Basic Info", "Website", "Contact & KYB"] as const).map((t2) => (
                <button key={t2} onClick={() => setOrgTab(t2)} className={cn("px-3 py-2.5 transition-colors", orgTab === t2 ? "bg-cream text-coffee" : "bg-porcelain text-mocha hover:text-coffee")}>{t2}</button>
              ))}
            </div>

            {orgTab === "Basic Info" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Organization name *"><Input defaultValue={o.name} className={inputCls} /></Field>
                  <Field label="Billing email *"><Input defaultValue={o.billing_email} placeholder="billing@yourcompany.in" className={inputCls} /></Field>
                  <Field label="Industry vertical *"><select defaultValue={titleCase(o.industry_vertical) || "Lending"} className={inputCls}><option>Lending</option><option>Banking</option><option>Insurance</option><option>Fintech</option><option>Other</option></select></Field>
                  <Field label="Nature of business"><Input placeholder="e.g., Home loan origination, Property development" className={inputCls} /></Field>
                </div>
                <div>
                  <label className="text-sm font-medium text-coffee">Key processes</label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {keyProcs.map((k2) => (
                      <span key={k2} className="inline-flex items-center gap-1.5 rounded-full bg-oat px-2.5 py-1 font-data text-xs text-mocha">{k2}
                        <button onClick={() => setKeyProcs((x) => x.filter((y) => y !== k2))} aria-label={`Remove ${k2}`} className="text-latte hover:text-danger">×</button>
                      </span>
                    ))}
                    <input value={newProc} onChange={(e) => setNewProc(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && newProc.trim()) { setKeyProcs((x) => [...x, newProc.trim().toLowerCase().replace(/\s+/g, "_")]); setNewProc(""); } }}
                      placeholder="Add a process (e.g., loan_disbursement) ⏎" className={inputCls + " max-w-xs"} />
                  </div>
                </div>
              </>
            )}
            {orgTab === "Website" && (
              <div className="grid gap-4">
                <Field label="Website URL"><Input placeholder="https://www.yourcompany.in" className={inputCls + " font-data"} /></Field>
                <Field label="About the business"><textarea placeholder="One paragraph the agent can use for context — products, geography, tone." className={inputCls + " h-24 resize-none"} /></Field>
                <p className="rounded-xl bg-oat/50 px-3.5 py-2.5 text-xs text-mocha">We crawl the website to enrich agent context — product names, service areas and FAQs.</p>
              </div>
            )}
            {orgTab === "Contact & KYB" && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Primary contact name *"><Input defaultValue={o.primary_contact_name || currentUser.full_name} className={inputCls} /></Field>
                <Field label="Primary contact email *"><Input defaultValue={currentUser.email} className={inputCls} /></Field>
                <Field label="Primary contact phone *"><Input placeholder="+91 85888 90832" className={inputCls + " font-data"} /></Field>
                <Field label="GST number"><Input placeholder="22AAAAA0000A1Z5" className={inputCls + " font-data"} /></Field>
                <Field label="Address line 1"><Input placeholder="Street address" className={inputCls} /></Field>
                <Field label="Address line 2"><Input placeholder="Suite, floor, etc." className={inputCls} /></Field>
                <Field label="City"><Input className={inputCls} /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="State"><Input className={inputCls} /></Field>
                  <Field label="Pincode"><Input placeholder="110001" className={inputCls + " font-data"} /></Field>
                </div>
              </div>
            )}
            <Button onClick={() => toast({ title: "Saved", body: `${orgTab} updated.`, severity: "success" })} className="bg-brand text-brand-foreground hover:bg-brand-dark">Save Changes</Button>
          </div>
        )}

        {tab === "Team" && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-coffee">Team Members</h2><p className="text-sm text-muted-foreground">Manage users in your organization</p></div>
              <Button size="sm" onClick={() => setInviteOpen(true)} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Invite User</Button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{members.length} of 5 users used</span><span className="rounded-full bg-oat px-2 py-0.5 font-medium text-mocha">Starter Plan</span></div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-coffee" style={{ width: `${(members.length / 5) * 100}%` }} /></div>
            </div>
            <ul className="divide-y divide-foam rounded-xl border border-foam">
              {members.map((m, i) => (
                <li key={m.email} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-coffee">{m.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.email}{m.status === "active" ? ` · Last login: ${m.last}` : " · Never logged in"}</div>
                  </div>
                  <select value={titleCase(m.role)} onChange={(e) => { setMembers((x) => x.map((y, j) => (j === i ? { ...y, role: e.target.value.toLowerCase().replace(/ /g, "_") } : y))); toast({ title: "Role updated", body: `${m.name} is now ${e.target.value}.`, severity: "info" }); }}
                    className="rounded-full border border-foam bg-porcelain px-2.5 py-1.5 text-xs font-medium text-mocha outline-none focus:border-caramel">
                    <option>Org Admin</option><option>Super Admin</option><option>Manager</option><option>Agent</option>
                  </select>
                  {m.status === "active"
                    ? <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">● Active</span>
                    : <>
                        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">Pending</span>
                        <button onClick={() => toast({ title: "Invitation resent", body: `A fresh OTP email went to ${m.email}.`, severity: "success" })} className="text-xs font-semibold text-caramel hover:underline">Resend</button>
                      </>}
                  <button onClick={() => { setMembers((x) => x.filter((_, j) => j !== i)); toast({ title: "User deactivated", body: `${m.name} no longer has access.`, severity: "warning" }); }} className="text-xs font-semibold text-danger/80 hover:text-danger">Deactivate</button>
                </li>
              ))}
            </ul>

            {inviteOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-espresso/30 backdrop-blur-[2px]" onClick={() => setInviteOpen(false)} />
                <div className="relative w-full max-w-md rounded-2xl border border-foam bg-porcelain p-5 shadow-card-lg">
                  <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-coffee"><Users className="size-4 text-caramel" /> Invite User</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Invite a user to this organization. They&apos;ll receive an email with an OTP to set up their account.</p>
                  <div className="mt-4 grid gap-3">
                    <Field label="Full Name *"><Input value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} placeholder="Rajesh Kumar" className={inputCls} /></Field>
                    <Field label="Email *"><Input value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} placeholder="rajesh@company.com" className={inputCls} /></Field>
                    <Field label="Phone Number"><Input value={inv.phone} onChange={(e) => setInv({ ...inv, phone: e.target.value })} placeholder="+91 98765 43210" className={inputCls + " font-data"} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Department"><Input value={inv.dept} onChange={(e) => setInv({ ...inv, dept: e.target.value })} placeholder="Sales" className={inputCls} /></Field>
                      <Field label="Job Title"><Input value={inv.title} onChange={(e) => setInv({ ...inv, title: e.target.value })} placeholder="Sales Head" className={inputCls} /></Field>
                    </div>
                    <Field label="Role *"><select value={inv.role} onChange={(e) => setInv({ ...inv, role: e.target.value })} className={inputCls}><option>Org Admin</option><option>Manager</option><option>Agent</option></select></Field>
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setInviteOpen(false)} className="border-foam text-mocha">Cancel</Button>
                    <Button disabled={!inv.name.trim() || !/.+@.+/.test(inv.email)}
                      onClick={() => { setMembers((x) => [...x, { name: inv.name.trim(), email: inv.email.trim(), role: inv.role.toLowerCase().replace(/ /g, "_"), status: "pending", last: "—" }]); setInviteOpen(false); setInv({ name: "", email: "", phone: "", dept: "", title: "", role: "Org Admin" }); toast({ title: "Invitation sent", body: "They'll receive an email with an OTP to set up their account.", severity: "success" }); }}
                      className="bg-brand text-brand-foreground hover:bg-brand-dark">Send Invitation</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "Providers" && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-coffee">Provider Management</h2><p className="text-sm text-muted-foreground">Bring your own telephony &amp; AI providers — no lock-in.</p></div>
              <Button size="sm" onClick={() => toast({ title: "Add provider", body: `Connect a ${provTab} provider…`, severity: "info" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Add provider</Button>
            </div>
            <div className="mb-4 flex gap-1.5">
              {PROVIDER_TABS.map((t) => <button key={t} onClick={() => setProvTab(t)} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", provTab === t ? "border-caramel bg-caramel/10 text-caramel" : "border-foam bg-card text-muted-foreground hover:border-latte")}>{t}</button>)}
            </div>
            {provTab === "Telephony" && <p className="mb-3 text-xs text-muted-foreground">Voice call providers (Vapi, Exotel, Plivo). Pipecat-pipeline providers (Exotel/Plivo) also need STT/LLM/TTS set.</p>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {providerCatalog[provTab].map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-xl border border-foam bg-card p-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-coffee">{p.name}{p.def && <span className="rounded-full bg-caramel/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-caramel">Default</span>}</div>
                    <div className={cn("text-xs", p.status === "Connected" ? "text-success" : "text-muted-foreground")}>● {p.status}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.status === "Connected" && <Button size="sm" variant="outline" onClick={() => toast({ title: `Testing ${p.name}`, body: "Sending a test request…", severity: "info" })} className="text-mocha">Test</Button>}
                    <button onClick={() => toast({ title: p.name, body: "Provider settings…", severity: "info" })} className="rounded-md p-1.5 text-muted-foreground hover:bg-foam hover:text-coffee"><Copy className="size-4 rotate-90" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Compliance" && (
          <div className="space-y-3">
            <h2 className="mb-1 text-lg font-semibold text-coffee">Compliance defaults</h2>
            {[["DNC / DND scrubbing", "Skip Do-Not-Call numbers on every dial"], ["Calling-window enforcement", "Only dial within TRAI/RBI permitted hours"], ["AI disclosure", "Require AI disclosure in the conversation"], ["Recording consent", "Require recording consent before proceeding"]].map(([t, d], i) => (
              <div key={t} className="flex items-center justify-between rounded-xl border border-foam bg-card p-4">
                <div><div className="text-sm font-medium text-coffee">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div>
                <button role="switch" aria-checked={compl[i]}
                  onClick={() => { setCompl((x) => x.map((v, j) => (j === i ? !v : v))); toast({ title: `${t} ${compl[i] ? "disabled" : "enabled"}`, body: compl[i] ? "Campaigns no longer enforce this check." : "Enforced on every call from now on.", severity: compl[i] ? "warning" : "success" }); }}
                  className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", compl[i] ? "bg-success" : "bg-foam")}>
                  <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", compl[i] ? "left-[18px]" : "left-0.5")} />
                </button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl bg-oat/50 px-4 py-2.5 font-data text-[11px] text-mocha">
              <span>🕘 Calling hours: <b className="text-coffee">09:00 – 21:00 IST</b></span>
              <span>📞 Max calls/day per lead: <b className="text-coffee">3</b></span>
              <span>⏱ Caller number cooldown: <b className="text-coffee">15s</b></span>
            </div>
            <Link href="/compliance" className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-caramel">Open compliance dashboard →</Link>
          </div>
        )}

        {tab === "API Keys" && (
          <div>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-coffee">API keys &amp; webhooks</h2><Button size="sm" onClick={() => toast({ title: "Key generated", body: "New API key created — copy it now.", severity: "success" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Generate key</Button></div>
            <div className="mb-3 rounded-xl border border-foam bg-oat/30 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-mocha">Funnel Webhook URL</div>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg border border-foam bg-card px-2.5 py-1.5 font-data text-xs text-coffee">POST https://vox.blostem.info/api/v1/webhooks/funnel/blostem-demo</code>
                <button onClick={() => toast({ title: "Copied", body: "Webhook URL copied.", severity: "info" })} className="text-muted-foreground hover:text-caramel"><Copy className="size-4" /></button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">POST leads from your funnel/landing page straight into a campaign.</p>
            </div>
            <div className="space-y-2">
              {apiKeys.map((k) => (
                <div key={k.name} className="flex items-center gap-3 rounded-xl border border-foam bg-card p-4">
                  <KeyRound className="size-4 text-mocha" />
                  <div className="flex-1"><div className="text-sm font-medium text-coffee">{k.name}</div><div className="font-data text-xs text-muted-foreground">{k.key} · created {k.created}</div></div>
                  <button onClick={() => toast({ title: "Copied", body: "API key copied to clipboard.", severity: "info" })} className="text-muted-foreground hover:text-caramel"><Copy className="size-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SettingsGroup title="Agent Configuration" blurb="How your AI agent thinks, talks and what it knows." items={AGENT_CFG} accent={ACCENT.core} />
      <SettingsGroup title="Channels & Integrations" blurb="Optional — SMS, WhatsApp, branded caller-ID and CRM sync." items={CHANNELS} accent={ACCENT.comms} />
      <SettingsGroup title="Billing & Usage" blurb="Fund channels or minutes, and track spend." items={BILLING} accent={ACCENT.money} />
    </div>
  );
}
