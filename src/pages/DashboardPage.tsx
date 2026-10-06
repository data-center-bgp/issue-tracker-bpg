import { useMemo } from "react";
import { DashboardView } from "../components/dashboard/DashboardView";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Panel } from "../components/ui/Panel";
import { Spinner } from "../components/ui/Spinner";
import { useBusinessUnits } from "../hooks/useBusinessUnits";
import { useDashboardData } from "../hooks/useDashboardData";
import { computeDashboardStats } from "../lib/dashboard";

export function DashboardPage() {
  const units = useBusinessUnits();
  const data = useDashboardData();

  const stats = useMemo(
    () =>
      computeDashboardStats(
        data.issues,
        units.businessUnits,
        data.kpis,
        data.today
      ),
    [data.issues, data.kpis, data.today, units.businessUnits]
  );

  const loading = units.loading || data.loading;
  const error = units.error || data.error;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink-50 mb-2">
          Dashboard
        </h1>
        <p className="text-ink-400 font-mono text-sm">
          Issues, deadlines and progress across your business units
        </p>
      </div>

      {loading ? (
        <Panel className="p-12 flex justify-center">
          <Spinner />
        </Panel>
      ) : error ? (
        <ErrorBanner message={error} />
      ) : (
        <DashboardView stats={stats} />
      )}
    </div>
  );
}
