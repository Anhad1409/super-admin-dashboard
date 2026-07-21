"use client";

import { useState } from "react";
import {
  Bell, PhoneForwarded, Ban, Users, CheckCircle2, Coffee, Info,
} from "lucide-react";
import { notifications as seed, type Notif } from "@/lib/notifications-mock";
import { cn } from "@/lib/utils";

const kindIcon = {
  handoff: PhoneForwarded, compliance: Ban, leads: Users,
  campaign: CheckCircle2, channel: Coffee, system: Info,
} as const;

const sevColor: Record<Notif["severity"], string> = {
  info: "text-info bg-info/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-danger bg-danger/10",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>(seed);
  const unread = items.filter((n) => n.unread).length;

  const markAll = () => setItems((xs) => xs.map((n) => ({ ...n, unread: false })));

  return (
    <div className="relative" data-tour="bell">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-full border border-foam bg-card text-mocha hover:bg-accent/50"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-86 max-w-[92vw] overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-card-lg">
            <div className="flex items-center justify-between border-b border-foam px-4 py-3">
              <span className="text-sm font-semibold text-coffee">Notifications</span>
              <button onClick={markAll} className="text-xs font-medium text-caramel hover:underline">
                Mark all read
              </button>
            </div>
            <ul className="max-h-[60vh] divide-y divide-foam/70 overflow-y-auto">
              {items.map((n) => {
                const Icon = kindIcon[n.kind];
                return (
                  <li key={n.id} className={cn("flex gap-3 px-4 py-3", n.unread && "bg-oat/40")}>
                    <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", sevColor[n.severity])}>
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-coffee">{n.title}</span>
                        {n.unread && <span className="size-1.5 shrink-0 rounded-full bg-caramel" />}
                        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{n.ago}</span>
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{n.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-foam px-4 py-2.5 text-center">
              <button className="text-xs font-medium text-mocha hover:underline">View all activity</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
