"use client";

import { useEffect, useState } from "react";
import { PhoneForwarded, CheckCircle2, AlertTriangle, X } from "lucide-react";

type Severity = "info" | "success" | "warning" | "danger";
export type ToastInput = { title: string; body?: string; severity?: Severity; action?: string };
type Toast = ToastInput & { id: number };

// Fire a toast from anywhere: toast({ title: "Campaign launched" })
export function toast(t: ToastInput) {
  window.dispatchEvent(new CustomEvent("toast", { detail: t }));
}

const accent: Record<Severity, string> = {
  info: "border-l-info", success: "border-l-success", warning: "border-l-warning", danger: "border-l-danger",
};
const iconColor: Record<Severity, string> = {
  info: "text-info", success: "text-success", warning: "text-warning", danger: "text-danger",
};
const Icon = { info: CheckCircle2, success: CheckCircle2, warning: AlertTriangle, danger: PhoneForwarded };

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastInput>).detail;
      const id = ++n;
      setToasts((xs) => [...xs, { ...detail, id }]);
      setTimeout(() => setToasts((xs) => xs.filter((t) => t.id !== id)), 5000);
    };
    window.addEventListener("toast", onToast);

    // demo: show the handoff pattern shortly after load
    const demo = setTimeout(
      () => onToast(new CustomEvent("toast", { detail: { title: "Handoff requested", body: "AI agent escalated a lead on Outreach campaign.", severity: "warning", action: "Open queue" } })),
      3500
    );
    return () => { window.removeEventListener("toast", onToast); clearTimeout(demo); };
  }, []);

  const dismiss = (id: number) => setToasts((xs) => xs.filter((t) => t.id !== id));

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-80 max-w-[92vw] flex-col gap-2">
      {toasts.map((t) => {
        const sev = t.severity ?? "info";
        const I = Icon[sev];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border border-foam border-l-4 bg-porcelain p-3 shadow-card-lg ${accent[sev]}`}
            style={{ animation: "toast-in 300ms cubic-bezier(0.16,1,0.3,1)" }}
          >
            <I className={`mt-0.5 size-4 shrink-0 ${iconColor[sev]}`} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-coffee">{t.title}</div>
              {t.body && <div className="mt-0.5 text-xs text-muted-foreground">{t.body}</div>}
              {t.action && (
                <button className="mt-1.5 text-xs font-semibold text-caramel hover:underline">{t.action}</button>
              )}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-coffee">
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
