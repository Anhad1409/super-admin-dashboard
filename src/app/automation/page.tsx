"use client";

import { useState } from "react";
import { Workflow, Send, CheckCircle2, ArrowRight, MessageSquare, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { automationRules, messageTemplates, deliveryLogs } from "@/lib/ops-mock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = ["Rules", "Templates", "Delivery logs"];
const chanColor: Record<string, string> = {
  SMS: "bg-info/12 text-info", WhatsApp: "bg-success/12 text-success",
  CRM: "bg-blueberry/15 text-blueberry", Calendar: "bg-warning/15 text-warning", System: "bg-foam text-mocha",
};

export default function AutomationPage() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Post-Call Automation" subtitle="When a call ends a certain way, do something about it — automatically"
        actions={<Button size="sm" className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> New rule</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active rules" value={automationRules.filter((r) => r.active).length} icon={Workflow} />
        <StatCard label="Messages sent today" value="161" icon={Send} />
        <StatCard label="Delivery rate" value="97%" icon={CheckCircle2} sub="last 24h" />
        <StatCard label="Templates" value={messageTemplates.length} icon={MessageSquare} />
      </div>

      <div className="mb-4 flex gap-1 border-b border-foam">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === t ? "border-caramel text-caramel" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>)}
      </div>

      {tab === "Rules" && (
        <div className="space-y-3">
          {automationRules.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
              <span className={cn("size-2.5 rounded-full", r.active ? "bg-success" : "bg-latte")} />
              <div className="flex flex-1 flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">When</span>
                <span className="rounded-lg bg-oat/70 px-2 py-1 font-medium text-coffee">{r.when}</span>
                <ArrowRight className="size-4 text-latte" />
                <span className="font-medium text-coffee">{r.then}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", chanColor[r.channel])}>{r.channel}</span>
              </div>
              <span className="font-data text-xs text-muted-foreground">{r.fired} fired</span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", r.active ? "bg-success/12 text-success" : "bg-foam text-muted-foreground")}>{r.active ? "Active" : "Paused"}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "Templates" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {messageTemplates.map((t) => (
            <div key={t.id} className="rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-coffee">{t.name}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", chanColor[t.channel])}>{t.channel}</span>
              </div>
              <p className="rounded-lg bg-oat/50 p-3 text-xs leading-relaxed text-mocha">{t.preview}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "Delivery logs" && (
        <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-foam bg-oat/40 text-left text-xs text-mocha"><th className="px-4 py-2.5">To</th><th className="px-4 py-2.5">Channel</th><th className="px-4 py-2.5">Template</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5 text-right">Time</th></tr></thead>
            <tbody className="divide-y divide-foam">
              {deliveryLogs.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-2.5 font-medium text-coffee">{d.to}</td>
                  <td className="px-4 py-2.5"><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", chanColor[d.channel])}>{d.channel}</span></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.template}</td>
                  <td className="px-4 py-2.5"><span className={cn("text-xs font-medium", d.status === "delivered" ? "text-success" : "text-danger")}>{d.status}</span></td>
                  <td className="px-4 py-2.5 text-right font-data text-xs text-muted-foreground">{d.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
