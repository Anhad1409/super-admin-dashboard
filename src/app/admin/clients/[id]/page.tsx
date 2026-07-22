"use client";

/* /admin/clients/[id] — super-admin drill-down on one client org.
   Everything about a single tenant: revenue & billing, usage, health,
   compliance, contact, activity — plus admin actions (view-as, change
   plan, suspend) wired to toasts. */

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, PhoneCall, Users, TrendingUp, Wallet, ShieldCheck,
  Clock3, ExternalLink, LogIn, RefreshCw, Ban, Mail, Phone,
  Megaphone, Activity as ActivityIcon, CreditCard, Coins, RotateCcw, UserRound,
} from "lucide-react";
import { toast } from "@/components/notifications/toaster";
import {
  clientById, churnRiskOf, PLAN_META, STATUS_META,
} from "@/lib/clients-mock";
import { campaignsFor, activityFor, type PlatCampaign } from "@/lib/admin-analytics";

const mono = "font-[family-name:var(--font-data)]";
const monoLabel = `${mono} text-[10px] uppercase tracking-[0.14em] text-mocha`;
const fmtDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const RISK_META = { low: { label: "Low risk", c: "var(--color-success)" }, medium: { label: "Medium risk", c: "var(--color-warning)" }, high: { label: "High risk", c: "var(--color-danger)" } };

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const c = clientById(id);

  if (!c) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <p className="font-serif text-2xl text-coffee">Client not found</p>
        <button onClick={() => router.push("/admin/clients")} className="mt-4 text-sm font-medium text-caramel underline-offset-4 hover:underline">← Back to Control Plane</button>
      </div>
    );
  }

  const risk = churnRiskOf(c);
  const plan = PLAN_META[c.plan];
  const runway = c.minutesMonth > 0 ? Math.max(0, Math.round(c.walletBalance / 8)) : 0; // min left @ ₹8/min

  const KPIS = [
    { icon: PhoneCall, label: "Calls this month", v: c.callsMonth.toLocaleString("en-IN"), sub: `${(c.minutesMonth / 1000).toFixed(1)}k minutes`, tint: "var(--color-mango)" },
    { icon: TrendingUp, label: "Connect / success", v: `${c.connectPct}% / ${c.successPct}%`, sub: "answered / goal outcome", tint: "var(--color-steam)" },
    { icon: Users, label: "Seats", v: `${c.seatsUsed} / ${c.seatsTotal}`, sub: `${c.seatsTotal - c.seatsUsed} available`, tint: "var(--color-caramel)" },
    { icon: Wallet, label: "Wallet balance", v: `${c.walletBalance < 0 ? "−" : ""}₹${Math.abs(c.walletBalance).toLocaleString("en-IN")}`, sub: runway ? `≈ ${runway.toLocaleString("en-IN")} min runway` : "no active usage", tint: c.walletBalance < 0 ? "var(--color-danger)" : "var(--color-success)" },
  ];

  const act = (title: string, body: string, severity: "info" | "success" | "warning" = "info") => toast({ title, body, severity });

  const TABS = ["Overview", "Usage", "Billing", "Campaigns", "Activity"] as const;
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const camps = campaignsFor(c.id);
  const activity = activityFor(c);

  return (
    <div className="mx-auto max-w-[1200px]">
      <button onClick={() => router.push("/admin/clients")} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee">
        <ChevronLeft className="size-4" /> Control Plane
      </button>

      {/* ===== header ===== */}
      <div className="rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl font-serif text-2xl font-semibold text-porcelain shadow-glass"
              style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${plan.tint} 55%, #c9a87c), ${plan.tint})` }}>{c.name[0]}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-[26px] font-semibold leading-tight text-coffee">{c.name}</h1>
                {c.internal && <span className={`${mono} rounded bg-oat/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-mocha`}>internal</span>}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                <span>{c.vertical}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-cream px-2 py-0.5 text-[11px] font-medium text-coffee">
                  <span className="size-2 rounded-full" style={{ background: plan.tint }} /> {plan.label}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_META[c.status].badge}`}>{STATUS_META[c.status].label}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: RISK_META[risk].c }}>● {RISK_META[risk].label}</span>
              </div>
            </div>
          </div>
          {/* admin actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { act("Viewing as client", `Opening ${c.name}'s dashboard in impersonation mode.`, "info"); router.push("/dashboard"); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-coffee px-3.5 py-2 text-xs font-semibold text-cream shadow-cta hover:bg-espresso"><LogIn className="size-3.5" /> View as client</button>
            <button onClick={() => act("Change plan", `Open the plan editor for ${c.name}.`, "info")}
              className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-cream px-3.5 py-2 text-xs font-medium text-mocha hover:border-caramel hover:text-coffee"><RefreshCw className="size-3.5" /> Change plan</button>
            <button onClick={() => act("Suspend client", `${c.name} would be suspended — calling paused platform-wide.`, "warning")}
              className="inline-flex items-center gap-1.5 rounded-full border border-danger/25 bg-danger/8 px-3.5 py-2 text-xs font-medium text-danger hover:bg-danger/15"><Ban className="size-3.5" /> Suspend</button>
          </div>
        </div>
        {/* facts strip */}
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-foam pt-4 sm:grid-cols-4">
          <Fact label="Client since" value={fmtDate(c.signup)} />
          <Fact label="Last active" value={fmtDate(c.lastActive)} />
          <Fact label="Health score" value={<span style={{ color: RISK_META[risk].c }}>{c.health}/100</span>} />
          <Fact label="Open tickets" value={c.openTickets ? `${c.openTickets}` : "None"} />
        </div>
      </div>

      {/* ===== tab bar ===== */}
      <div className="mt-5 flex flex-wrap gap-1.5 border-b border-foam">
        {TABS.map((t) => {
          const count = t === "Campaigns" ? camps.length : undefined;
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition-colors ${tab === t ? "border-caramel text-coffee" : "border-transparent text-mocha hover:text-coffee"}`}>
              {t}{count !== undefined && <span className="ml-1.5 text-latte tabular-nums">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ===== OVERVIEW ===== */}
      {tab === "Overview" && (<>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${k.tint} 16%, #fffdf9)`, color: `color-mix(in srgb, ${k.tint} 78%, #2a1a0f)` }}><k.icon className="size-4" /></span>
              <span className={monoLabel}>{k.label}</span>
            </div>
            <div className="mt-2.5 font-serif text-[22px] font-semibold leading-none text-coffee tabular-nums">{k.v}</div>
            <div className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* compliance & config */}
        <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-steam" />
            <h2 className="font-serif text-lg font-semibold text-coffee">Compliance &amp; config</h2>
          </div>
          <div className="mt-3.5 space-y-3">
            <ConfigRow label="DLT registration" value={
              c.dltStatus === "registered" ? <Tag c="var(--color-success)">Registered</Tag>
              : c.dltStatus === "in_progress" ? <Tag c="var(--color-warning)">In progress</Tag>
              : c.dltStatus === "not_required" ? <Tag c="var(--color-latte)">Not required</Tag>
              : <Tag c="var(--color-danger)">Missing</Tag>} />
            <ConfigRow label="DND scrubbing" value={c.dndScrub ? <Tag c="var(--color-success)">On</Tag> : <Tag c="var(--color-danger)">Off</Tag>} />
            <ConfigRow label="Calling window" value={<span className="text-[13px] text-coffee">09:00–21:00 IST</span>} />
            <ConfigRow label="Compliance path" value={<span className="text-[13px] text-coffee">{c.plan === "enterprise" || c.plan === "scale" ? "160-series (transactional)" : "140-series (promo)"}</span>} />
          </div>
          {!c.dndScrub && (
            <p className="mt-3 rounded-lg bg-danger/8 px-3 py-2 text-[11px] text-danger">DND scrubbing is off — flag for the compliance team before the next promo batch.</p>
          )}
        </div>
        {/* primary contact */}
        <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <h2 className="font-serif text-lg font-semibold text-coffee">Primary contact</h2>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-caramel to-mocha text-sm font-semibold text-cream">
              {c.contactName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <div>
              <div className="text-[14px] font-semibold text-coffee">{c.contactName}</div>
              <div className="text-[12px] text-muted-foreground">Account owner</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <a href={`mailto:${c.contactEmail}`} className="flex items-center gap-2 text-[13px] text-mocha hover:text-coffee"><Mail className="size-3.5 text-latte" /> {c.contactEmail}</a>
            <div className="flex items-center gap-2 text-[13px] text-mocha"><Phone className="size-3.5 text-latte" /> {c.contactPhone}</div>
          </div>
        </div>
      </div>
      </>)}

      {/* ===== USAGE ===== */}
      {tab === "Usage" && (
        <div className="mt-5 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-lg font-semibold text-coffee">Call volume · last 14 days</h2>
            <span className={`${mono} text-[11px] text-latte`}>{c.callsMonth.toLocaleString("en-IN")} this month</span>
          </div>
          <div className="mt-4 flex h-48 items-end gap-1.5">
            {c.spark.map((v, i) => {
              const max = Math.max(...c.spark, 1);
              return (
                <div key={i} className="group relative flex-1">
                  <div className="w-full rounded-t-md bg-gradient-to-t from-mocha to-caramel transition-all" style={{ height: `${(v / max) * 175}px` }} />
                  <span className={`${mono} pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-espresso px-1.5 py-0.5 text-[9px] text-cream opacity-0 transition-opacity group-hover:opacity-100`}>{v}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between"><span className={`${mono} text-[10px] text-latte`}>14d ago</span><span className={`${mono} text-[10px] text-latte`}>today</span></div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-foam pt-4 sm:grid-cols-4">
            <UsageStat icon={PhoneCall} label="Calls / month" v={c.callsMonth.toLocaleString("en-IN")} />
            <UsageStat icon={Clock3} label="Minutes / month" v={`${(c.minutesMonth / 1000).toFixed(1)}k`} />
            <UsageStat icon={TrendingUp} label="Connect rate" v={`${c.connectPct}%`} />
            <UsageStat icon={ActivityIcon} label="Success rate" v={`${c.successPct}%`} />
          </div>
        </div>
      )}

      {/* ===== BILLING ===== */}
      {tab === "Billing" && (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-coffee">Billing</h2>
              <button onClick={() => act("Open invoices", `Loading ${c.name}'s invoice history.`, "info")} className="inline-flex items-center gap-1 text-[12px] font-medium text-caramel hover:underline">Invoices <ExternalLink className="size-3" /></button>
            </div>
            <div className="mt-3 space-y-3">
              <ConfigRow label="Plan" value={<span className="text-[13px] font-medium text-coffee">{plan.label} · {c.mrr ? `₹${c.mrr.toLocaleString("en-IN")}/mo` : "no charge"}</span>} />
              <ConfigRow label="Billing status" value={c.status === "past_due" ? <Tag c="var(--color-warning)">Past due</Tag> : c.status === "trial" ? <Tag c="var(--color-info)">Trial</Tag> : <Tag c="var(--color-success)">Current</Tag>} />
              <ConfigRow label="Wallet" value={<span className="text-[13px] font-medium tabular-nums" style={{ color: c.walletBalance < 0 ? "var(--color-danger)" : "var(--color-coffee)" }}>{c.walletBalance < 0 ? "−" : ""}₹{Math.abs(c.walletBalance).toLocaleString("en-IN")}</span>} />
              <ConfigRow label="Annual run-rate" value={<span className="text-[13px] font-medium text-coffee tabular-nums">₹{(c.mrr * 12).toLocaleString("en-IN")}</span>} />
            </div>
            {c.status === "past_due" && (
              <button onClick={() => act("Reminder sent", `Payment reminder emailed to ${c.contactName}.`, "success")} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-[12px] font-medium text-warning hover:bg-warning/25"><Clock3 className="size-3.5" /> Send payment reminder</button>
            )}
          </div>
          <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <h2 className="font-serif text-lg font-semibold text-coffee">Wallet &amp; actions</h2>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-[28px] font-semibold tabular-nums" style={{ color: c.walletBalance < 0 ? "var(--color-danger)" : "var(--color-coffee)" }}>{c.walletBalance < 0 ? "−" : ""}₹{Math.abs(c.walletBalance).toLocaleString("en-IN")}</span>
              <span className={`${mono} text-[11px] uppercase tracking-wide text-latte`}>{runway ? `≈ ${runway.toLocaleString("en-IN")} min` : "no usage"}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => act("Wallet credited", `₹25,000 added to ${c.name}'s wallet.`, "success")} className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-xs font-semibold text-brand-foreground shadow-cta hover:bg-brand-dark"><Coins className="size-3.5" /> Add credit</button>
              <button onClick={() => act("Refund", `Open refund flow for ${c.name}.`, "info")} className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-cream px-3.5 py-2 text-xs font-medium text-mocha hover:border-caramel hover:text-coffee"><RotateCcw className="size-3.5" /> Refund</button>
              <button onClick={() => act("Plan changed", `Open the plan editor for ${c.name}.`, "info")} className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-cream px-3.5 py-2 text-xs font-medium text-mocha hover:border-caramel hover:text-coffee"><CreditCard className="size-3.5" /> Change plan</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CAMPAIGNS ===== */}
      {tab === "Campaigns" && (
        <div className="mt-5 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <h2 className="mb-3 font-serif text-lg font-semibold text-coffee">Campaigns</h2>
          {camps.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No campaigns yet for this client.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
                  <th className="py-2 font-medium">Campaign</th><th className="font-medium">Status</th><th className="text-right font-medium">Leads</th><th className="text-right font-medium">Connect</th><th className="text-right font-medium">Conversions</th>
                </tr></thead>
                <tbody>
                  {camps.map((cm: PlatCampaign) => (
                    <tr key={cm.id} className="border-b border-foam/60 last:border-0">
                      <td className="py-2.5"><div className="flex items-center gap-2"><Megaphone className="size-3.5 text-caramel" /><span className="text-[13px] font-medium text-coffee">{cm.name}</span></div></td>
                      <td><Tag c={CAMP_TONE[cm.status]}>{cm.status[0].toUpperCase() + cm.status.slice(1)}</Tag></td>
                      <td className="text-right text-[12.5px] text-mocha tabular-nums">{cm.leads.toLocaleString("en-IN")}</td>
                      <td className="text-right text-[12.5px] text-mocha tabular-nums">{cm.connectPct}%</td>
                      <td className="text-right text-[12.5px] font-semibold text-coffee tabular-nums">{cm.conversions.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== ACTIVITY ===== */}
      {tab === "Activity" && (
        <div className="mt-5 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <h2 className="mb-4 font-serif text-lg font-semibold text-coffee">Recent activity</h2>
          <ul className="relative space-y-1 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-foam">
            {activity.map((a, i) => {
              const Icon = ACT_ICON[a.icon];
              return (
                <li key={i} className="relative flex items-start gap-3 rounded-xl py-2.5 pr-2 hover:bg-oat/30">
                  <span className="z-[1] mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-foam bg-porcelain text-mocha"><Icon className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-coffee">{a.text}</p>
                    <p className={`${mono} mt-0.5 text-[10px] uppercase tracking-wide text-latte`}>{a.when}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

const CAMP_TONE: Record<PlatCampaign["status"], string> = {
  active: "var(--color-success)", scheduled: "var(--color-info)", paused: "var(--color-warning)", completed: "var(--color-latte)",
};
const ACT_ICON = {
  call: PhoneCall, topup: Coins, plan: RefreshCw, campaign: Megaphone, ticket: Clock3, login: UserRound,
} as const;

function UsageStat({ icon: Icon, label, v }: { icon: typeof PhoneCall; label: string; v: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-latte"><Icon className="size-3.5" /><span className={monoLabel}>{label}</span></div>
      <div className="mt-1 font-serif text-[18px] font-semibold text-coffee tabular-nums">{v}</div>
    </div>
  );
}
function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className={monoLabel}>{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-coffee">{value}</div>
    </div>
  );
}
function ConfigRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
      {value}
    </div>
  );
}
function Tag({ children, c }: { children: React.ReactNode; c: string }) {
  return <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: `color-mix(in srgb, ${c} 14%, #fffdf9)`, color: `color-mix(in srgb, ${c} 78%, #2a1a0f)` }}>{children}</span>;
}
