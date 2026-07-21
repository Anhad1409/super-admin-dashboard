"use client";

/* Client app ⇄ Control Plane toggle — flips the whole experience. In admin
   mode the sidebar swaps to the super-admin nav (see V6Sidebar) and this
   pill lights up "Control Plane". Client mode returns to the tenant app. */

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const admin = pathname.startsWith("/admin");
  const mono = "font-[family-name:var(--font-data)]";

  return (
    <div className="flex items-center rounded-full border border-border bg-card p-0.5 shadow-glass">
      <button
        onClick={() => router.push("/dashboard")}
        aria-pressed={!admin}
        className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors", mono, "uppercase tracking-[0.08em]",
          !admin ? "bg-brand text-brand-foreground shadow-cta" : "text-mocha hover:text-coffee")}
      >
        <LayoutDashboard className="size-3.5" /> Client
      </button>
      <button
        onClick={() => router.push("/admin/clients")}
        aria-pressed={admin}
        className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors", mono, "uppercase tracking-[0.08em]",
          admin ? "text-cream shadow-cta" : "text-mocha hover:text-coffee")}
        style={admin ? { background: "linear-gradient(135deg, #2a1a0f, #3d2817)" } : undefined}
      >
        <ShieldAlert className={cn("size-3.5", admin && "text-caramel")} /> Control Plane
      </button>
    </div>
  );
}
