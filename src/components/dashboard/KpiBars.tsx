import { MAX_KPI_ROWS, type DashboardStats } from "../../lib/dashboard";
import { Panel } from "../ui/Panel";

// Leave room at the bar's tip for its value label.
const MAX_BAR_PERCENT = 88;

export function KpiBars({ stats }: { stats: DashboardStats }) {
  const rows = stats.byKpi;
  const max = Math.max(1, ...rows.map((r) => r.open));

  return (
    <Panel className="p-5">
      <h2 className="font-display text-lg font-semibold text-ink-50">
        Open issues by KPI
      </h2>
      <p className="text-sm text-ink-400 mb-4">
        The {MAX_KPI_ROWS} KPIs with the most open issues.
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-ink-300 py-6 text-center">
          No open issue is linked to a KPI yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.kpiType}>
              <p className="text-sm text-ink-200 truncate mb-1.5" title={row.kpiType}>
                {row.kpiType}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 bg-gold-400 rounded-r-[4px] shrink-0"
                  style={{ width: `${(row.open / max) * MAX_BAR_PERCENT}%`, minWidth: 4 }}
                  title={`${row.open} open ${row.open === 1 ? "issue" : "issues"}`}
                />
                <span className="text-sm text-ink-50">{row.open}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
