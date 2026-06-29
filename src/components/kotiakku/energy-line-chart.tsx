import type { ChartPoint } from "@/lib/energy-analytics";

function formatAxisTime(iso: string, locale: string, compact: boolean) {
  const date = new Date(iso);
  return date.toLocaleString(locale === "fi" ? "fi-FI" : locale === "sv" ? "sv-FI" : "en-GB", {
    month: compact ? undefined : "short",
    day: compact ? undefined : "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EnergyLineChart({
  title,
  points,
  unit,
  locale,
  color = "#166534",
  maxPoints = 96,
}: {
  title: string;
  points: ChartPoint[];
  unit: string;
  locale: string;
  color?: string;
  maxPoints?: number;
}) {
  if (points.length < 2) {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-surface p-5">
        <h3 className="font-medium text-stone-900 mb-2">{title}</h3>
        <p className="text-sm text-stone-500">—</p>
      </div>
    );
  }

  const sampled =
    points.length > maxPoints
      ? points.filter((_, index) => index % Math.ceil(points.length / maxPoints) === 0)
      : points;

  const values = sampled.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const width = 640;
  const height = 180;
  const padX = 8;
  const padY = 12;

  const coords = sampled.map((point, index) => {
    const x = padX + (index / (sampled.length - 1)) * (width - padX * 2);
    const y = height - padY - ((point.value - min) / span) * (height - padY * 2);
    return { x, y, point };
  });

  const polyline = coords.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h3 className="font-medium text-stone-900">{title}</h3>
        <span className="text-xs text-stone-400">{unit}</span>
      </div>
      <div className="overflow-x-auto -mx-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[320px] h-auto" role="img">
          <line
            x1={padX}
            y1={height - padY}
            x2={width - padX}
            y2={height - padY}
            stroke="#e7e5e4"
            strokeWidth="1"
          />
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={polyline}
          />
          {coords.length > 0 && (
            <circle
              cx={coords[coords.length - 1].x}
              cy={coords[coords.length - 1].y}
              r="4"
              fill={color}
            />
          )}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-stone-400 mt-2 tabular-nums">
        <span>{formatAxisTime(sampled[0].label, locale, sampled.length > 48)}</span>
        <span>
          {min.toLocaleString(locale, { maximumFractionDigits: 1 })} –{" "}
          {max.toLocaleString(locale, { maximumFractionDigits: 1 })}
        </span>
        <span>{formatAxisTime(sampled[sampled.length - 1].label, locale, sampled.length > 48)}</span>
      </div>
    </div>
  );
}
