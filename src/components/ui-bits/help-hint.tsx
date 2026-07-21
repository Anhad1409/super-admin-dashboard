"use client";

import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Small "?" affordance shown at the end of a section header; explains the section on hover.
export function HelpHint({ text, side = "left" }: { text: string; side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button type="button" aria-label="What's this section?" className="text-latte transition-colors hover:text-caramel">
            <HelpCircle className="size-4" />
          </button>
        }
      />
      <TooltipContent side={side} className="max-w-[260px] text-left leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
