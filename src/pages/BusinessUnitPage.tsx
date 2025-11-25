import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Issue {
  id: number;
  problem: string;
  progress: number;
  status: string;
  open_date: string;
  due_date: string;
  created_at: string;
  kpi_id: number | null;
  kpi?: {
    kpi_type: string;
  };
}

interface BusinessUnit {
  id: number;
  business_unit: string;
}

export function BusinessUnitPage() {
  const { businessUnitId } = useParams<{ businessUnitId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [businessUnit, setBusinessUnit] = useState<BusinessUnit | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBusinessUnitAndIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch business unit details
      const { data: unitData, error: unitError } = await supabase
        .from("business_units")
        .select("id, business_unit")
        .eq("id", businessUnitId)
        .single();

      if (unitError) throw unitError;
      setBusinessUnit(unitData);

      // Fetch issues for this business unit with KPI information
      const { data: issuesData, error: issuesError } = await supabase
        .from("issues")
        .select(
          `
          id, 
          problem, 
          progress, 
          status, 
          open_date, 
          due_date, 
          created_at,
          kpi_id,
          kpis (
            kpi_type
          )
        `
        )
        .eq("business_unit_id", businessUnitId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (issuesError) {
        console.error("Issues error:", issuesError);
        throw issuesError;
      }

      // Transform the data to match our interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedIssues = (issuesData || []).map((issue: any) => ({
        ...issue,
        kpi: issue.kpis ? { kpi_type: issue.kpis.kpi_type } : undefined,
      }));

      setIssues(transformedIssues);
    } catch (error: unknown) {
      console.error("Fetch error:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [businessUnitId]);

  useEffect(() => {
    if (businessUnitId) {
      fetchBusinessUnitAndIssues();
    }
  }, [businessUnitId, fetchBusinessUnitAndIssues, location.key]);

  const formatBusinessUnitName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") {
      return "bg-green-500/20 text-green-400 border-green-500/50";
    }
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
  };

  const handleIssueClick = (issueId: number) => {
    navigate(`/issue/${issueId}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(issues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIssues = issues.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error || !businessUnit) {
    return (
      <div className="min-h-screen bg-linear-to-br from-navy-950 via-navy-900 to-navy-800 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg">
            {error || "Business unit not found"}
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-6 py-2 bg-yellow-400 text-navy-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-navy-950 via-navy-900 to-navy-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors mb-3"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            {formatBusinessUnitName(businessUnit.business_unit)}
          </h1>
          <p className="text-navy-300">
            {issues.length} {issues.length === 1 ? "issue" : "issues"} tracked
          </p>
        </div>

        {/* Add Issue Button */}
        <div className="mb-6">
          <button
            onClick={() =>
              navigate(`/business-unit/${businessUnitId}/new-issue`)
            }
            className="px-6 py-3 bg-yellow-400 text-navy-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-400/20"
          >
            + Add New Issue
          </button>
        </div>

        {/* Issues List */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-4">Issues</h2>
        </div>
        {issues.length === 0 ? (
          <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-12">
            <p className="text-navy-300 text-center text-lg">
              No issues found for this business unit.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => handleIssueClick(issue.id)}
                  className="bg-navy-900/50 backdrop-blur-xl rounded-xl shadow-xl border border-navy-700/50 p-6 hover:border-yellow-400/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white group-hover:text-yellow-400 transition-colors">
                          {issue.problem}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            issue.status
                          )}`}
                        >
                          {issue.status === "completed"
                            ? "COMPLETED"
                            : "ON PROGRESS"}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm mb-2">
                        {issue.kpi && (
                          <div className="flex items-center gap-2 text-navy-300">
                            <svg
                              className="w-4 h-4 text-yellow-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            <span className="text-navy-200">
                              {issue.kpi.kpi_type}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-semibold">
                            {issue.progress}% Complete
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-navy-400">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Due: {formatDate(issue.due_date)}</span>
                        </div>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-navy-500 group-hover:text-yellow-400 transition-colors ml-4"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-yellow-400 text-navy-900 font-semibold"
                            : "bg-navy-800 text-white hover:bg-navy-700"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="mt-4 text-center text-navy-400 text-sm">
              Showing {startIndex + 1} to {Math.min(endIndex, issues.length)} of{" "}
              {issues.length} issues
            </div>
          </>
        )}
      </div>
    </div>
  );
}
