import { useNavigate } from "react-router-dom";
import { Panel } from "../components/ui/Panel";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Spinner } from "../components/ui/Spinner";
import { BuildingIcon, ChevronRightIcon } from "../components/ui/icons";
import { useBusinessUnits } from "../hooks/useBusinessUnits";
import { formatBusinessUnitName } from "../lib/format";

export function DashboardPage() {
  const navigate = useNavigate();
  const { businessUnits, loading, error } = useBusinessUnits();

  const handleBusinessUnitClick = (unitId: number) => {
    navigate(`/business-unit/${unitId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink-50 mb-2">
          Dashboard
        </h1>
        <p className="text-ink-400 font-mono text-sm">
          Select a business unit to view its issues
        </p>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-ink-50 mb-4">
          Business Units
        </h2>

        {loading ? (
          <Panel className="p-12 flex justify-center">
            <Spinner />
          </Panel>
        ) : error ? (
          <ErrorBanner message={error} />
        ) : businessUnits.length === 0 ? (
          <Panel className="p-12">
            <p className="text-ink-300 text-center text-lg">
              No business units found.
            </p>
          </Panel>
        ) : (
          <div className="divide-y divide-ink-700 border border-ink-700 rounded-md overflow-hidden">
            {businessUnits.map((unit) => (
              <div
                key={unit.id}
                onClick={() => handleBusinessUnitClick(unit.id)}
                className="bg-ink-900 hover:bg-ink-800 transition-colors cursor-pointer group flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-sm bg-gold-400/10 flex items-center justify-center shrink-0">
                    <BuildingIcon className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-ink-50 group-hover:text-gold-300 transition-colors">
                      {formatBusinessUnitName(unit.business_unit)}
                    </h3>
                    <p className="text-sm text-ink-400">View Issues</p>
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-ink-500 group-hover:text-gold-400 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
