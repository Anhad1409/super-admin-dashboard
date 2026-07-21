"use client";
import { ListChecks } from "lucide-react";
import { TemplateLibrary } from "@/components/settings/template-library";

export default function LeadSchemaTemplatesPage() {
  return (
    <TemplateLibrary icon={ListChecks} tint="var(--color-blueberry)" title="Lead Schema Templates" noun="schema template"
      blurb="Reusable lead-schema field sets imported by the campaign wizard. Phone, Full Name and Email are always included — templates add the extra columns your vertical needs."
      seed={[{ name: "NBFC — Loan Collections", desc: "emi_amount, due_date, loan_id, monthly_income, cibil_band — the standard collections columns.", meta: "5 fields · 2 scoring inputs · System", system: true }]}
      createBody="Custom field set — edit fields in the campaign wizard after import." />
  );
}
