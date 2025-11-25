import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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

  const handleBusinessUnitClick = (unitId: number) => {
    navigate(`/business-unit/${unitId}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-navy-950 via-navy-900 to-navy-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Issue Tracker Dashboard
            </h1>
            <p className="text-navy-300">Logged in as {user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="px-6 py-2 bg-navy-800 text-yellow-400 rounded-lg hover:bg-navy-700 transition-colors border border-navy-600"
          >
            Sign Out
          </button>
        </div>

        {/* Business Units Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Business Units</h2>

          {loading ? (
            <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg">
              {error}
            </div>
          ) : businessUnits.length === 0 ? (
            <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-12">
              <p className="text-navy-300 text-center text-lg">
                No business units found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessUnits.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => handleBusinessUnitClick(unit.id)}
                  className="bg-navy-900/50 backdrop-blur-xl rounded-xl shadow-xl border border-navy-700/50 p-6 hover:border-yellow-400/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors">
                        <svg
                          className="w-6 h-6 text-yellow-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
                          {formatBusinessUnitName(unit.business_unit)}
                        </h3>
                        <p className="text-sm text-navy-400">View Issues</p>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-navy-500 group-hover:text-yellow-400 transition-colors"
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
