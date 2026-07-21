"use client";

import { useRef, useState } from "react";

// Peek preview — hover any entity name to reveal a rich card (GitHub/Linear/Notion style).
// Fixed-positioned so it escapes table/overflow clipping; flips above if near the bottom.
export function HoverCard({ trigger, children, width = 264 }: { trigger: React.ReactNode; children: React.ReactNode; width?: number }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean }>({ top: 0, left: 0, above: false });
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    timer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const above = r.bottom + 230 > vh;
      setPos({
        top: above ? r.top - 8 : r.bottom + 8,
        left: Math.min(Math.max(12, r.left), vw - width - 12),
        above,
      });
      setOpen(true);
    }, 200);
  };
  const hide = () => { clearTimeout(timer.current); setOpen(false); };

  return (
    <span ref={ref} onMouseEnter={show} onMouseLeave={hide} className="relative">
      {trigger}
      {open && (
        <div
          onMouseEnter={() => clearTimeout(timer.current)}
          onMouseLeave={hide}
          style={{ top: pos.top, left: pos.left, width, transform: pos.above ? "translateY(-100%)" : undefined }}
          className="fixed z-[70] rounded-2xl border border-foam bg-porcelain p-3.5 shadow-card-lg"
          role="dialog"
        >
          {children}
        </div>
      )}
    </span>
  );
}
