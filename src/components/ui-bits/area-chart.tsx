"use client";

import { useId, useRef, useState } from "react";

type Series = { key: string; label: string; color: string };
type Row = Record<string, number | string> & { date: string };

// Dependency-free stacked area chart with hover tooltips + guide line.
export function AreaChart({
  data,
  series,
  height = 260,
}: {
  data: Row[];
  series: Series[];
  height?: number;
}) {
  const uid = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const W = 820;
  const H = height;
  const padX = 8;
  const padY = 16;
  const n = data.length;

  const maxVal = Math.max(
    1,
    ...data.map((d) => series.reduce((m, s) => Math.max(m, Number(d[s.key]) || 0), 0))
  );

  const x = (i: number) => padX + (i * (W - padX * 2)) / Math.max(1, n - 1);
  const y = (v: number) => H - padY - (v / maxVal) * (H - padY * 2);

  const buildArea = (key: string) => {
    if (n === 0) return "";
    const top = data.map((d, i) => `${x(i)},${y(Number(d[key]) || 0)}`).join(" L ");
    return `M ${padX},${H - padY} L ${top} L ${x(n - 1)},${H - padY} Z`;
  };
  const buildLine = (key: string) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)},${y(Number(d[key]) || 0)}`).join(" ");

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(maxVal * t));
  const labelEvery = Math.ceil(n / 8);

  const onMove = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.max(0, Math.min(n - 1, Math.round(((svgX - padX) / (W - padX * 2)) * (n - 1))));
    setHover(idx);
  };

  const hd = hover != null ? data[hover] : null;
  const tipLeftPct = hover != null ? (x(hover) / W) * 100 : 0;
  const tipRight = tipLeftPct > 62;

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H + 22}`}
        className="w-full"
        role="img"
        aria-label="Call activity chart"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padX} x2={W - padX} y1={y(t)} y2={y(t)} stroke="#6b44231a" strokeDasharray="3 4" />
            <text x={W - padX} y={y(t) - 4} textAnchor="end" className="fill-muted-foreground" fontSize="10">{t}</text>
          </g>
        ))}

        {series.map((s) => (
          <g key={s.key}>
            <path d={buildArea(s.key)} fill={`url(#${uid}-${s.key})`} />
            <path d={buildLine(s.key)} fill="none" stroke={s.color} strokeWidth="2" />
          </g>
        ))}

        {/* hover guide + markers */}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padY} y2={H - padY} stroke="var(--color-caramel)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            {series.map((s) => (
              <circle key={s.key} cx={x(hover)} cy={y(Number(data[hover][s.key]) || 0)} r="3.5"
                fill="var(--color-porcelain)" stroke={s.color} strokeWidth="2" />
            ))}
          </g>
        )}

        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={i} x={x(i)} y={H + 14} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
              {new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
            </text>
          ) : null
        )}
      </svg>

      {/* tooltip */}
      {hd && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-32 rounded-xl border border-foam bg-porcelain/95 px-3 py-2 shadow-glass backdrop-blur-sm"
          style={{ left: `${tipLeftPct}%`, transform: tipRight ? "translateX(-105%)" : "translateX(8px)" }}
        >
          <div className="mb-1 text-xs font-semibold text-coffee">
            {new Date(hd.date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
          </div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-xs">
              <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="ml-auto font-medium tabular-nums text-coffee">{Number(hd[s.key]) || 0}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-center gap-5">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
