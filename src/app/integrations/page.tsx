"use client";

import { useState } from "react";
import { Plug, Check, Webhook } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

const initial = [
  { name: "HubSpot", desc: "Sync leads & call outcomes", connected: true },
  { name: "Zoho CRM", desc: "Two-way contact sync", connected: false },
  { name: "Salesforce", desc: "Push dispositions to opportunities", connected: false },
  { name: "Google Calendar", desc: "Book callbacks automatically", connected: true },
  { name: "WhatsApp", desc: "Follow-up messages in sequences", connected: false },
  { name: "Custom HTTP / Webhook", desc: "POST events to your endpoint", connected: true },
];

export default function IntegrationsPage() {
  const [items, setItems] = useState(initial);
  const toggle = (i: number) => {
    setItems((p) => p.map((it, j) => (j === i ? { ...it, connected: !it.connected } : it)));
    toast({ title: items[i].name, body: items[i].connected ? "Disconnected" : "Connected", severity: items[i].connected ? "info" : "success" });
  };
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Integrations" subtitle="Connect your CRM, calendar & messaging — no lock-in"
        actions={<Button size="sm" variant="outline" onClick={() => toast({ title: "Webhook", body: "Opening webhook setup…", severity: "info" })} className="gap-1.5 text-mocha"><Webhook className="size-3.5" /> Add webhook</Button>} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div key={it.name} className="flex flex-col rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-brand"><Plug className="size-5" /></span><div><div className="font-medium text-coffee">{it.name}</div>{it.connected && <div className="flex items-center gap-1 text-xs text-success"><Check className="size-3" /> Connected</div>}</div></div>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{it.desc}</p>
            <Button size="sm" variant={it.connected ? "outline" : "default"} onClick={() => toggle(i)} className={cn("mt-4", it.connected ? "text-mocha" : "bg-brand text-brand-foreground hover:bg-brand-dark")}>{it.connected ? "Disconnect" : "Connect"}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
