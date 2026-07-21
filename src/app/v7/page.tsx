"use client";

/* /v7 — preview hub for the redesigned pages. The live routes are
   untouched; each card opens the v7 take for side-by-side comparison. */

import Link from "next/link";
import { ArrowRight, LayoutDashboard, Megaphone, Users, Phone, FileBarChart } from "lucide-react";
import { V7Banner, monoLabel } from "@/components/v7/kit";

const PAGES = [
  { href: "/v7/dashboard", live: "/dashboard", icon: LayoutDashboard, name: "Dashboard", desc: "Billing-aware capacity, reconciled metrics, compliance, goals and a live activity feed." },
  { href: "/v7/campaigns", live: "/campaigns", icon: Megaphone, name: "Campaigns", desc: "Chip filters, progress bars and live indicators." },
  { href: "/v7/leads", live: "/leads", icon: Users, name: "Leads", desc: "Temperature bands, score meters and quick-call actions." },
  { href: "/v7/calls", live: "/calls", icon: Phone, name: "Calls", desc: "Colored outcome filters, score deltas and expandable call detail." },
  { href: "/v7/reports", live: "/reports", icon: FileBarChart, name: "Reports", desc: "Icon tiles, category chips and 7-day trends." },
];

export default function V7Index() {
  return (
    <div className="mx-auto max-w-7xl">
      <V7Banner
        eyebrow="Version seven"
        title="v7 preview"
        subtitle="The dashboard design language applied app-wide, with professional in-app copy. Live routes are untouched — compare side by side."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PAGES.map((p) => (
          <Link key={p.href} href={p.href}
            className="group flex items-start gap-4 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glass-hover">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-oat text-caramel transition-transform group-hover:scale-105">
              <p.icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-serif text-lg font-semibold text-coffee">
                {p.name} <ArrowRight className="size-4 text-latte transition-transform group-hover:translate-x-1 group-hover:text-caramel" />
              </span>
              <span className="mt-0.5 block text-sm text-mocha">{p.desc}</span>
              <span className={`${monoLabel} mt-2 block`}>current: {p.live}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
