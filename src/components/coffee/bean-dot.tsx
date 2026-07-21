import { cn } from "@/lib/utils";

// Coffee-bean shaped status dot (the seam is the bean's crease).
export function BeanDot({ color = "var(--color-mocha)", className }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("size-3 shrink-0", className)} aria-hidden>
      <ellipse cx="8" cy="8" rx="5.5" ry="7" fill={color} transform="rotate(32 8 8)" />
      <path d="M5.5,3.2 Q9,8 10.5,12.8" stroke="var(--color-porcelain)" strokeWidth="1.1"
        fill="none" opacity="0.65" transform="rotate(32 8 8)" />
    </svg>
  );
}

// Small live "●" with a soft pulse ring.
export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-2.5", className)} aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
      <span className="relative inline-flex size-2.5 rounded-full bg-success" />
    </span>
  );
}
