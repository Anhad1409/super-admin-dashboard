"use client";

/* v6 · Notification bell.
   The AI blocker is delivered via the bell: it escalates (red badge + pulsing
   ring) for high-priority, and is pinned at the top of the dropdown. */

import { useState } from "react";
import Link from "next/link";
import {
  Bell, AlertTriangle, PhoneForwarded, Ban, Users, CheckCircle2, Coffee, Info,
  PauseCircle, PlayCircle, ArrowRight,
} from "lucide-react";
import { notifications as seed, type Notif } from "@/lib/notifications-mock";
import { blocker } from "@/lib/v6-mock";
import { cn } from "@/lib/utils";

const kindIcon = { handoff: PhoneForwarded, compliance: Ban, leads: Users, campaign: CheckCircle2, channel: Coffee, system: Info } as const;
const sevColor: Record<Notif["severity"], string> = {
  info: "text-info bg-info/10", success: "text-success bg-success/10", warning: "text-warning bg-warning/10", danger: "text-danger bg-danger/10",
};

type BState = "unread" | "read" | "paused" | "ignored";

export function V6NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>(seed);
  const [bs, setBs] = useState<BState>("unread");

  const live = bs !== "ignored";
  const highUnread = bs === "unread";
  const unread = items.filter((n) => n.unread).length + (highUnread ? 1 : 0);

  const openBell = () => { setOpen((o) => !o); if (bs === "unread") setBs("read"); };
  const markAll = () => { setItems((xs) => xs.map((n) => ({ ...n, unread: false }))); if (bs === "unread") setBs("read"); };

  return (
    <div className="relative" data-tour="bell">
      <button onClick={openBell} aria-label="Notifications"
        className={cn("relative grid size-9 place-items-center rounded-full border bg-card transition-colors",
          highUnread ? "border-danger/40 text-danger" : "border-foam text-mocha hover:bg-accent/50")}>
        {highUnread && <span className="absolute inset-0 rounded-full ring-2 ring-danger/40" style={{ animation: "vbbell 1.6s ease-out infinite" }} />}
        <Bell className="size-4" />
        {unread > 0 && (
          <span className={cn("absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white", highUnread ? "bg-danger" : "bg-mocha")}
            style={highUnread ? { animation: "vbbadge 1.4s ease-in-out infinite" } : undefined}>{unread}</span>
        )}
      </button>
      <style>{`@keyframes vbbell{0%{transform:scale(1);opacity:.7}70%{transform:scale(1.7);opacity:0}100%{opacity:0}}@keyframes vbbadge{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}`}</style>

      {/* dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-[360px] max-w-[92vw] overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-card-lg">
            <div className="flex items-center justify-between border-b border-foam px-4 py-3">
              <span className="text-sm font-semibold text-coffee">Notifications</span>
              <button onClick={markAll} className="text-xs font-medium text-caramel hover:underline">Mark all read</button>
            </div>
            <ul className="max-h-[64vh] divide-y divide-foam/70 overflow-y-auto">
              {live && <BlockerRow bs={bs} setBs={setBs} onAct={() => setOpen(false)} />}
              {items.map((n) => { const Icon = kindIcon[n.kind]; return (
                <li key={n.id} className={cn("flex gap-3 px-4 py-3", n.unread && "bg-oat/40")}>
                  <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", sevColor[n.severity])}><Icon className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="truncate text-sm font-medium text-coffee">{n.title}</span>{n.unread && <span className="size-1.5 shrink-0 rounded-full bg-caramel" />}<span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{n.ago}</span></div>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{n.body}</p>
                  </div>
                </li>
              ); })}
            </ul>
            <div className="border-t border-foam px-4 py-2.5 text-center"><button className="text-xs font-medium text-mocha hover:underline">View all activity</button></div>
          </div>
        </>
      )}
    </div>
  );
}

function BlockerRow({ bs, setBs, onAct }: { bs: BState; setBs: (s: BState) => void; onAct: () => void }) {
  const paused = bs === "paused";
  return (
    <li className="border-l-2 border-danger bg-danger/[0.05] px-4 py-3">
      <div className="flex gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-danger/12 text-danger">{paused ? <PauseCircle className="size-4" /> : <AlertTriangle className="size-4" />}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-coffee">{blocker.title}</span>
            <span className="rounded-full bg-danger/12 px-1.5 text-[9px] font-bold uppercase text-danger">high</span>
            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">now</span>
          </div>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{paused ? `${blocker.campaign} is paused while you fix this.` : blocker.brief}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {paused
              ? <button onClick={() => setBs("read")} className="inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 text-[11px] font-semibold text-white"><PlayCircle className="size-3" /> Resume</button>
              : <>
                  <button onClick={() => setBs("paused")} className="inline-flex items-center gap-1 rounded-full bg-coffee px-3 py-1 text-[11px] font-semibold text-cream"><PauseCircle className="size-3" /> Pause</button>
                  <button onClick={() => setBs("ignored")} className="rounded-full border border-foam bg-card px-3 py-1 text-[11px] font-medium text-mocha">Ignore</button>
                </>}
            <Link href="/insights" onClick={onAct} className="inline-flex items-center gap-1 text-[11px] font-semibold text-caramel hover:underline">View full report <ArrowRight className="size-3" /></Link>
          </div>
        </div>
      </div>
    </li>
  );
}
