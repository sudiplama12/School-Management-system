// Dependency-free, responsive chart primitives (SVG for the donut/ring, CSS
// flex for the bar/line charts so labels stay crisp and the layout reflows).
// Kept intentionally small and presentational: they take plain data and colors.

export const PALETTE = {
  present: "#10b981",
  absent: "#f43f5e",
  late: "#f59e0b",
  paid: "#10b981",
  outstanding: "#f59e0b",
  completed: "#059669",
  pending: "#94a3b8",
  teal: "#0d9488",
  lime: "#84cc16",
  sky: "#0ea5e9",
  slate: "#cbd5e1",
};

export function Donut({
  data = [],
  size = 168,
  thickness = 22,
  centerValue,
  centerLabel,
  className = "",
}) {
  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const gap = total > 0 ? 2 : 0;

  let offset = 0;

  return (
    <div className={`flex flex-wrap items-center gap-5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        role="img"
      >
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--chart-track)"
            strokeWidth={thickness}
          />

          {total > 0 &&
            data.map((d, i) => {
              const length = ((Number(d.value) || 0) / total) * circumference;
              const dash = Math.max(length - gap, 0);
              const segment = (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return segment;
            })}
        </g>

        <text
          x={cx}
          y={centerLabel ? cy - 2 : cy + 6}
          textAnchor="middle"
          style={{ fontSize: 24, fontWeight: 700, fill: "var(--chart-ink)" }}
        >
          {centerValue ?? total}
        </text>

        {centerLabel && (
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            style={{ fontSize: 11, fill: "#94a3b8" }}
          >
            {centerLabel}
          </text>
        )}
      </svg>

      <ul className="min-w-[120px] flex-1 space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: d.color }}
            />
            <span className="text-slate-600">{d.label}</span>
            <span className="ml-auto font-semibold text-slate-900">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// data: [{ label, segments: [{ value, color, name }] }]
export function StackedBars({ data = [], height = 170, showEvery = 3 }) {
  const totals = data.map((d) =>
    (d.segments || []).reduce((sum, s) => sum + (Number(s.value) || 0), 0)
  );
  const max = Math.max(1, ...totals);

  return (
    <div>
      <div
        className="flex items-end gap-1.5"
        style={{ height }}
      >
        {data.map((d, i) => {
          const total = totals[i];
          const columnHeight = (total / max) * 100;

          return (
            <div
              key={i}
              className="flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
              title={`${d.label}: ${total}`}
            >
              <div
                className="flex w-full max-w-[26px] flex-col-reverse overflow-hidden rounded-md"
                style={{ height: `${columnHeight}%` }}
              >
                {(d.segments || []).map((s, j) =>
                  Number(s.value) > 0 ? (
                    <div
                      key={j}
                      style={{
                        background: s.color,
                        flexGrow: Number(s.value),
                      }}
                    />
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 text-center text-[10px] text-slate-400"
          >
            {i % showEvery === 0 || i === data.length - 1 ? d.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

// data: [{ label, value, color }]
export function Bars({ data = [], height = 170, suffix = "" }) {
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));

  return (
    <div>
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col items-center justify-end gap-2"
            style={{ height: "100%" }}
          >
            <span className="text-xs font-semibold text-slate-700">
              {d.value}
              {suffix}
            </span>
            <div
              className="w-full max-w-[46px] rounded-t-lg transition-all"
              style={{
                height: `${((Number(d.value) || 0) / max) * 100}%`,
                background: d.color || PALETTE.teal,
                minHeight: 4,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-3">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 truncate text-center text-[11px] text-slate-500"
            title={d.label}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// data: [{ label, value }] where value is 0..maxValue (e.g. a percentage).
export function RateLine({
  data = [],
  height = 150,
  maxValue = 100,
  color = PALETTE.present,
  showEvery = 3,
}) {
  const width = 320;
  const pad = 8;
  const n = data.length;

  const points = data.map((d, i) => {
    const x = n > 1 ? pad + (i * (width - 2 * pad)) / (n - 1) : width / 2;
    const ratio = Math.max(0, Math.min(1, (Number(d.value) || 0) / maxValue));
    const y = height - pad - ratio * (height - 2 * pad);
    return { x, y };
  });

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const area =
    points.length > 0
      ? `${line} L${points[points.length - 1].x.toFixed(1)},${height - pad} L${points[0].x.toFixed(1)},${height - pad} Z`
      : "";

  const gid = `grad-${color.replace("#", "")}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {area && <path d={area} fill={`url(#${gid})`} stroke="none" />}

        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mt-1 flex justify-between">
        {data.map((d, i) => (
          <span
            key={i}
            className="text-[10px] text-slate-400"
            style={{ visibility: i % showEvery === 0 || i === n - 1 ? "visible" : "hidden" }}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
