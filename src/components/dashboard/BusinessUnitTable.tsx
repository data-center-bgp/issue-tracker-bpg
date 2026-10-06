import { Link } from "react-router-dom";
import type { DashboardStats } from "../../lib/dashboard";
import { formatBusinessUnitName } from "../../lib/format";
import { Panel } from "../ui/Panel";
import { ProgressGauge } from "../ui/ProgressGauge";
import { BuildingIcon, ChevronRightIcon, ClockIcon } from "../ui/icons";

// Name | issues bar | open | overdue | average progress. The bar and progress
// columns drop out on narrow screens so the counts stay readable.
const COLUMNS =
  "grid items-center gap-4 px-5 grid-cols-[minmax(0,1fr)_3.5rem_4.5rem] lg:grid-cols-[minmax(12rem,1.2fr)_minmax(0,1.6fr)_3.5rem_4.5rem_9rem_1rem]";

export function BusinessUnitTable({ stats }: { stats: DashboardStats }) {
  const rows = stats.byBusinessUnit;
  const maxTotal = Math.max(1, ...rows.map((r) => r.total));

  return (
    <Panel className="overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h2 className="font-display text-lg font-semibold text-ink-50">
          Business units
        </h2>
        <p className="text-sm text-ink-400">
          Select a unit to view its issues. Bar length is the number of issues.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 pb-8 pt-4 text-sm text-ink-300 text-center">
          No business units found.
        </p>
      ) : (
        <>
          <div
            className={`${COLUMNS} py-2 border-t border-ink-700 font-mono text-[11px] uppercase tracking-widest text-ink-500`}
          >
            <span>Unit</span>
            <span className="hidden lg:block">Issues</span>
            <span className="text-right">Open</span>
            <span className="text-right">Overdue</span>
            <span className="hidden lg:block">Avg progress</span>
            <span className="hidden lg:block" />
          </div>
          <ul>
            {rows.map((row) => (
              <li key={row.id} className="border-t border-ink-700">
                <Link
                  to={`/business-unit/${row.id}`}
                  className={`${COLUMNS} py-3 group hover:bg-ink-800 transition-colors`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <BuildingIcon className="w-4 h-4 shrink-0 text-ink-500" />
                    <span
                      className="text-sm font-medium text-ink-50 group-hover:text-gold-300 transition-colors truncate"
                      title={formatBusinessUnitName(row.name)}
                    >
                      {formatBusinessUnitName(row.name)}
                    </span>
                  </span>

                  <span className="hidden lg:flex items-center gap-2 min-w-0">
                    {row.total > 0 ? (
                      <>
                        <span
                          className="h-2.5 bg-gold-400 rounded-r-[4px] shrink-0"
                          style={{
                            width: `${(row.total / maxTotal) * 85}%`,
                            minWidth: 4,
                          }}
                          title={`${row.total} ${row.total === 1 ? "issue" : "issues"}, ${row.total - row.open} completed`}
                        />
                        <span className="text-sm text-ink-200 tabular-nums">
                          {row.total}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-ink-500">No issues</span>
                    )}
                  </span>

                  <span className="text-right text-sm text-ink-200 tabular-nums">
                    {row.open}
                  </span>

                  <span className="flex items-center justify-end gap-1.5 text-sm text-ink-200 tabular-nums">
                    {row.overdue > 0 && (
                      <ClockIcon className="w-3.5 h-3.5 text-rust-400" />
                    )}
                    {row.overdue}
                  </span>

                  <span className="hidden lg:flex items-center gap-3">
                    {row.avgOpenProgress === null ? (
                      <span className="text-sm text-ink-500">—</span>
                    ) : (
                      <>
                        <span className="flex-1">
                          <ProgressGauge progress={row.avgOpenProgress} />
                        </span>
                        <span className="w-9 text-right font-mono text-xs text-ink-300">
                          {row.avgOpenProgress}%
                        </span>
                      </>
                    )}
                  </span>

                  <ChevronRightIcon className="hidden lg:block w-4 h-4 text-ink-500 group-hover:text-gold-400 transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}
