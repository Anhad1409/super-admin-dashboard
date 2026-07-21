"use client";

/* /campaigns/[id]/edit — the advanced wizard preloaded with the campaign. */

import { useParams } from "next/navigation";
import { V6AdvancedWizard } from "@/components/v6/advanced-wizard";
import { campaigns } from "@/lib/data";

export default function CampaignEditPage() {
  const { id } = useParams<{ id: string }>();
  const c = campaigns.find((x) => x.id === id);
  return (
    <V6AdvancedWizard
      edit={c ? { id: c.id, name: c.name, description: c.description, agent: c.agent_name, language: c.default_language } : undefined}
    />
  );
}
