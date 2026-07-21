"use client";
import { Target } from "lucide-react";
import { TemplateLibrary } from "@/components/settings/template-library";

export default function ScoringConfigTemplatesPage() {
  return (
    <TemplateLibrary icon={Target} tint="var(--color-blueberry)" title="Scoring Config Templates" noun="scoring template"
      blurb="Reusable pre-score weights, in-call signal adjustments, and hot/warm thresholds. The campaign wizard's Scoring step offers a one-click import — weights are cross-checked against the campaign's lead schema, and any keys that don't match a scorable field get dropped before import (so scoring never imports silently broken)."
      seed={[{ name: "Collections default", desc: "Warm 50 / Hot 75 · income + cibil_band weighted · 9 built-in in-call signals.", meta: "2 weights · 9 signals · System", system: true }]}
      createBody="Custom weights and thresholds — tune them in the wizard's Scoring step after import." />
  );
}
