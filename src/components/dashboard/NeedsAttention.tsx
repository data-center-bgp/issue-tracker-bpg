import { Link } from "react-router-dom";
import { DUE_SOON_DAYS, type DashboardStats } from "../../lib/dashboard";
import { formatBusinessUnitName } from "../../lib/format";
import { Panel } from "../ui/Panel";
import { CalendarIcon, CheckIcon, ClockIcon } from "../ui/icons";

function dueLabel(daysUntilDue: number): string {
  if (daysUntilDue < 0) {
    const days = Math.abs(daysUntilDue);
    return `${days} ${days === 1 ? "day" : "days"} overdue`;
  }
  if (daysUntilDue === 0) return "Due today";
  if (daysUntilDue === 1) return "Due tomorrow";
  return `Due in ${daysUntilDue} days`;
}

export function NeedsAttention({ stats }: { stats: DashboardStats }) {
  const { attention, attentionTotal } = stats;

  return (
    <Panel className="overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h2 className="font-display text-lg font-semibold text-ink-50">
          Needs attention
        </h2>
        <p className="text-sm text-ink-400">
          Overdue, or due within {DUE_SOON_DAYS} days. Soonest first.
        </p>
      </div>

      {attention.length === 0 ? (
        <div className="px-5 pb-8 pt-4 flex flex-col items-center text-center gap-2">
          {stats.total > 0 && <CheckIcon className="w-5 h-5 text-moss-400" />}
          <p className="text-sm text-ink-300">
            {stats.total === 0
              ? "No issues yet. Open a business unit to log the first one."
              : `Nothing is overdue or due in the next ${DUE_SOON_DAYS} days.`}
          </p>
        </div>
      ) : (
        <ul>
          {attention.map(({ issue, businessUnitName, daysUntilDue }) => {
            const overdue = daysUntilDue < 0;
            return (
              <li key={issue.id} className="border-t border-ink-700">
                <Link
                  to={`/issue/${issue.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-ink-800 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm text-ink-50 truncate"
                      title={issue.problem ?? undefined}
                    >
                      {issue.problem || "Untitled issue"}
                    </p>
                    <p className="text-xs text-ink-400 truncate">
                      <span className="font-mono">
                        #{String(issue.id).padStart(4, "0")}
                      </span>
                      {businessUnitName &&
                        ` · ${formatBusinessUnitName(businessUnitName)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-200 shrink-0">
                    {overdue ? (
                      <ClockIcon className="w-4 h-4 text-rust-400" />
                    ) : (
                      <CalendarIcon className="w-4 h-4 text-gold-400" />
                    )}
                    {dueLabel(daysUntilDue)}
                  </div>
                  <span className="hidden sm:block w-10 text-right font-mono text-xs text-ink-300 shrink-0">
                    {Number(issue.progress ?? 0)}%
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {attentionTotal > attention.length && (
        <p className="px-5 py-3 border-t border-ink-700 text-xs text-ink-400">
          +{attentionTotal - attention.length} more not shown
        </p>
      )}
    </Panel>
  );
}
