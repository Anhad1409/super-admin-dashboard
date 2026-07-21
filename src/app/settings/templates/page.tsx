"use client";

/* Settings → Templates — the product template library by vertical:
   collections, surveys and more, with category counts (from the Jul-15 dive). */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, LayoutTemplate, ChevronRight, Lock, Search } from "lucide-react";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

type Tpl = { name: string; desc: string; cat: string };
const TPLS: Tpl[] = [
  { name: "Credit Card Payment Reminder", desc: "Credit card minimum-due reminder — interest cost awareness, revolving balance education.", cat: "collections" },
  { name: "Debt Recovery / Overdue Collection", desc: "Collect overdue payments with compliance — RBI guidelines, no harassment.", cat: "collections" },
  { name: "EMI Follow-up / Payment Reminder", desc: "Gentle EMI payment reminders before due date or immediately after.", cat: "collections" },
  { name: "Home Loan EMI Collection", desc: "Home loan EMI collection — higher stakes, SARFAESI awareness, restructure options.", cat: "collections" },
  { name: "Legal Pre-intimation Call", desc: "Pre-SARFAESI / pre-legal notice call — last chance to resolve before legal.", cat: "collections" },
  { name: "Loan Recovery — Automated Collection & PTP", desc: "Full-cycle loan recovery bot — automated payment reminders and promise-to-pay capture.", cat: "collections" },
  { name: "Personal Loan EMI Collection", desc: "Product-specific PL EMI collection — income-based negotiation, hardship routing.", cat: "collections" },
  { name: "Promise-to-Pay Follow-up", desc: "Follow up on previous payment commitments — did they pay? If not, re-commit.", cat: "collections" },
  { name: "Settlement / Restructuring Offer", desc: "Offer one-time settlement or loan restructuring to long-overdue accounts.", cat: "collections" },
  { name: "Customer Satisfaction (CSAT/NPS)", desc: "Post-interaction CSAT/NPS surveys with verbatim capture.", cat: "surveys" },
  { name: "Market Research / Product Feedback", desc: "Gather market insights — product fit, pricing sensitivity, seasonal demand.", cat: "surveys" },
  { name: "Post-Purchase / Service Feedback", desc: "Post-purchase experience survey — delivery, onboarding, early issues.", cat: "surveys" },
  { name: "KYC / VKYC Reminder", desc: "Video-KYC completion nudges with slot booking and link resend.", cat: "onboarding" },
  { name: "Loan Onboarding & Disbursal Update", desc: "Keep applicants warm — document checklist, disbursal timelines.", cat: "onboarding" },
  { name: "Lead Qualification — Personal Loan", desc: "Intent + eligibility screen for PL leads with income capture.", cat: "sales" },
  { name: "Fixed Deposit Renewal Offer", desc: "Maturity outreach — renewal rates, sweep-in options, senior benefits.", cat: "sales" },
];

export default function TemplatesPage() {
  const [q, setQ] = useState("");
  const cats = [...new Set(TPLS.map((t) => t.cat))];
  const shown = TPLS.filter((t) => !q || `${t.name} ${t.desc}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to Settings</Link>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 font-serif text-3xl font-semibold tracking-tight text-coffee"><LayoutTemplate className="size-6 text-caramel" /> Templates</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{TPLS.length} pre-built campaign templates across {cats.length} verticals — flow, schema, scoring and outcomes bundled. One click in the wizard imports everything.</p>
        </div>
        <label className="flex h-9 w-64 items-center gap-2 rounded-full border border-foam bg-porcelain px-3.5 shadow-glass focus-within:border-caramel">
          <Search className="size-4 text-latte" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates…" className="w-full bg-transparent text-[13px] text-coffee outline-none placeholder:text-latte" />
        </label>
      </div>

      {cats.map((cat) => {
        const list = shown.filter((t) => t.cat === cat);
        if (!list.length) return null;
        return (
          <section key={cat} className="mb-7">
            <h2 className="mb-2.5 flex items-center gap-2 font-serif text-lg font-semibold capitalize text-coffee">
              {cat} <span className="rounded-full bg-oat px-2 py-0.5 font-data text-[11px] text-mocha">{list.length}</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((t) => (
                <button key={t.name} onClick={() => toast({ title: t.name, body: "Opens the template detail — import it from the campaign wizard's Conversation step.", severity: "info" })}
                  className="group flex flex-col rounded-2xl border border-foam bg-porcelain p-4 text-left shadow-glass transition-all hover:-translate-y-0.5 hover:border-caramel hover:shadow-glass-hover">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-snug text-coffee">{t.name}</h3>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      cat === "collections" ? "bg-warning/10 text-warning" : cat === "surveys" ? "bg-steam/10 text-steam" : cat === "sales" ? "bg-success/10 text-success" : "bg-info/10 text-info")}>{cat}</span>
                  </div>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-oat/80 px-2 py-0.5 text-[10px] font-medium text-mocha"><Lock className="size-3" /> System</span>
                    <ChevronRight className="size-4 text-latte transition-transform group-hover:translate-x-0.5 group-hover:text-caramel" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
