"use client";
import { MessageCircle } from "lucide-react";
import { ChannelPage } from "@/components/settings/channel-page";

export default function WhatsAppPage() {
  return (
    <ChannelPage icon={MessageCircle} tint="var(--color-steam)" title="WhatsApp"
      blurb="Gupshup WhatsApp Business API — session messages during calls ('sending you the link on WhatsApp') and template messages for follow-ups."
      connectLabel="Connect WABA"
      fields={[
        { label: "WABA number", placeholder: "+91 98xxx xxxxx", mono: true },
        { label: "Gupshup app name", placeholder: "blostem-prod" },
        { label: "API key", placeholder: "gs_live_…", mono: true },
        { label: "Default template namespace", placeholder: "blostem_util", mono: true, hint: "Meta-approved template namespace (optional)." },
      ]} />
  );
}
