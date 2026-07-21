"use client";
import { MessageSquare } from "lucide-react";
import { ChannelPage } from "@/components/settings/channel-page";

export default function SmsDltPage() {
  return (
    <ChannelPage icon={MessageSquare} tint="var(--color-steam)" title="SMS / DLT Config"
      blurb="DLT-registered SMS for India — service messages ride the 160-series, promotional the 140-series. Templates must be DLT-approved before the agent can send them."
      connectLabel="Save DLT config"
      fields={[
        { label: "SMS provider", placeholder: "Gupshup / Kaleyra / MSG91" },
        { label: "DLT Principal Entity ID", placeholder: "1101xxxxxxxxxxxxx", mono: true },
        { label: "Sender ID (header)", placeholder: "BLOSTM", mono: true, hint: "6-char DLT-registered header." },
        { label: "API key", placeholder: "sk_live_…", mono: true },
      ]}
      extras={
        <p className="mt-5 rounded-xl bg-oat/50 px-4 py-3 text-xs text-mocha">
          Message templates live in the campaign wizard&apos;s <b>Email &amp; SMS</b> step — new templates are queued for DLT approval automatically and only send once approved.
        </p>
      } />
  );
}
