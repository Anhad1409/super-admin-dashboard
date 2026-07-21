"use client";

/* Settings → Email Configuration — providers + the pre-approved templates
   the agent can send mid-call (from the Jul-15 dive). */

import { useState } from "react";
import { Mail, FileText, Plus, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { SettingsShell, HowItWorks } from "@/components/settings/settings-shell";

type Provider = { name: string; from: string; def: boolean };
type Tpl = { name: string; subject: string };

export default function EmailConfigPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [adding, setAdding] = useState(false);
  const [pName, setPName] = useState("Resend");
  const [pFrom, setPFrom] = useState("");
  const [tpls, setTpls] = useState<Tpl[]>([]);
  const [addingTpl, setAddingTpl] = useState(false);
  const [tName, setTName] = useState("");
  const [tSubject, setTSubject] = useState("");

  const addProvider = () => {
    if (!/.+@.+\..+/.test(pFrom)) { toast({ title: "Sender address needed", body: "Enter the from-address this provider is verified for.", severity: "warning" }); return; }
    setProviders((p) => [...p, { name: pName, from: pFrom, def: p.length === 0 }]);
    setAdding(false); setPFrom("");
    toast({ title: "Provider connected", body: `${pName} verified — the agent can now send email templates.`, severity: "success" });
  };

  const addTpl = () => {
    if (!tName.trim()) return;
    setTpls((t) => [...t, { name: tName.trim(), subject: tSubject.trim() || "—" }]);
    setAddingTpl(false); setTName(""); setTSubject("");
    toast({ title: "Template added", body: "Attach it to campaigns in the wizard's Email & SMS step.", severity: "success" });
  };

  return (
    <SettingsShell icon={Mail} tint="var(--color-steam)" title="Email Configuration"
      blurb="Connect one or more email providers (Resend, SendGrid, or any SMTP host) for outbound email."
      status={providers.length > 0 ? <span className="rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">● {providers.length} provider{providers.length === 1 ? "" : "s"} live</span> : undefined}
      aside={<HowItWorks tint="var(--color-steam)" steps={[
        { t: "Connect a provider", d: "Verify the from-address your domain sends as." },
        { t: "Write templates", d: "Pre-approved emails with {placeholders} — the agent can never freestyle." },
        { t: "Attach in the wizard", d: "Campaigns pick templates in the Email & SMS step." },
      ]} />}
    >
      {/* providers */}
      <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-semibold text-coffee">Email Providers</h2>
            <p className="text-xs text-muted-foreground">Active email sender configurations for this organization.</p>
          </div>
          <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Add Provider</Button>
        </div>

        {adding && (
          <div className="mt-4 grid gap-2.5 rounded-xl border border-caramel/40 bg-card p-4 sm:grid-cols-[160px_1fr_auto_auto]">
            <select value={pName} onChange={(e) => setPName(e.target.value)} className="rounded-lg border border-foam bg-cream px-3 py-2 text-sm text-coffee outline-none focus:border-caramel">
              <option>Resend</option><option>SendGrid</option><option>SMTP</option>
            </select>
            <input value={pFrom} onChange={(e) => setPFrom(e.target.value)} placeholder="from address — offers@yourcompany.in" autoFocus
              className="rounded-lg border border-foam bg-cream px-3 py-2 font-data text-sm text-coffee outline-none focus:border-caramel" />
            <Button size="sm" onClick={addProvider} className="bg-brand text-brand-foreground hover:bg-brand-dark">Verify &amp; add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-mocha">Cancel</Button>
          </div>
        )}

        {providers.length === 0 && !adding ? (
          <p className="mt-4 text-sm text-muted-foreground">No email providers yet. Add one to start sending.</p>
        ) : (
          <ul className="mt-4 divide-y divide-foam/70">
            {providers.map((p, i) => (
              <li key={p.name + i} className="flex flex-wrap items-center gap-3 py-3">
                <span className="grid size-9 place-items-center rounded-xl bg-secondary text-brand"><Mail className="size-4" /></span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-coffee">{p.name}
                    {p.def && <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">Default</span>}
                  </div>
                  <div className="font-data text-[11px] text-muted-foreground">{p.from}</div>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success"><ShieldCheck className="size-3" /> Verified</span>
                <button onClick={() => { setProviders((x) => x.filter((_, j) => j !== i)); toast({ title: "Provider removed", body: `${p.name} disconnected.`, severity: "warning" }); }} aria-label={`Remove ${p.name}`} className="text-latte hover:text-danger"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* templates */}
      <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-semibold text-coffee">Email Templates</h2>
            <p className="text-xs text-muted-foreground">Pre-approved emails the AI agent can send on a call. Use {"{placeholders}"} for details like {"{full_name}"}.</p>
          </div>
          <Button size="sm" disabled={providers.length === 0} onClick={() => setAddingTpl(true)}
            className={cn("gap-1.5", providers.length === 0 ? "bg-foam text-mocha" : "bg-brand text-brand-foreground hover:bg-brand-dark")}>
            <Plus className="size-4" /> {providers.length === 0 ? "Add an account first" : "Add template"}
          </Button>
        </div>

        {addingTpl && (
          <div className="mt-4 grid gap-2.5 rounded-xl border border-caramel/40 bg-card p-4">
            <input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Template name — e.g. Sanction letter" autoFocus className="rounded-lg border border-foam bg-cream px-3 py-2 text-sm text-coffee outline-none focus:border-caramel" />
            <input value={tSubject} onChange={(e) => setTSubject(e.target.value)} placeholder="Subject — supports {full_name}, {company}…" className="rounded-lg border border-foam bg-cream px-3 py-2 text-sm text-coffee outline-none focus:border-caramel" />
            <div className="flex gap-2">
              <Button size="sm" onClick={addTpl} disabled={!tName.trim()} className="bg-brand text-brand-foreground hover:bg-brand-dark">Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setAddingTpl(false)} className="text-mocha">Cancel</Button>
            </div>
          </div>
        )}

        {tpls.length === 0 && !addingTpl ? (
          <p className="mt-4 text-sm text-muted-foreground">No email templates yet. Add one so the agent can send it during calls.</p>
        ) : (
          <ul className="mt-4 divide-y divide-foam/70">
            {tpls.map((t, i) => (
              <li key={t.name + i} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-coffee">{t.name}</div>
                  <div className="truncate font-data text-[11px] text-muted-foreground">{t.subject}</div>
                </div>
                <button onClick={() => { setTpls((x) => x.filter((_, j) => j !== i)); toast({ title: "Template removed", severity: "warning", body: `“${t.name}” deleted.` }); }} aria-label={`Remove ${t.name}`} className="text-latte hover:text-danger"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </SettingsShell>
  );
}
