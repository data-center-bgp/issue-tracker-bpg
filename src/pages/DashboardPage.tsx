import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Spinner } from "../components/ui/Spinner";

interface BusinessUnit {
  id: number;
  business_unit: string;
}

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessUnits();
  }, []);

  const fetchBusinessUnits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("business_units")
        .select("id, business_unit")
        .order("business_unit", { ascending: true });

      if (error) throw error;
      setBusinessUnits(data || []);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch business units"
      );
    } finally {
      setLoading(false);
    }
  };

  // Format business unit name: remove underscores and capitalize each word
  const formatBusinessUnitName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Short mono code derived from the business unit name, e.g. "PLANT_OPS" -> "PL-OP"
  const unitCode = (name: string, id: number) => {
    const parts = name.split("_").filter(Boolean);
    const initials = parts.map((p) => p.slice(0, 2).toUpperCase()).join("-");
    return initials || `BU-${id}`;
  };

  const handleBusinessUnitClick = (unitId: number) => {
    navigate(`/business-unit/${unitId}`);
  };

  return (
    <div className="min-h-screen bg-ledger p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink-50 mb-2">
              Issue Tracker Dashboard
            </h1>
            <p className="text-ink-300 font-mono text-sm">
              Logged in as {user?.email}
            </p>
          </div>
          <Button variant="secondary" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        {/* Business Units Section */}
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
                    <span className="font-mono text-xs text-gold-400 border border-ink-700 rounded-sm px-2 py-1">
                      {unitCode(unit.business_unit, unit.id)}
                    </span>
                    <div>
                      <h3 className="font-medium text-ink-50 group-hover:text-gold-300 transition-colors">
                        {formatBusinessUnitName(unit.business_unit)}
                      </h3>
                      <p className="text-sm text-ink-400">View Issues</p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-ink-500 group-hover:text-gold-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
