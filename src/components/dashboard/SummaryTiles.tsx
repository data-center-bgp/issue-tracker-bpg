import type { ReactNode } from "react";
import type { DashboardStats } from "../../lib/dashboard";
import { Panel } from "../ui/Panel";
import { ClockIcon } from "../ui/icons";

function Dot({ className }: { className: string }) {
  return (
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
}

interface StatTileProps {
  label: string;
  value: string;
  hint: string;
  mark?: ReactNode;
}

function StatTile({ label, value, hint, mark }: StatTileProps) {
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2 text-sm text-ink-300">
        {mark}
        {label}
      </div>
      <p className="mt-2 text-3xl font-semibold text-ink-50">{value}</p>
      <p className="mt-1 text-xs text-ink-400">{hint}</p>
    </Panel>
  );
}

export function SummaryTiles({ stats }: { stats: DashboardStats }) {
  const completedShare =
    stats.total > 0
      ? `${Math.round((stats.completed / stats.total) * 100)}% of all issues`
      : "No issues yet";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatTile
        label="Total issues"
        value={String(stats.total)}
        hint="Every status"
      />
      <StatTile
        label="On progress"
        value={String(stats.open)}
        hint="Not completed yet"
        mark={<Dot className="bg-gold-400" />}
      />
      <StatTile
        label="Completed"
        value={String(stats.completed)}
        hint={completedShare}
        mark={<Dot className="bg-moss-400" />}
      />
      <StatTile
        label="Overdue"
        value={String(stats.overdue)}
        hint="Past due date and still open"
        mark={<ClockIcon className="w-4 h-4 text-rust-400" />}
      />
      <StatTile
        label="Progress"
        value={stats.avgOpenProgress === null ? "—" : `${stats.avgOpenProgress}%`}
        hint="Average across open issues"
      />
    </div>
  );
}
