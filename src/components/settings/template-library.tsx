"use client";

/* Shared scaffold for the three reusable-config template libraries —
   SettingsShell frame, at-a-glance strip, icon-tiled cards, working
   create/delete. */

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Plus, Trash2, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { SettingsShell, HowItWorks } from "@/components/settings/settings-shell";
import { GlazedTile } from "@/components/settings/glaze";

export type SeedTpl = { name: string; desc: string; meta: string; system?: boolean };

export function TemplateLibrary({ icon: Icon, title, blurb, noun, seed, createBody, tint = "var(--color-caramel)" }: {
  icon: LucideIcon; title: string; blurb: string; noun: string; seed: SeedTpl[]; createBody: string; tint?: string;
}) {
  const [tpls, setTpls] = useState<SeedTpl[]>(seed);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const systemN = tpls.filter((t) => t.system).length;

  const create = () => {
    if (!name.trim()) { toast({ title: "Name it first", body: `Give the ${noun} a recognisable name.`, severity: "warning" }); return; }
    setTpls((t) => [...t, { name: name.trim(), desc: createBody, meta: "Custom · created today" }]);
    setCreating(false); setName("");
    toast({ title: "Template created", body: `“${name.trim()}” is available in the campaign wizard.`, severity: "success" });
  };

  return (
    <SettingsShell icon={Icon} title={title} blurb={blurb} tint={tint}
      actions={<Button onClick={() => setCreating(true)} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark"><Plus className="size-4" /> Create template</Button>}
      aside={<HowItWorks title="Import safety" tint={tint} steps={[
        { t: "Pick a template in the wizard", d: "The matching step offers a one-click import." },
        { t: "Cross-checked before import", d: "Keys that don't match the campaign's lead schema are dropped — nothing imports silently broken." },
        { t: "Edit freely after import", d: "Imports copy the template; the library original stays untouched." },
      ]} />}
    >
      {/* at-a-glance strip */}
      <div className="grid grid-cols-3 gap-3">
        {[{ n: tpls.length, l: "Templates" }, { n: systemN, l: "System" }, { n: tpls.length - systemN, l: "Custom" }].map((k) => (
          <div key={k.l} className="rounded-2xl border border-foam bg-porcelain px-4 py-3 shadow-glass">
            <div className="font-serif text-2xl font-semibold leading-none tabular-nums" style={{ color: k.l === "Templates" ? "var(--color-coffee)" : tint }}>{k.n}</div>
            <div className="mt-1 font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-mocha">{k.l}</div>
          </div>
        ))}
      </div>

      {creating && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-caramel/40 bg-porcelain p-4 shadow-glass">
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder={`${title.replace(" Templates", "")} name — e.g. NBFC standard`}
            className="min-w-[240px] flex-1 rounded-xl border border-foam bg-cream px-3.5 py-2.5 text-sm text-coffee outline-none focus:border-caramel" />
          <Button size="sm" onClick={create} className="bg-brand text-brand-foreground hover:bg-brand-dark">Create</Button>
          <Button size="sm" variant="ghost" onClick={() => setCreating(false)} className="text-mocha">Cancel</Button>
        </div>
      )}

      {tpls.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-foam bg-porcelain py-16 text-center shadow-glass">
          <Icon className="size-6 text-latte" />
          <p className="text-sm font-medium text-coffee">No templates yet.</p>
          <p className="text-xs text-muted-foreground">Create your first {noun} to speed up future campaigns.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tpls.map((t, i) => (
            <div key={t.name + i} className="group flex flex-col rounded-2xl border border-foam bg-porcelain p-4 shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glass-hover">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <GlazedTile icon={Icon} tint={tint} />
                  <h3 className="text-sm font-semibold leading-snug text-coffee">{t.name}</h3>
                </div>
                {t.system
                  ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-oat/80 px-2 py-0.5 text-[10px] font-medium text-mocha"><Lock className="size-3" /> System</span>
                  : <button onClick={() => { setTpls((x) => x.filter((_, j) => j !== i)); toast({ title: "Template deleted", body: `“${t.name}” removed.`, severity: "warning" }); }} aria-label={`Delete ${t.name}`} className="shrink-0 text-latte hover:text-danger"><Trash2 className="size-4" /></button>}
              </div>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
              <div className="mt-3 flex items-center justify-between border-t border-foam/70 pt-2.5">
                <span className="font-data text-[10.5px] text-latte">{t.meta}</span>
                <button onClick={() => toast({ title: "Ready in the wizard", body: `Import “${t.name}” from the campaign wizard — it's cross-checked against the campaign's schema first.`, severity: "info" })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-caramel transition-colors hover:text-brand-dark">Use in a campaign <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsShell>
  );
}
