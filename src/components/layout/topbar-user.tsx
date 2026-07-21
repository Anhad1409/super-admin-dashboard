"use client";

/* Topbar identity — reads the signed-up profile (vb-profile) when present so
   a freemium user sees their own name, falling back to the demo org user.
   Clicking it opens the account menu: Settings + Sign out. Signing out ends
   the session (the poured/verified flags) but keeps the account profile, then
   returns to the sign-in counter. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { currentUser } from "@/lib/data";
import { titleCase } from "@/lib/format";
import { getProfile, getPlan } from "@/lib/tab-mock";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).join("").slice(0, 2).toUpperCase() || "?";
}

export function TopbarUser() {
  const router = useRouter();
  const [user, setUser] = useState({ name: currentUser.full_name, role: titleCase(currentUser.role) });
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      const p = getProfile();
      if (p?.name) setUser({ name: p.name, role: getPlan() === "free" ? "Owner · Free trial" : "Owner" });
      else setUser({ name: currentUser.full_name, role: titleCase(currentUser.role) });
    };
    sync();
    window.addEventListener("vb-credits-change", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("vb-credits-change", sync); window.removeEventListener("storage", sync); };
  }, []);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("pointerdown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const signOut = () => {
    try {
      sessionStorage.removeItem("vb-poured");
      sessionStorage.removeItem("vb-email-verified");
      sessionStorage.removeItem("vb-tab-open");
    } catch {}
    setOpen(false);
    router.push("/login/v2");
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-oat/60"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-caramel to-mocha text-xs font-semibold text-cream">
          {initials(user.name)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-xs font-semibold text-coffee">{user.name}</span>
          <span className="block text-[10px] text-muted-foreground">{user.role}</span>
        </span>
        <ChevronDown className={cn("size-3.5 text-latte transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-foam bg-porcelain py-1.5 shadow-card-lg">
          <div className="border-b border-foam px-3.5 pb-2 pt-1.5">
            <div className="text-[13px] font-semibold text-coffee">{user.name}</div>
            <div className="text-[11px] text-muted-foreground">{user.role}</div>
          </div>
          <button role="menuitem" onClick={() => { setOpen(false); router.push("/settings"); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-coffee transition-colors hover:bg-oat/60">
            <Settings className="size-4 text-mocha" /> Settings
          </button>
          <button role="menuitem" onClick={signOut}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-medium text-danger transition-colors hover:bg-danger/8">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
