type Slice = { key: string; label: string; value: number; color: string };

// Dependency-free SVG donut.
export function Donut({ data, size = 150, thickness = 18, centerLabel = "calls today" }: { data: Slice[]; size?: number; thickness?: number; centerLabel?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }} role="img" aria-label="Outcome mix">
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--color-foam)" strokeWidth={thickness} />
        {data.map((d) => {
          const len = (d.value / total) * circ;
          const seg = (
            <circle
              key={d.key}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${c} ${c})`}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return seg;
        })}
        <text x={c} y={c - 2} textAnchor="middle" className="fill-coffee" fontSize="22" fontWeight="600">
          {total}
        </text>
        <text x={c} y={c + 16} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
          {centerLabel}
        </text>
      </svg>

      <ul className="space-y-1.5">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
