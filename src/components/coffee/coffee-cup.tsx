import { useId } from "react";
import { cn } from "@/lib/utils";

type Tone = "healthy" | "busy" | "saturated";

function toneFor(level: number): Tone {
  if (level >= 1) return "saturated";
  if (level >= 0.85) return "busy";
  return "healthy";
}

const RIM = { top: 50, bottom: 128 }; // inner liquid range in viewBox units

/**
 * Coffee-cup capacity meter. `level` is 0..1 (call-slots in flight / capacity).
 * Liquid fills espresso→caramel; turns honey-amber near capacity, terracotta when saturated.
 * Steam rises (CSS-only) when `live`. Fill transitions smoothly as level changes.
 */
export function CoffeeCup({
  level,
  live = true,
  className,
}: {
  level: number;
  live?: boolean;
  className?: string;
}) {
  const uid = useId();
  const clamped = Math.max(0, Math.min(1, level));
  const tone = toneFor(level);
  const liquidTop = RIM.bottom - clamped * (RIM.bottom - RIM.top);

  const liquidFill =
    tone === "saturated" ? "var(--color-danger)"
    : tone === "busy" ? "url(#" + uid + "-busy)"
    : "url(#" + uid + "-grad)";

  return (
    <svg viewBox="0 0 120 150" className={cn("h-auto w-full", className)} role="img"
      aria-label={`Capacity ${Math.round(clamped * 100)} percent`}>
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#6b4423" />
          <stop offset="100%" stopColor="#b8763d" />
        </linearGradient>
        <linearGradient id={`${uid}-busy`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#b8763d" />
          <stop offset="100%" stopColor="#e0a94e" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d="M30,48 L90,48 L84,122 Q82,130 72,130 L48,130 Q38,130 36,122 Z" />
        </clipPath>
      </defs>

      {/* steam */}
      {live && (
        <g stroke="var(--color-latte)" strokeWidth="3" strokeLinecap="round" fill="none">
          <path className="steam-wisp" d="M50,40 q-5,-8 0,-16" />
          <path className="steam-wisp" d="M62,40 q5,-8 0,-16" />
          <path className="steam-wisp" d="M74,40 q-4,-7 0,-15" />
        </g>
      )}

      {/* saucer */}
      <ellipse cx="60" cy="140" rx="46" ry="7" fill="var(--color-foam)" />
      <ellipse cx="60" cy="139" rx="34" ry="4.5" fill="var(--color-oat)" />

      {/* cup body */}
      <path d="M28,46 L92,46 L85,123 Q83,133 71,133 L49,133 Q37,133 35,123 Z"
        fill="var(--color-porcelain)" stroke="var(--color-latte)" strokeWidth="2" />

      {/* handle */}
      <path d="M92,58 q24,2 22,26 q-2,22 -24,22" fill="none"
        stroke="var(--color-latte)" strokeWidth="6" strokeLinecap="round" />

      {/* liquid */}
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x="28" y={liquidTop} width="64" height={RIM.bottom - liquidTop + 6}
          fill={liquidFill} style={{ transition: "y 600ms cubic-bezier(0.16,1,0.3,1), height 600ms cubic-bezier(0.16,1,0.3,1)" }} />
        {/* crema line */}
        <rect x="28" y={liquidTop} width="64" height="3" fill="#d9a86b" opacity="0.7"
          style={{ transition: "y 600ms cubic-bezier(0.16,1,0.3,1)" }} />
      </g>

      {/* rim */}
      <ellipse cx="60" cy="46" rx="32" ry="6" fill="var(--color-porcelain)"
        stroke="var(--color-latte)" strokeWidth="2" />
    </svg>
  );
}
