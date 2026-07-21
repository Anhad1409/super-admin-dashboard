"use client";

/* Ambient drifting coffee beans for the journey pages. Decorative, reduced-motion-safe. */

const BEANS = [
  { w: 46, top: "16%", left: "72%", rot: 22, d: "13s", delay: "0s", o: 0.08 },
  { w: 30, top: "62%", left: "6%", rot: -14, d: "17s", delay: "1.4s", o: 0.07 },
  { w: 24, top: "38%", left: "58%", rot: 40, d: "15s", delay: "2.6s", o: 0.06 },
  { w: 36, top: "82%", left: "44%", rot: -30, d: "19s", delay: "0.8s", o: 0.07 },
];

export function Beans() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes vbBeanFloat { 0%,100%{ transform: translateY(0) rotate(var(--r)); } 50%{ transform: translateY(-14px) rotate(calc(var(--r) + 6deg)); } }
        @media (prefers-reduced-motion: reduce){ .vb-bean{ animation: none !important; } }
      `}</style>
      {BEANS.map((b, i) => (
        <svg key={i} viewBox="0 0 40 56" className="vb-bean absolute"
          style={{ width: b.w, top: b.top, left: b.left, opacity: b.o, ["--r" as string]: `${b.rot}deg`, animation: `vbBeanFloat ${b.d} ease-in-out ${b.delay} infinite` }}>
          <ellipse cx="20" cy="28" rx="15" ry="24" fill="#3d2817" />
          <path d="M20 6 C12 18 28 38 20 50" stroke="#fdf8f0" strokeWidth="2.6" fill="none" />
        </svg>
      ))}
    </div>
  );
}
