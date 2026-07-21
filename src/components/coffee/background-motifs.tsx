// Ambient coffee motifs behind the whole app — very low opacity, no interaction,
// near-zero cost (static inline SVG + one slow CSS drift). Personality without noise.
function Bean({ x, y, r, o }: { x: number; y: number; r: number; o: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`} opacity={o}>
      <ellipse cx="0" cy="0" rx="13" ry="18" fill="var(--color-mocha)" />
      <path d="M-8,-12 Q2,0 5,14" stroke="var(--color-cream)" strokeWidth="2.4" fill="none" opacity="0.5" />
    </g>
  );
}

export function BackgroundMotifs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <svg className="absolute inset-0 h-full w-full">
        {/* faint outline rings (coffee-cup stains) */}
        <circle cx="86%" cy="14%" r="120" fill="none" stroke="var(--color-latte)" strokeWidth="2" opacity="0.05" />
        <circle cx="86%" cy="14%" r="150" fill="none" stroke="var(--color-latte)" strokeWidth="1" opacity="0.04" />
        <circle cx="8%" cy="82%" r="160" fill="none" stroke="var(--color-latte)" strokeWidth="2" opacity="0.04" />
      </svg>
      {/* scattered beans, drifting slowly */}
      <svg className="absolute inset-0 h-full w-full" style={{ animation: "drift 22s ease-in-out infinite alternate" }}>
        <Bean x={140} y={120} r={24} o={0.04} />
        <Bean x={120} y={150} r={-8} o={0.04} />
        <Bean x={1300} y={520} r={40} o={0.035} />
        <Bean x={1330} y={560} r={-15} o={0.035} />
        <Bean x={520} y={760} r={10} o={0.03} />
      </svg>
    </div>
  );
}
