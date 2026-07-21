"use client";

/* LeadUpload — the shared "get your list in" block for campaign creation.
   Really parses the chosen CSV in the browser (header detection, phone-column
   match, per-row validation) so the preview shows THE USER'S rows, not canned
   ones. Paste-numbers fallback + a sample file for demos. Mock stops at
   "import" (no backend). */

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, Check, ClipboardList, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

export type LeadUploadInfo = {
  state: "empty" | "preview" | "done";
  fileName: string;
  total: number;
  valid: number;
  invalid: number;
};

const EMPTY: LeadUploadInfo = { state: "empty", fileName: "", total: 0, valid: 0, invalid: 0 };

type Parsed = {
  headers: string[];
  rows: string[][]; // first few data rows for preview
  total: number;
  valid: number;
  phoneCol: number;
};

const PHONE_RE = /phone|mobile|msisdn|number|contact/i;
const digits = (s: string) => s.replace(/\D/g, "");
const isValidPhone = (s: string) => { const d = digits(s); return d.length >= 10 && d.length <= 13; };

function splitCsvLine(line: string): string[] {
  // minimal CSV split with quoted-field support — enough for lead lists
  const out: string[] = [];
  let cur = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === "," && !inQ) { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseCsv(text: string): Parsed | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  const first = splitCsvLine(lines[0]);
  const headerish = first.some((c) => PHONE_RE.test(c)) || first.every((c) => !isValidPhone(c));
  const headers = headerish ? first.map((h) => h.toLowerCase().replace(/\s+/g, "_")) : first.map((_, i) => (i === 0 ? "phone" : `col_${i + 1}`));
  const data = (headerish ? lines.slice(1) : lines).map(splitCsvLine);
  if (!data.length) return null;
  let phoneCol = headers.findIndex((h) => PHONE_RE.test(h));
  if (phoneCol === -1) {
    // fall back to the column where most values look like phone numbers
    const scores = headers.map((_, c) => data.reduce((s, r) => s + (isValidPhone(r[c] ?? "") ? 1 : 0), 0));
    phoneCol = scores.indexOf(Math.max(...scores));
  }
  const valid = data.reduce((s, r) => s + (isValidPhone(r[phoneCol] ?? "") ? 1 : 0), 0);
  return { headers, rows: data.slice(0, 3), total: data.length, valid, phoneCol };
}

const SAMPLE_CSV = "phone,full_name,email\n9115551310,Rohit Sharma,rohit@acme.in\n8699940412,Anita Desai,anita@acme.in";

export function LeadUpload({ onChange, note }: {
  onChange?: (info: LeadUploadInfo) => void;
  note?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasted, setPasted] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [done, setDone] = useState(false);

  const emit = useCallback((info: LeadUploadInfo) => onChange?.(info), [onChange]);

  const loadText = (text: string, name: string) => {
    const p = parseCsv(text);
    if (!p) { toast({ title: "Couldn't read the file", body: "No rows found — check it's a CSV with one lead per line.", severity: "warning" }); return; }
    setParsed(p); setFileName(name); setPasteMode(false); setDone(false);
    emit({ state: "preview", fileName: name, total: p.total, valid: p.valid, invalid: p.total - p.valid });
  };

  const onFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!/\.(csv|txt)$/i.test(f.name)) {
      toast({ title: "CSV or TXT only", body: "Using Excel? Save your sheet as CSV first (File → Save As → CSV).", severity: "warning" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => loadText(String(reader.result ?? ""), f.name);
    reader.readAsText(f);
  };

  const usePasted = () => {
    const rows = pasted.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!rows.length) return;
    loadText("phone\n" + rows.join("\n"), "pasted-numbers");
  };

  const reset = () => { setParsed(null); setFileName(""); setDone(false); setPasted(""); emit(EMPTY); };

  const doImport = () => {
    if (!parsed) return;
    setDone(true);
    emit({ state: "done", fileName, total: parsed.total, valid: parsed.valid, invalid: parsed.total - parsed.valid });
    toast({ title: "Leads imported", body: `${parsed.valid} lead${parsed.valid === 1 ? "" : "s"} imported${parsed.total - parsed.valid ? ` · ${parsed.total - parsed.valid} skipped (invalid phone)` : ""}.`, severity: "success" });
  };

  /* ---------- done ---------- */
  if (done && parsed) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/8 p-5 text-center">
        <Check className="mx-auto size-7 text-success" />
        <div className="mt-2 text-sm font-semibold text-coffee">{parsed.valid} lead{parsed.valid === 1 ? "" : "s"} imported</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {parsed.total - parsed.valid > 0 && <>{parsed.total - parsed.valid} row{parsed.total - parsed.valid === 1 ? "" : "s"} skipped (invalid phone) · </>}
          DNC scrub runs automatically before any dialing.
        </div>
        <button onClick={reset} className="mt-3 text-xs font-medium text-mocha underline-offset-4 hover:underline">Upload a different file</button>
      </div>
    );
  }

  /* ---------- preview ---------- */
  if (parsed) {
    const invalid = parsed.total - parsed.valid;
    return (
      <div className="rounded-2xl border border-foam bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-coffee"><FileText className="size-4 text-mocha" /> {fileName}</div>
          <button onClick={reset} aria-label="Remove file" className="rounded-md p-1 text-latte hover:bg-foam hover:text-coffee"><X className="size-4" /></button>
        </div>

        {/* column mapping */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {parsed.headers.map((h, i) => (
            <span key={`${h}-${i}`} className={cn("rounded-full border px-2 py-0.5 font-[family-name:var(--font-data)] text-[10px]",
              i === parsed.phoneCol ? "border-success/30 bg-success/10 text-success" : "border-foam bg-oat/50 text-mocha")}>
              {h}{i === parsed.phoneCol && " ✓"}
            </span>
          ))}
        </div>

        {/* counts */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-oat/50 py-2"><div className="font-serif text-xl font-semibold text-coffee tabular-nums">{parsed.total}</div><div className="text-[11px] text-muted-foreground">rows</div></div>
          <div className="rounded-lg bg-success/10 py-2"><div className="font-serif text-xl font-semibold text-success tabular-nums">{parsed.valid}</div><div className="text-[11px] text-muted-foreground">valid</div></div>
          <div className={cn("rounded-lg py-2", invalid ? "bg-danger/10" : "bg-foam")}><div className={cn("font-serif text-xl font-semibold tabular-nums", invalid ? "text-danger" : "text-mocha")}>{invalid}</div><div className="text-[11px] text-muted-foreground">invalid</div></div>
        </div>

        {/* first rows */}
        <div className="mt-3 overflow-x-auto rounded-lg border border-foam/70">
          <table className="w-full text-left font-[family-name:var(--font-data)] text-[11px]">
            <thead><tr className="border-b border-foam/70 bg-oat/40 text-mocha">{parsed.headers.map((h, i) => <th key={`${h}-${i}`} className="px-2.5 py-1.5 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {parsed.rows.map((r, i) => (
                <tr key={i} className="border-b border-foam/50 text-coffee last:border-b-0">
                  {parsed.headers.map((_, c) => <td key={c} className="max-w-[140px] truncate px-2.5 py-1.5">{r[c] ?? ""}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button onClick={doImport} disabled={parsed.valid === 0} className="mt-4 w-full gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark">
          <UploadCloud className="size-4" /> Import {parsed.valid} lead{parsed.valid === 1 ? "" : "s"}
        </Button>
        {parsed.valid === 0 && <p className="mt-2 text-center text-xs text-danger">No valid phone numbers found — check the phone column.</p>}
      </div>
    );
  }

  /* ---------- empty: dropzone or paste ---------- */
  return (
    <div>
      {!pasteMode ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0]); }}
          onClick={() => fileRef.current?.click()}
          role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-colors",
            drag ? "border-caramel bg-oat/60" : "border-latte bg-oat/30 hover:border-caramel hover:bg-oat/50",
          )}
        >
          <UploadCloud className="size-7 text-caramel" />
          <div className="text-sm font-medium text-coffee">Drop a CSV here, or click to browse</div>
          <div className="text-xs text-muted-foreground">
            Required column: <span className="font-[family-name:var(--font-data)]">phone</span> · optional: full_name, email + your schema fields.
            Using Excel? Save as CSV first.
          </div>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
      ) : (
        <div className="rounded-2xl border border-foam bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-coffee"><ClipboardList className="size-4 text-mocha" /> Paste numbers — one per line</div>
          <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={5} autoFocus
            placeholder={"9115551310\n8699940412"}
            className="mt-2.5 w-full resize-y rounded-lg border border-foam bg-cream px-3 py-2 font-[family-name:var(--font-data)] text-[13px] text-coffee outline-none focus:border-caramel" />
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={usePasted} disabled={!pasted.trim()} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark">Preview list</Button>
            <Button size="sm" variant="ghost" onClick={() => setPasteMode(false)} className="text-mocha">Back to file upload</Button>
          </div>
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs">
          {!pasteMode && (
            <button onClick={() => setPasteMode(true)} className="font-medium text-caramel underline-offset-4 hover:underline">Paste numbers instead</button>
          )}
          <button onClick={() => loadText(SAMPLE_CSV, "sample-leads.csv")} className="text-mocha underline-offset-4 hover:underline">Use a sample file (demo)</button>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-mocha"><ShieldCheck className="size-3.5 text-success" /> DNC-scrubbed before dialing</span>
      </div>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
