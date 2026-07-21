"use client";

import { usePathname } from "next/navigation";
import { setupGuides } from "@/lib/setup-guides";
import { SetupGuideButton } from "./setup-guide";

// Maps the current route to a Setup Guide key.
function keyFor(path: string | null): string | null {
  if (!path) return null;
  const p = path.replace(/^\//, "");
  if (setupGuides[p]) return p; // exact match, e.g. settings/billing
  const seg = p.split("/")[0];
  if (seg === "dashboard-v2" || seg === "dashboard" || seg === "today") return "dashboard";
  if (seg === "campaigns") return "campaigns";
  if (setupGuides[seg]) return seg;
  return null;
}

// Global Setup-Guide affordance for the top bar — appears on every page that has a guide.
export function TopbarGuide() {
  const key = keyFor(usePathname());
  if (!key) return null;
  return <SetupGuideButton page={key} label="Guide" />;
}
