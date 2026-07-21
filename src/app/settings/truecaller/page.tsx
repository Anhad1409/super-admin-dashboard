"use client";
import { BadgeCheck } from "lucide-react";
import { ChannelPage } from "@/components/settings/channel-page";

export default function TruecallerPage() {
  return (
    <ChannelPage icon={BadgeCheck} tint="var(--color-steam)" title="Truecaller Identity"
      blurb="Verified business caller ID — your brand name, logo and category on the call screen. Fewer spam flags, higher pickup."
      connectLabel="Submit for verification"
      fields={[
        { label: "Business name (as registered)", placeholder: "Blostem Fintech Pvt Ltd" },
        { label: "Category", placeholder: "Financial Services" },
        { label: "Verified badge number", placeholder: "+91 80353 41719", mono: true, hint: "Must be a number from your caller-ID pool." },
        { label: "Brand logo URL", placeholder: "https://…/logo.png", mono: true, hint: "Square PNG ≥ 512px (optional)." },
      ]} />
  );
}
