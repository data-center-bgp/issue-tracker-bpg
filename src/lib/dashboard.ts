export interface DashboardIssue {
  id: number;
  problem: string | null;
  progress: number | null;
  status: string | null;
  business_unit_id: number | null;
  kpi_id: number | null;
  due_date: string | null;
}

export interface DashboardKpi {
  id: number;
  kpi_type: string | null;
}

export interface DashboardBusinessUnit {
  id: number;
  business_unit: string;
}

export interface BusinessUnitStats {
  id: number;
  name: string;
  total: number;
  open: number;
  overdue: number;
  avgOpenProgress: number | null;
}

export interface KpiStats {
  kpiType: string;
  open: number;
}

export interface AttentionItem {
  issue: DashboardIssue;
  businessUnitName: string;
  // Negative when overdue, 0 when due today.
  daysUntilDue: number;
}

export interface DashboardStats {
  total: number;
  open: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  avgOpenProgress: number | null;
  byBusinessUnit: BusinessUnitStats[];
  byKpi: KpiStats[];
  attention: AttentionItem[];
  attentionTotal: number;
}

export const DUE_SOON_DAYS = 7;
export const MAX_KPI_ROWS = 8;
export const MAX_ATTENTION_ROWS = 8;

// Local calendar date as YYYY-MM-DD, matching the `date` columns in the database.
export function todayString(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function daysBetween(from: string, to: string): number {
  const parse = (s: string) => {
    const [y, m, d] = s.slice(0, 10).split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((parse(to) - parse(from)) / 86_400_000);
}

export function isCompleted(issue: DashboardIssue): boolean {
  return issue.status === "completed" || Number(issue.progress ?? 0) >= 100;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function computeDashboardStats(
  issues: DashboardIssue[],
  businessUnits: DashboardBusinessUnit[],
  kpis: DashboardKpi[],
  today: string
): DashboardStats {
  const kpiNameById = new Map<number, string>();
  for (const kpi of kpis) {
    if (kpi.kpi_type) kpiNameById.set(kpi.id, kpi.kpi_type);
  }
  const unitNameById = new Map(
    businessUnits.map((u) => [u.id, u.business_unit] as const)
  );

  const unitAcc = new Map<
    number,
    { total: number; open: number; overdue: number; openProgress: number[] }
  >();
  for (const unit of businessUnits) {
    unitAcc.set(unit.id, { total: 0, open: 0, overdue: 0, openProgress: [] });
  }

  const openByKpi = new Map<string, number>();
  const openProgress: number[] = [];
  const attention: AttentionItem[] = [];
  let completed = 0;
  let overdue = 0;
  let dueSoon = 0;

  for (const issue of issues) {
    const unit =
      issue.business_unit_id != null
        ? unitAcc.get(issue.business_unit_id)
        : undefined;
    if (unit) unit.total += 1;

    if (isCompleted(issue)) {
      completed += 1;
      continue;
    }

    const progress = Number(issue.progress ?? 0);
    openProgress.push(progress);
    if (unit) {
      unit.open += 1;
      unit.openProgress.push(progress);
    }

    const kpiName =
      issue.kpi_id != null ? kpiNameById.get(issue.kpi_id) : undefined;
    if (kpiName) openByKpi.set(kpiName, (openByKpi.get(kpiName) ?? 0) + 1);

    if (issue.due_date) {
      const daysUntilDue = daysBetween(today, issue.due_date);
      if (daysUntilDue < 0) {
        overdue += 1;
        if (unit) unit.overdue += 1;
      } else if (daysUntilDue <= DUE_SOON_DAYS) {
        dueSoon += 1;
      }
      if (daysUntilDue <= DUE_SOON_DAYS) {
        attention.push({
          issue,
          businessUnitName:
            (issue.business_unit_id != null
              ? unitNameById.get(issue.business_unit_id)
              : undefined) ?? "",
          daysUntilDue,
        });
      }
    }
  }

  attention.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const byBusinessUnit: BusinessUnitStats[] = businessUnits.map((u) => {
    const acc = unitAcc.get(u.id)!;
    return {
      id: u.id,
      name: u.business_unit,
      total: acc.total,
      open: acc.open,
      overdue: acc.overdue,
      avgOpenProgress: average(acc.openProgress),
    };
  });

  const byKpi: KpiStats[] = [...openByKpi.entries()]
    .map(([kpiType, open]) => ({ kpiType, open }))
    .sort((a, b) => b.open - a.open || a.kpiType.localeCompare(b.kpiType))
    .slice(0, MAX_KPI_ROWS);

  return {
    total: issues.length,
    open: issues.length - completed,
    completed,
    overdue,
    dueSoon,
    avgOpenProgress: average(openProgress),
    byBusinessUnit,
    byKpi,
    attention: attention.slice(0, MAX_ATTENTION_ROWS),
    attentionTotal: attention.length,
  };
}
