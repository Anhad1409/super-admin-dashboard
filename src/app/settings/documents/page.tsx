"use client";

/* Settings → Documents — the AI knowledge base + RAG Retrieval Testing panel
   (from the Jul-15 dive): doc cards with extraction state, hidden-from-agent
   toggles, and a query harness with Top-K / similarity / rerank controls. */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Globe, UploadCloud, Search, FlaskConical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { GlazedTile, ACCENT } from "@/components/settings/glaze";
import { monoLabel } from "@/components/v7/kit";


type Doc = { name: string; file: string; type: string; size: string; date: string; extracted: boolean; hidden: boolean };
const SEED: Doc[] = [
  { name: "frq_question", file: "frq_question.pdf", type: "Other", size: "17.8 KB", date: "22/6/2026", extracted: true, hidden: false },
  { name: "fd_issuer_products", file: "fd_issuer_products.pdf", type: "Other", size: "60.3 KB", date: "22/6/2026", extracted: true, hidden: false },
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState(SEED);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [debug, setDebug] = useState(false);
  const [rerank, setRerank] = useState(false);
  const [topK, setTopK] = useState(10);
  const [minSim, setMinSim] = useState(0.25);
  const [results, setResults] = useState<{ doc: string; chunk: string; score: number }[] | null>(null);

  const runRetrieval = () => {
    if (!query.trim()) { toast({ title: "Type a query first", body: "e.g. What is the interest rate for a personal loan?", severity: "warning" }); return; }
    const base = [
      { doc: "fd_issuer_products.pdf", chunk: "…Shivalik Small Finance Bank FD at 8.0% p.a. for 12–24 months; senior citizens +0.5%…", score: 0.91 },
      { doc: "fd_issuer_products.pdf", chunk: "…premature withdrawal penalty of 1% applies below 6 months tenure…", score: 0.74 },
      { doc: "frq_question.pdf", chunk: "…personal loan rates start at 11.5% for salaried applicants with CIBIL ≥ 750…", score: 0.63 },
      { doc: "frq_question.pdf", chunk: "…processing fee up to 2% + GST, waived during festive campaigns…", score: 0.41 },
    ].filter((r) => r.score >= minSim).slice(0, topK);
    setResults(rerank ? [...base].sort((a, b) => b.score - a.score) : base);
    toast({ title: "Retrieval complete", body: `${base.length} chunks ≥ ${minSim} similarity${rerank ? " · reranked" : ""}.`, severity: "success" });
  };

  const shown = docs.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to Settings</Link>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-3xl font-semibold tracking-tight text-coffee"><GlazedTile icon={FileText} tint={ACCENT.ai} size="lg" /> Documents</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">The agent&apos;s knowledge base — uploaded docs are chunked, embedded and searchable mid-call via the Search Knowledge Base skill.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast({ title: "Add from website", body: "Paste a URL — we crawl and extract the page into the knowledge base.", severity: "info" })} className="gap-1.5 border-foam text-mocha hover:text-coffee"><Globe className="size-4" /> Add from Website</Button>
          <Button onClick={() => { setDocs((d) => [...d, { name: `rate_card_v${d.length}`, file: `rate_card_v${d.length}.pdf`, type: "Other", size: "24.1 KB", date: "15/7/2026", extracted: false, hidden: false }]); toast({ title: "Uploading…", body: "Extraction starts automatically after upload.", severity: "info" }); setTimeout(() => setDocs((d) => d.map((x, i) => (i === d.length - 1 ? { ...x, extracted: true } : x))), 1800); }} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark"><UploadCloud className="size-4" /> Upload Document</Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <label className="flex h-9 w-64 items-center gap-2 rounded-full border border-foam bg-porcelain px-3.5 shadow-glass focus-within:border-caramel">
          <Search className="size-4 text-latte" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name…" className="w-full bg-transparent text-[13px] text-coffee outline-none placeholder:text-latte" />
        </label>
        <span className="text-xs text-muted-foreground">{shown.length} document{shown.length === 1 ? "" : "s"}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((d, i) => (
          <div key={d.file} className="rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <GlazedTile icon={FileText} tint="var(--color-danger)" />
                <div>
                  <div className="text-sm font-semibold text-coffee">{d.name}</div>
                  <div className="font-data text-[11px] text-muted-foreground">{d.file}</div>
                </div>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", d.extracted ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{d.extracted ? "✓ Extracted" : "Extracting…"}</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-full bg-oat/80 px-2 py-0.5 font-medium text-mocha">{d.type}</span>{d.size} · {d.date}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-oat/40 px-3 py-2">
              <span className="text-xs text-coffee">Hidden from agent</span>
              <button role="switch" aria-checked={d.hidden}
                onClick={() => { setDocs((x) => x.map((y, j) => (j === i ? { ...y, hidden: !y.hidden } : y))); toast({ title: d.hidden ? "Visible to agent" : "Hidden from agent", body: `${d.name} ${d.hidden ? "is back in retrieval." : "won't be retrieved on calls."}`, severity: "info" }); }}
                className={cn("relative h-5 w-9 rounded-full transition-colors", d.hidden ? "bg-warning" : "bg-foam")}>
                <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", d.hidden ? "left-[18px]" : "left-0.5")} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => toast({ title: "Linked campaigns", body: "Used by: Outreach campaign, IOB Mobile Banking Activation.", severity: "info" })} className="rounded-full border border-foam px-2.5 py-1 text-xs font-medium text-mocha hover:border-caramel">Campaigns</button>
              <button onClick={() => { setDocs((x) => x.filter((_, j) => j !== i)); toast({ title: "Moved to trash", body: `${d.name} removed — restorable for 30 days.`, severity: "warning" }); }} className="inline-flex items-center gap-1 rounded-full border border-foam px-2.5 py-1 text-xs font-medium text-mocha hover:border-danger hover:text-danger"><Trash2 className="size-3" /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* retrieval testing */}
      <section className="mt-6 rounded-2xl border border-foam bg-porcelain p-6 shadow-glass">
        <div className="flex flex-wrap items-center gap-3">
          <GlazedTile icon={FlaskConical} tint={ACCENT.comms} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-semibold text-coffee">Retrieval Testing</h2>
            <p className="text-sm text-muted-foreground">Inspect what the RAG pipeline retrieves before the LLM answers — verify chunking, embeddings, vector search, and reranking.</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-mocha">Debug Mode
            <button role="switch" aria-checked={debug} onClick={() => setDebug((v) => !v)} className={cn("relative h-5 w-9 rounded-full transition-colors", debug ? "bg-steam" : "bg-foam")}>
              <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", debug ? "left-[18px]" : "left-0.5")} />
            </button>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <div className={monoLabel}>Query</div>
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={2} placeholder="e.g. What is the interest rate for a personal loan?"
              className="mt-1 w-full resize-y rounded-xl border border-foam bg-cream px-3.5 py-2.5 text-sm text-coffee outline-none focus:border-caramel" />
          </div>
          <Button onClick={runRetrieval} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark"><Search className="size-4" /> Run Retrieval</Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-oat/40 p-3.5 sm:grid-cols-4">
          <div>
            <div className={monoLabel}>Scope</div>
            <select className="mt-1 w-full rounded-lg border border-foam bg-porcelain px-2.5 py-1.5 text-[12px] text-coffee outline-none focus:border-caramel"><option>Whole KB</option>{docs.map((d) => <option key={d.file}>{d.file}</option>)}</select>
          </div>
          <div>
            <div className={monoLabel}>Top-K</div>
            <input type="number" value={topK} onChange={(e) => setTopK(Math.max(1, +e.target.value))} className="mt-1 w-full rounded-lg border border-foam bg-porcelain px-2.5 py-1.5 text-right font-data text-[12px] text-coffee outline-none focus:border-caramel" />
          </div>
          <div>
            <div className={monoLabel}>Min similarity</div>
            <input type="number" step={0.05} min={0} max={1} value={minSim} onChange={(e) => setMinSim(Math.min(1, Math.max(0, +e.target.value)))} className="mt-1 w-full rounded-lg border border-foam bg-porcelain px-2.5 py-1.5 text-right font-data text-[12px] text-coffee outline-none focus:border-caramel" />
          </div>
          <div>
            <div className={monoLabel}>Rerank</div>
            <label className="mt-1 flex h-[34px] items-center gap-2 text-xs text-mocha">
              <button role="switch" aria-checked={rerank} onClick={() => setRerank((v) => !v)} className={cn("relative h-5 w-9 rounded-full transition-colors", rerank ? "bg-success" : "bg-foam")}>
                <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", rerank ? "left-[18px]" : "left-0.5")} />
              </button>
              Cross-encoder
            </label>
          </div>
        </div>

        {results && (
          <div className="mt-4 space-y-2">
            {results.map((r, i) => (
              <div key={i} className="rounded-xl border border-foam bg-card px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-data text-[11px] text-mocha">{r.doc}</span>
                  <span className={cn("ml-auto rounded-full px-2 py-0.5 font-data text-[10px] font-semibold", r.score >= 0.7 ? "bg-success/10 text-success" : r.score >= 0.5 ? "bg-warning/10 text-warning" : "bg-oat text-mocha")}>{r.score.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-[13px] text-coffee/90">{r.chunk}</p>
                {debug && <p className="mt-1 font-data text-[10px] text-latte">chunk_id=ch_{i + 1}a7f · embedder=text-embedding-3-small · dims=1536{rerank ? " · reranker=bge-reranker-v2" : ""}</p>}
              </div>
            ))}
            {results.length === 0 && <p className="text-sm text-muted-foreground">Nothing above the similarity floor — lower Min similarity or upload richer documents.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
