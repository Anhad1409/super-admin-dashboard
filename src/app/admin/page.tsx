"use client";

/* Admin Console — platform-level management for Blostem staff.
   Org switching, platform KPIs, and entry points into admin tooling. */

import { useState } from "react";
import Link from "next/link";
import { Shield, Check, Building2, Users, Megaphone, ShieldCheck, ArrowRight, SlidersHorizontal, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

const monoLabel = "font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-mocha";

const ORGS = [
  "Blostem Demo Organization",
  "Demo Organization",
  "Fintechglow Capital Consultancy Pvt Ltd",
  "MoneyBuddha",
  "Smoke Test Org",
  "test-vision",
  "Voice Harness Sandbox",
];

const KPIS = [
  { icon: Building2, label: "Total Organizations", value: "7", sub: "partner + internal" },
  { icon: Users, label: "Total Users", value: "23", sub: "across all organizations" },
  { icon: Megaphone, label: "Active Campaigns", value: "2", sub: "running right now" },
  { icon: ShieldCheck, label: "Blostem Staff", value: "4", sub: "super_admin + blostem_admin" },
];

export default function AdminPage() {
  const [active, setActive] = useState("Demo Organization");

  const switchOrg = (org: string) => {
    if (org === active) return;
    setActive(org);
    toast({ title: `Switched to ${org}`, body: "Dashboards now scope to this organization.", severity: "success" });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="flex items-center gap-2.5 font-serif text-3xl font-semibold tracking-tight text-coffee">
        <Shield className="size-6 text-caramel" /> Admin Console
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Platform-level management for Blostem staff only.</p>

      {/* ---- control plane banner ---- */}
      <Link href="/admin/clients"
        className="group mt-5 flex items-center gap-4 overflow-hidden rounded-2xl border border-espresso/30 p-5 shadow-card-lg transition-transform hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #2a1a0f 0%, #3d2817 60%, #4a2f18 100%)" }}>
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-caramel/40 bg-caramel/15 text-caramel"><ShieldAlert className="size-6" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-semibold text-cream">Control Plane</h2>
            <span className="rounded-full border border-caramel/40 bg-caramel/15 px-2 py-0.5 font-[family-name:var(--font-data)] text-[9px] font-semibold uppercase tracking-[0.14em] text-caramel">Super Admin</span>
          </div>
          <p className="mt-0.5 text-sm text-latte">Every client in one view — revenue, usage, health &amp; compliance across the whole platform.</p>
        </div>
        <ArrowRight className="size-5 shrink-0 text-caramel transition-transform group-hover:translate-x-1" />
      </Link>

      {/* ---- switch organization ---- */}
      <section className="mt-5 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold text-coffee">Switch Organization</h2>
          <p className="text-sm text-muted-foreground">
            Currently viewing: <span className="font-medium text-coffee">{active}</span>
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {ORGS.map((org) => {
            const isActive = org === active;
            return (
              <button key={org} onClick={() => switchOrg(org)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  isActive
                    ? "border-caramel bg-cream/70 shadow-cta"
                    : "border-foam bg-card hover:border-latte hover:bg-cream/40",
                )}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full font-serif text-[14px] font-semibold text-porcelain shadow-glass"
                  style={{ background: "linear-gradient(135deg, #c9a87c, #b8763d)" }}>
                  {org[0].toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-coffee">{org}</span>
                {isActive && <Check className="size-4 shrink-0 text-caramel" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* ---- platform KPIs ---- */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="flex items-center gap-2"><k.icon className="size-4 text-caramel" /><span className={monoLabel}>{k.label}</span></div>
            <div className="mt-2 font-serif text-[26px] font-semibold leading-none text-coffee tabular-nums">{k.value}</div>
            <div className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ---- admin tooling ---- */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-caramel" />
            <h2 className="font-serif text-lg font-semibold text-coffee">Organizations</h2>
          </div>
          <p className="mt-1.5 flex-1 text-sm text-muted-foreground">Create and manage partner organizations.</p>
          <div className="mt-4">
            <Link href="/admin/clients"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-foam bg-card px-2.5 text-sm font-medium text-mocha transition-colors hover:border-caramel hover:text-coffee">
              View All <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-caramel" />
            <h2 className="font-serif text-lg font-semibold text-coffee">Blostem Users</h2>
          </div>
          <p className="mt-1.5 flex-1 text-sm text-muted-foreground">Manage super_admin and blostem_admin accounts.</p>
          <div className="mt-4">
            <Button variant="outline" className="border-foam text-mocha hover:text-coffee"
              onClick={() => toast({ title: "Blostem Users", body: "Showing all 4 staff accounts — 2 super_admin, 2 blostem_admin.", severity: "info" })}>
              View All <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-caramel" />
            <h2 className="font-serif text-lg font-semibold text-coffee">Feature Management</h2>
          </div>
          <p className="mt-1.5 flex-1 text-sm text-muted-foreground">Enable or disable dashboard features per organization.</p>
          <div className="mt-4">
            <Link href="/admin/features"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-2.5 text-sm font-medium text-brand-foreground shadow-cta transition-all hover:bg-brand-dark">
              Manage <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
