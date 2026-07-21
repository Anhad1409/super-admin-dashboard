"use client";

/* Shared scaffold for channel integration pages (Truecaller, Click-to-Call,
   SMS/DLT, WhatsApp) — SettingsShell frame + form card + How-it-works rail. */

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { SettingsShell, HowItWorks } from "@/components/settings/settings-shell";
import { SectionRule } from "@/components/settings/glaze";

export type ChannelField = { label: string; placeholder: string; mono?: boolean; hint?: string };

const DEFAULT_STEPS = [
  { t: "Add your credentials", d: "Connect the account this channel runs on — verified instantly." },
  { t: "Attach to campaigns", d: "Campaigns pick the channel up in the wizard; nothing sends without it." },
  { t: "Track it in analytics", d: "Delivery and outcomes land in Post-call Analysis automatically." },
];

export function ChannelPage({ icon, title, blurb, fields, extras, connectLabel = "Connect", steps, tint = "var(--color-steam)" }: {
  icon: LucideIcon; title: string; blurb: string; fields: ChannelField[]; extras?: React.ReactNode; connectLabel?: string;
  steps?: { t: string; d: string }[]; tint?: string;
}) {
  const [connected, setConnected] = useState(false);
  const [vals, setVals] = useState<string[]>(fields.map(() => ""));

  const connect = () => {
    if (vals.some((v, i) => !v.trim() && !fields[i].hint?.includes("optional"))) {
      toast({ title: "Missing details", body: "Fill the required fields to connect.", severity: "warning" }); return;
    }
    setConnected(true);
    toast({ title: `${title} connected`, body: "Credentials verified — the channel is live for campaigns.", severity: "success" });
  };

  return (
    <SettingsShell icon={icon} title={title} blurb={blurb} tint={tint}
      status={
        <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium", connected ? "border-success/25 bg-success/10 text-success" : "border-foam bg-oat/70 text-mocha")}>
          {connected ? "● Connected" : "Not connected"}
        </span>
      }
      aside={<><HowItWorks steps={steps ?? DEFAULT_STEPS} tint={tint} />
        <p className="rounded-2xl border border-foam bg-oat/40 px-4 py-3 text-[11.5px] leading-relaxed text-mocha">
          Credentials are stored encrypted and scoped to this organization — disconnect any time and campaigns skip the channel.
        </p></>}
    >
      <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
        <SectionRule tint={tint}>Connection</SectionRule>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {fields.map((f, i) => (
            <div key={f.label} className={fields.length % 2 && i === fields.length - 1 ? "sm:col-span-2" : ""}>
              <label className="mb-1.5 block text-sm font-medium text-coffee">{f.label}</label>
              <input value={vals[i]} onChange={(e) => setVals((v) => v.map((x, j) => (j === i ? e.target.value : x)))} placeholder={f.placeholder}
                className={cn("w-full rounded-xl border border-foam bg-cream px-3.5 py-2.5 text-sm text-coffee outline-none transition-colors focus:border-caramel", f.mono && "font-data")} />
              {f.hint && <p className="mt-1 text-[11px] text-muted-foreground">{f.hint}</p>}
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2 border-t border-foam/70 pt-4">
          {connected && <Button variant="outline" onClick={() => { setConnected(false); toast({ title: "Disconnected", body: `${title} is paused — campaigns skip this channel.`, severity: "warning" }); }} className="border-foam text-mocha">Disconnect</Button>}
          <Button onClick={connect} className="bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">{connected ? "Save changes" : connectLabel}</Button>
        </div>
      </section>

      {extras}
    </SettingsShell>
  );
}
