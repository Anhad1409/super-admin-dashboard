"use client";
import { GitBranch } from "lucide-react";
import { TemplateLibrary } from "@/components/settings/template-library";

export default function ConversationFlowTemplatesPage() {
  return (
    <TemplateLibrary icon={GitBranch} tint="var(--color-blueberry)" title="Conversation Flow Templates" noun="flow template"
      blurb="Reusable system prompts, greeting + sign-off, and objection handlers. Variable references in the prompts are cross-checked against each campaign's lead schema before import."
      seed={[{ name: "EMI Reminder — Hinglish", desc: "Warm greeting, EMI due confirmation, payment-link offer, 4 objection handlers ({full_name}, {emi_amount}, {due_date}).", meta: "1 prompt · 4 handlers · System", system: true }]}
      createBody="Custom flow — edit the prompt and handlers in the wizard's Conversation step after import." />
  );
}
