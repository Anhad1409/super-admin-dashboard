"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, SlidersHorizontal, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { SetupGuideButton } from "@/components/setup-guide/setup-guide";
import { toast } from "@/components/notifications/toaster";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { campaigns } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const TABS = ["All", "Draft", "Active", "Paused", "Completed"] as const;

export function V6CampaignsList() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [menuId, setMenuId] = useState<string | null>(null);
  const rows = campaigns.filter((c) => tab === "All" || c.status === tab.toLowerCase());

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Campaigns"
        actions={
          <>
            <span data-tour="camp-quick">
              <Button size="sm" onClick={() => router.push("/campaigns/quick")} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark">
                <Plus className="size-4" /> Quick Campaign
              </Button>
            </span>
            <span data-tour="camp-advanced">
              <Button variant="outline" size="sm" onClick={() => router.push("/campaigns/new")} className="gap-1.5">
                <SlidersHorizontal className="size-4" /> Advanced
              </Button>
            </span>
          </>
        }
      />

      <div data-tour="camp-tabs" className="mb-4 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Card data-tour="camp-table" className="overflow-hidden rounded-2xl border-border bg-card p-0 shadow-glass">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Calls</TableHead>
              <TableHead className="text-right">Converted</TableHead>
              <TableHead className="text-right">Conv. %</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => {
              const pct = c.leads_called > 0 ? ((c.leads_converted / c.leads_called) * 100).toFixed(1) : "0.0";
              return (
                <TableRow key={c.id} onClick={() => router.push(`/campaigns/${c.id}`)} className="cursor-pointer">
                  <TableCell className="font-medium text-brand-dark">{c.name}</TableCell>
                  <TableCell><StatusBadge value={c.status} /></TableCell>
                  <TableCell className="text-right tabular-nums">{c.total_leads}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.leads_called}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.leads_converted}</TableCell>
                  <TableCell className="text-right tabular-nums">{pct}%</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block">
                      <button onClick={() => setMenuId(menuId === c.id ? null : c.id)} className="rounded-md p-1 text-muted-foreground hover:bg-foam hover:text-coffee"><MoreHorizontal className="size-4" /></button>
                      {menuId === c.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMenuId(null)} />
                          <div className="absolute right-0 z-50 mt-1 w-40 rounded-xl border border-foam bg-porcelain p-1 text-left text-sm shadow-card-lg">
                            {[
                              { l: "Open", fn: () => router.push(`/campaigns/${c.id}`) },
                              { l: "Edit", fn: () => router.push("/campaigns/new") },
                              { l: c.status === "active" ? "Pause" : "Activate", fn: () => toast({ title: c.status === "active" ? "Paused" : "Activated", body: `“${c.name}”`, severity: "info" }) },
                              { l: "Duplicate", fn: () => toast({ title: "Campaign duplicated", body: `“${c.name} (Copy)” created as draft.`, severity: "success" }) },
                              { l: "Delete", fn: () => toast({ title: "Delete campaign?", body: "This would remove the campaign.", severity: "warning" }), danger: true },
                            ].map((m) => (
                              <button key={m.l} onClick={() => { setMenuId(null); m.fn(); }} className={`block w-full rounded-lg px-3 py-1.5 text-left hover:bg-oat/70 ${m.danger ? "text-danger" : "text-coffee"}`}>{m.l}</button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No {tab.toLowerCase()} campaigns
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
