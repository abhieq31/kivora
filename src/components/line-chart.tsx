// Dependency-free SVG line chart. Series share one y-axis.
type Series = { name: string; color: string; points: { x: string; y: number }[] };

export function LineChart({ series, height = 220, format = (n: number) => String(Math.round(n)), xLabel = (s: string) => s }: {
  series: Series[];
  height?: number;
  format?: (n: number) => string;
  xLabel?: (s: string) => string;
}) {
  const xs = [...new Set(series.flatMap((s) => s.points.map((p) => p.x)))].sort();
  const ys = series.flatMap((s) => s.points.map((p) => p.y));
  if (xs.length < 2 || !ys.length) return <p className="text-sm text-muted">Not enough data yet.</p>;
  const W = 640;
  const H = height;
  const pad = { l: 64, r: 16, t: 12, b: 28 };
  let min = Math.min(...ys);
  let max = Math.max(...ys);
  const span = max - min || max * 0.1 || 1;
  min -= span * 0.1;
  max += span * 0.1;
  const x = (v: string) => pad.l + (xs.indexOf(v) / (xs.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const ticks = Array.from({ length: 4 }, (_, i) => min + ((max - min) * i) / 3);
  const labelEvery = Math.ceil(xs.length / 6);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={series.map((s) => s.name).join(", ")}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--color-line)" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-muted)">{format(t)}</text>
          </g>
        ))}
        {xs.map((v, i) => i % labelEvery === 0 && (
          <text key={v} x={x(v)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-muted)">{xLabel(v)}</text>
        ))}
        {series.map((s) => {
          const pts = s.points.filter((p) => xs.includes(p.x));
          const d = pts.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join(" ");
          const last = pts[pts.length - 1];
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {last && <circle cx={x(last.x)} cy={y(last.y)} r="4" fill={s.color} />}
            </g>
          );
        })}
      </svg>
      {series.length > 1 && (
        <figcaption className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded" style={{ background: s.color }} /> {s.name}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}

export const monthLabel = (s: string) => {
  const [y, m] = s.split("-");
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m) - 1]} ’${y.slice(2)}`;
};
