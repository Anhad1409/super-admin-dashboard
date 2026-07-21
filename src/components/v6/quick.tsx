"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Sparkles, Bot, GitBranch, Target, ListChecks, ArrowRight, PartyPopper } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { products, phoneNumbers, scoreBands, type Product } from "@/lib/campaign-config-mock";
import { SetupGuideButton } from "@/components/setup-guide/setup-guide";
import { LeadUpload, type LeadUploadInfo } from "@/components/campaigns/lead-upload";

const STEPS = ["Product", "Details", "Review", "Leads"];
const inputCls = "w-full rounded-lg border border-foam bg-card px-3 py-2 text-sm text-coffee outline-none focus:border-caramel focus:ring-1 focus:ring-caramel/30";

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-1 items-center last:flex-none">
          <div className="flex items-center gap-2">
            <span className={cn("flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              i < step ? "bg-success text-white" : i === step ? "bg-brand text-brand-foreground" : "bg-foam text-muted-foreground")}>
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("text-sm font-medium", i === step ? "text-coffee" : "text-muted-foreground")}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div className={cn("mx-3 h-px flex-1", i < step ? "bg-success/40" : "bg-foam")} />}
        </div>
      ))}
    </div>
  );
}

export function V6Quick() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [created, setCreated] = useState(false);
  const [leads, setLeads] = useState<LeadUploadInfo>({ state: "empty", fileName: "", total: 0, valid: 0, invalid: 0 });

  const pick = (p: Product) => { setProduct(p); setName(`${p.name} Campaign`); setStep(1); };
  const resolved = product && [
    { icon: GitBranch, label: "Conversation Flow", value: product.flow },
    { icon: Target, label: "Scoring", value: `${product.scoring} · hot ≥${scoreBands.hot}, warm ≥${scoreBands.warm}` },
    { icon: ListChecks, label: "Lead Schema", value: `${product.schema} · ${product.fields} fields` },
    { icon: Bot, label: "Voice", value: product.voice },
    { icon: Sparkles, label: "LLM", value: product.llm },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Quick Campaign" subtitle="Pick a product, name it, upload leads — configs auto-resolve." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
      <div className="rounded-2xl border border-foam bg-porcelain p-7 shadow-glass">
        <Stepper step={created && step === 3 ? 4 : step} />

        {/* STEP 1 — PRODUCT */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-coffee">Select a product</h2>
            <p className="mt-1 text-sm text-muted-foreground">Everything else auto-resolves from the product's template.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {products.map((p) => (
                <button key={p.id} onClick={() => pick(p)} className="group rounded-xl border border-foam bg-card p-4 text-left transition-all hover:border-caramel hover:shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mocha">{p.category}</span>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="mt-2 font-serif text-base font-semibold text-coffee">{p.name}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — DETAILS */}
        {step === 1 && product && (
          <div>
            <h2 className="text-lg font-semibold text-coffee">Campaign details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Based on <span className="font-medium text-coffee">{product.name}</span>.</p>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5"><label className="text-sm font-medium text-coffee">Campaign Name <span className="text-danger">*</span></label><Input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium text-coffee">Description</label><Input placeholder="Internal note — not heard by callers" className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-sm font-medium text-coffee">Agent Name</label><Input placeholder="Defaults to product's agent" className={inputCls} /></div>
                <div className="space-y-1.5"><label className="text-sm font-medium text-coffee">Phone Number</label><select className={inputCls}>{phoneNumbers.map((n) => <option key={n.id}>{n.label}</option>)}</select></div>
              </div>
            </div>
            <div className="mt-7 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(0)} className="gap-1.5 text-mocha"><ChevronLeft className="size-4" /> Back</Button>
              <Button onClick={() => setStep(2)} disabled={!name.trim()} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark">Review <ArrowRight className="size-4" /></Button>
            </div>
          </div>
        )}

        {/* STEP 3 — REVIEW */}
        {step === 2 && product && !created && (
          <div>
            <h2 className="text-lg font-semibold text-coffee">Review</h2>
            <p className="mt-1 text-sm text-muted-foreground">Auto-resolved from <span className="font-medium text-coffee">{product.name}</span>. Override any of it later on the campaign page.</p>
            <div className="mt-5 rounded-xl border border-foam bg-card p-2">
              <div className="flex items-center justify-between border-b border-foam px-3 py-2.5"><span className="text-sm font-semibold text-coffee">{name}</span><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-mocha">{product.category}</span></div>
              {resolved!.map((r) => { const Icon = r.icon; return (
                <div key={r.label} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-mocha"><Icon className="size-3.5" /></span>
                  <div className="flex-1"><div className="text-xs text-muted-foreground">{r.label}</div><div className="text-sm text-coffee">{r.value}</div></div>
                  <Check className="size-4 text-success" />
                </div>
              ); })}
            </div>
            <div className="mt-7 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} className="gap-1.5 text-mocha"><ChevronLeft className="size-4" /> Back</Button>
              <Button onClick={() => { setCreated(true); setStep(3); toast({ title: "Campaign created", body: `“${name}” saved as draft.`, severity: "success" }); }} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark">Create Campaign <Check className="size-4" /></Button>
            </div>
          </div>
        )}

        {/* STEP 4 — LEADS */}
        {step === 3 && created && (
          <div>
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/8 px-4 py-3">
              <PartyPopper className="size-5 text-success" />
              <div><div className="text-sm font-semibold text-coffee">Campaign created — it's in draft</div><div className="text-xs text-muted-foreground">Upload leads now, then activate it from the campaign page.</div></div>
            </div>

            <LeadUpload onChange={setLeads} />

            <div className="mt-7 flex items-center justify-end gap-2">
              {leads.state !== "done" && <Button variant="ghost" onClick={() => router.push("/campaigns")} className="text-mocha">Skip for now</Button>}
              <Button onClick={() => router.push("/campaigns")} className="gap-1.5 bg-coffee text-cream hover:bg-espresso">Go to Campaign <ArrowRight className="size-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* LIVE SUMMARY */}
      <aside className="h-fit rounded-2xl border border-foam bg-porcelain p-5 shadow-glass lg:sticky lg:top-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mocha"><Sparkles className="size-3.5 text-caramel" /> Live summary</div>
        <div className="mt-2 font-serif text-lg font-semibold text-coffee">{name || <span className="text-muted-foreground">Untitled campaign</span>}</div>
        <div className="mt-1">{product ? <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-mocha">{product.category}</span> : <span className="text-xs text-muted-foreground">No product selected</span>}</div>
        <div className="mt-4 space-y-2.5 border-t border-foam pt-3">
          {product ? resolved!.map((r) => { const Icon = r.icon; return (
            <div key={r.label} className="flex items-start gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
              <div className="min-w-0"><div className="text-[11px] text-muted-foreground">{r.label}</div><div className="truncate text-xs font-medium text-coffee">{r.value}</div></div>
            </div>
          ); }) : <p className="text-xs text-muted-foreground">Pick a product — its template auto-resolves the conversation flow, scoring, lead schema, voice &amp; LLM.</p>}
        </div>
        <div className="mt-4 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel transition-all" style={{ width: `${((created ? 4 : step + 1) / 4) * 100}%` }} /></div><span className="font-data text-[11px] text-muted-foreground">{created ? 4 : step + 1}/4</span></div>
        {leads.state === "done" && <div className="mt-2 flex items-center gap-1.5 text-xs text-success"><Check className="size-3.5" /> {leads.valid} lead{leads.valid === 1 ? "" : "s"} imported</div>}
      </aside>
      </div>
    </div>
  );
}
