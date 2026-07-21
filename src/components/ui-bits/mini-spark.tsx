// Tiny inline sparkline for KPI tiles (no deps).
export function MiniSpark({ data, color = "var(--color-caramel)", w = 72, h = 24 }: { data: number[]; color?: string; w?: number; h?: number }) {
  if (!data.length) return null;
  const max = Math.max(1, ...data), min = Math.min(...data);
  const span = max - min || 1;
  const x = (i: number) => (i / Math.max(1, data.length - 1)) * w;
  const y = (v: number) => h - 2 - ((v - min) / span) * (h - 4);
  const line = data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden className="overflow-visible">
      <path d={area} fill={color} opacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="1.8" fill={color} />
    </svg>
  );
}
