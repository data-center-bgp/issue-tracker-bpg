import { useState } from "react";
import type { ProgressUpdate } from "./ProgressTimeline";

interface ProgressChartProps {
  // Oldest first.
  updates: ProgressUpdate[];
  openDate: string;
  createdAt: string;
  dueDate: string | null;
  completed: boolean;
}

const DAY = 86_400_000;

// "YYYY-MM-DD" as local midnight, so it lines up with the dates users picked.
function dayStart(value: string): number {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

const formatDay = (time: number, withYear = false) =>
  new Date(time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });

export function ProgressChart({
  updates,
  openDate,
  createdAt,
  dueDate,
  completed,
}: ProgressChartProps) {
  // Fixed at mount so the chart doesn't shift between renders.
  const [now] = useState(() => Date.now());
  const times = updates.map((u) => new Date(u.created_at).getTime());
  // A missing or malformed date must not break the whole chart.
  const dueDay = dueDate ? dayStart(dueDate) : NaN;
  const dueEnd = Number.isFinite(dueDay) ? dueDay + DAY : null;
  const overdue = !completed && dueEnd !== null && now > dueEnd;

  const start = Math.min(
    ...[dayStart(openDate), new Date(createdAt).getTime(), ...times].filter(
      Number.isFinite
    ),
    now
  );
  let end = Math.max(dueEnd ?? 0, ...times, completed ? 0 : now);
  if (end <= start) end = start + DAY;
  const withYear = new Date(start).getFullYear() !== new Date(end - 1).getFullYear();

  const timeX = (t: number) => ((t - start) / (end - start)) * 100;
  const y = (p: number) => 100 - p;

  // Updates made close together (often within one day) would stack into a
  // single bar, so keep a minimum gap between steps. The due marker stays
  // true to the calendar.
  const gap = Math.min(5, 90 / (updates.length + 1));
  // Room at the right edge for today's marker while the issue is open.
  const rightEdge = completed ? 100 : 100 - gap;
  const xs: number[] = [];
  times.forEach((t, i) => {
    xs.push(Math.max(timeX(t), (i === 0 ? 0 : xs[i - 1]) + gap));
  });
  // On a long-running issue recent updates sit at the far right, so spreading
  // them forward would run off the chart. Pull them back to fit instead.
  xs.forEach((value, i) => {
    xs[i] = Math.min(value, rightEdge - (xs.length - 1 - i) * gap);
  });
  const x = (t: number) => timeX(t);
  const lastX = xs.length ? xs[xs.length - 1] : 0;
  const nowX = Math.min(100, Math.max(timeX(now), lastX + gap));

  // Progress holds its value until the next update, so the line steps.
  const points: Array<[number, number]> = [[0, y(0)]];
  let prev = 0;
  updates.forEach((u, i) => {
    points.push([xs[i], y(prev)], [xs[i], y(u.progress)]);
    prev = u.progress;
  });
  const last = updates[updates.length - 1];
  if (!completed) points.push([nowX, y(prev)]);

  const line = points.map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`).join(" ");
  const tail = points[points.length - 1][0];
  const area = `${line} L${tail} 100 L0 100 Z`;

  const lineColor = completed ? "var(--color-moss-400)" : "var(--color-gold-400)";
  const accent = completed ? "bg-moss-400" : "bg-gold-400";
  const dueX = dueEnd !== null ? x(dueEnd) : null;

  const summary = last
    ? `Progress is ${last.progress}% after ${updates.length} ${
        updates.length === 1 ? "update" : "updates"
      }.`
    : "No progress updates yet.";

  return (
    <div>
      <div className="relative h-44" role="img" aria-label={summary}>
        {/* y axis */}
        {[100, 50, 0].map((p) => (
          <span
            key={p}
            className="absolute left-0 -translate-y-1/2 font-mono text-[10px] text-ink-400"
            style={{ top: `${y(p)}%` }}
          >
            {p}%
          </span>
        ))}

        {/* plot */}
        <div className="absolute inset-y-0 left-9 right-2">
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="progressArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.28" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 50, 100].map((p) => (
              <line
                key={p}
                x1="0"
                x2="100"
                y1={y(p)}
                y2={y(p)}
                stroke="var(--color-ink-700)"
                strokeWidth="1"
                strokeDasharray={p === 50 ? "3 4" : undefined}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {dueX !== null && (
              <line
                x1={dueX}
                x2={dueX}
                y1="0"
                y2="100"
                stroke={overdue ? "var(--color-rust-300)" : "var(--color-ink-400)"}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            )}
            <path d={area} fill="url(#progressArea)" />
            <path
              d={line}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* update markers */}
          {updates.map((u, i) => (
            <span
              key={u.id}
              className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-900 ${accent}`}
              style={{ left: `${xs[i]}%`, top: `${y(u.progress)}%` }}
            />
          ))}

          {/* current value */}
          {last && (
            <span
              className={`absolute rounded-sm px-1.5 py-0.5 font-display text-sm font-semibold text-ink-950 ${accent}`}
              style={{
                left: `${lastX}%`,
                top: `${y(last.progress)}%`,
                transform:
                  lastX > 85
                    ? "translate(-100%, calc(-100% - 10px))"
                    : lastX < 8
                    ? "translate(0, calc(-100% - 10px))"
                    : "translate(-50%, calc(-100% - 10px))",
              }}
            >
              {last.progress}%
            </span>
          )}

          {/* today */}
          {!completed && nowX <= 100 && (
            <span
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-200 bg-ink-900"
              style={{ left: `${nowX}%`, top: `${y(prev)}%` }}
              title="Today"
            />
          )}

          {/* due date */}
          {dueX !== null && dueDate && (
            <span
              className={`absolute top-0 whitespace-nowrap text-xs font-medium ${
                overdue ? "text-rust-300" : "text-ink-300"
              }`}
              style={
                dueX > 70
                  ? { right: `${100 - dueX}%`, paddingRight: 6 }
                  : { left: `${dueX}%`, paddingLeft: 6 }
              }
            >
              {overdue ? "Overdue, was due" : "Due"}{" "}
              {formatDay(dayStart(dueDate), withYear)}
            </span>
          )}
        </div>
      </div>

      {/* x axis */}
      <div className="mt-2 ml-9 mr-2 flex justify-between font-mono text-[10px] text-ink-400">
        <span>{formatDay(start, withYear)}</span>
        <span>{formatDay(end - 1, withYear)}</span>
      </div>
    </div>
  );
}
