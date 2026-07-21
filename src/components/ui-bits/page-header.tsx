import type { ReactNode } from "react";
import { V7Banner } from "@/components/v7/kit";

/* PageHeader is the app-wide header. It renders the same V7Banner used by
   Calls/Leads/Campaigns/Reports, so every page shares one header language.
   The original title/subtitle/actions API is unchanged; eyebrow + stats are
   optional passthroughs for pages that want an overline or KPI chips. */

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
  stats,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
  stats?: { label: string; value: ReactNode; spark?: number[]; color?: string }[];
}) {
  return (
    <V7Banner
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      stats={stats}
      actions={actions}
    />
  );
}
