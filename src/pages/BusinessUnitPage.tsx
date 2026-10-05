import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Spinner } from "../components/ui/Spinner";
import { StatusStamp } from "../components/ui/StatusStamp";
import { ProgressGauge } from "../components/ui/ProgressGauge";
import { BackLink } from "../components/ui/BackLink";
import { PlusIcon } from "../components/ui/icons";
import { formatBusinessUnitName } from "../lib/format";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !businessUnit) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorBanner message={error || "Business unit not found"} />
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard")}
          className="mt-4"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <BackLink onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </BackLink>
        <h1 className="font-display text-3xl font-semibold text-ink-50 mb-2">
          {formatBusinessUnitName(businessUnit.business_unit)}
        </h1>
        <p className="text-ink-300 font-mono text-sm">
          {issues.length} {issues.length === 1 ? "issue" : "issues"} tracked
        </p>
      </div>

      {/* Add Issue Button */}
      <div className="mb-6">
        <Button
          onClick={() => navigate(`/business-unit/${businessUnitId}/new-issue`)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add New Issue
        </Button>
      </div>

      {/* Issues List */}
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-ink-50 mb-4">
          Issues
        </h2>
      </div>
      {issues.length === 0 ? (
          <Panel className="p-12">
            <p className="text-ink-300 text-center text-lg">
              No issues found for this business unit.
            </p>
          </Panel>
        ) : (
          <>
            <div className="border border-ink-700 rounded-md divide-y divide-ink-700 overflow-hidden">
              {currentIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => handleIssueClick(issue.id)}
                  className="bg-ink-900 hover:bg-ink-800 transition-colors cursor-pointer group p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs text-ink-500">
                          #{issue.id.toString().padStart(4, "0")}
                        </span>
                        <h3 className="text-lg font-semibold text-ink-50 group-hover:text-gold-300 transition-colors truncate">
                          {issue.problem}
                        </h3>
                      </div>
                      <div className="flex items-center gap-6 text-sm mb-3 flex-wrap">
                        {issue.kpi && (
                          <span className="text-ink-300 font-mono text-xs uppercase tracking-wide">
                            {issue.kpi.kpi_type}
                          </span>
                        )}
                        <span className="flex items-center gap-2 text-ink-400 font-mono text-xs">
                          Due {formatDate(issue.due_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 max-w-sm">
                        <div className="flex-1">
                          <ProgressGauge progress={issue.progress} />
                        </div>
                        <span className="font-mono text-xs text-ink-300 w-10 text-right">
                          {issue.progress}%
                        </span>
                      </div>
                    </div>
                    <StatusStamp completed={issue.status === "completed"} />
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
                  className="px-4 py-2 bg-ink-900 border border-ink-700 text-ink-50 rounded-sm hover:bg-ink-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-sm transition-colors font-mono text-sm ${
                          currentPage === page
                            ? "bg-gold-400 text-ink-950 font-semibold"
                            : "bg-ink-900 border border-ink-700 text-ink-50 hover:bg-ink-800"
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
                  className="px-4 py-2 bg-ink-900 border border-ink-700 text-ink-50 rounded-sm hover:bg-ink-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="mt-4 text-center text-ink-400 text-sm font-mono">
              Showing {startIndex + 1} to {Math.min(endIndex, issues.length)} of{" "}
              {issues.length} issues
            </div>
        </>
      )}
    </div>
  );
}
