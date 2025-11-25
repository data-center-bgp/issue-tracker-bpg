import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Issue {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  business_unit_id: number;
  kpi_id: number | null;
  problem: string;
  solution: string;
  to_do: string | null;
  to_do_tools: string | null;
  progress: number;
  status: string;
  open_date: string;
  due_date: string;
  actual_close_date: string | null;
}

interface BusinessUnit {
  id: number;
  business_unit: string;
}

interface KPI {
  id: number;
  kpi_type: string;
}

export function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [businessUnit, setBusinessUnit] = useState<BusinessUnit | null>(null);
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssueDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch issue details
      const { data: issueData, error: issueError } = await supabase
        .from("issues")
        .select("*")
        .eq("id", issueId)
        .is("deleted_at", null)
        .single();

      if (issueError) throw issueError;
      setIssue(issueData);

      // Fetch business unit
      const { data: buData, error: buError } = await supabase
        .from("business_units")
        .select("id, business_unit")
        .eq("id", issueData.business_unit_id)
        .single();

      if (buError) throw buError;
      setBusinessUnit(buData);

      // Fetch KPI if exists
      if (issueData.kpi_id) {
        const { data: kpiData, error: kpiError } = await supabase
          .from("kpis")
          .select("id, kpi_type")
          .eq("id", issueData.kpi_id)
          .single();

        if (!kpiError) setKpi(kpiData);
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch issue"
      );
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    if (issueId) {
      fetchIssueDetails();
    }
  }, [issueId, fetchIssueDetails]);

  const formatBusinessUnitName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = () => {
    if (issue?.progress === 100) {
      return "bg-green-500/20 text-green-400 border-green-500/50";
    }
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error || !issue || !businessUnit) {
    return (
      <div className="min-h-screen bg-linear-to-br from-navy-950 via-navy-900 to-navy-800 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg">
            {error || "Issue not found"}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-yellow-400 text-navy-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-navy-950 via-navy-900 to-navy-800 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/business-unit/${issue.business_unit_id}`)}
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
            Back to {formatBusinessUnitName(businessUnit.business_unit)}
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Issue Details</h1>
          </div>
          <p className="text-navy-300">Issue #{issue.id}</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Business Unit & KPI Info */}
          <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-navy-400 text-sm mb-1">Business Unit</p>
                <p className="text-white font-medium text-lg">
                  {formatBusinessUnitName(businessUnit.business_unit)}
                </p>
              </div>
              <div>
                <p className="text-navy-400 text-sm mb-1">KPI</p>
                <p className="text-white font-medium text-lg">
                  {kpi ? (
                    kpi.kpi_type
                  ) : (
                    <em className="text-navy-400">No KPI assigned</em>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Problem Section */}
          <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Problem
            </h2>
            <p className="text-navy-200 whitespace-pre-wrap">
              {issue.problem || (
                <em className="text-navy-400">No problem description</em>
              )}
            </p>
          </div>

          {/* Solution Section */}
          <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Solution
            </h2>
            <p className="text-navy-200 whitespace-pre-wrap">
              {issue.solution || (
                <em className="text-navy-400">No solution provided</em>
              )}
            </p>
          </div>

          {/* To Do Section */}
          <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              To Do
            </h2>
            <p className="text-navy-200 whitespace-pre-wrap">
              {issue.to_do || (
                <em className="text-navy-400">No action items</em>
              )}
            </p>
          </div>

          {/* To Do Tools Section */}
          <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Tools Required
            </h2>
            <p className="text-navy-200 whitespace-pre-wrap">
              {issue.to_do_tools || (
                <em className="text-navy-400">No tools specified</em>
              )}
            </p>
          </div>

          {/* Status & Progress */}
          <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-navy-400 text-sm mb-2">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border inline-block ${getStatusColor()}`}
                >
                  {issue.progress === 100 ? "COMPLETED" : "ON PROGRESS"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-navy-400 text-sm mb-2">Progress</p>
                <span className="text-white font-bold text-2xl">
                  {issue.progress}%
                </span>
              </div>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  issue.progress === 100 ? "bg-green-400" : "bg-yellow-400"
                }`}
                style={{ width: `${issue.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-navy-400 text-sm">Created At</p>
                <p className="text-white font-medium">
                  {formatDateTime(issue.created_at)}
                </p>
              </div>
              <div>
                <p className="text-navy-400 text-sm">Open Date</p>
                <p className="text-white font-medium">
                  {formatDate(issue.open_date)}
                </p>
              </div>
              <div>
                <p className="text-navy-400 text-sm">Due Date</p>
                <p className="text-white font-medium">
                  {formatDate(issue.due_date)}
                </p>
              </div>
              <div>
                <p className="text-navy-400 text-sm">Actual Close Date</p>
                <p className="text-white font-medium">
                  {issue.actual_close_date ? (
                    formatDate(issue.actual_close_date)
                  ) : (
                    <em className="text-navy-400">Not closed yet</em>
                  )}
                </p>
              </div>
              <div>
                <p className="text-navy-400 text-sm">Last Updated</p>
                <p className="text-white font-medium">
                  {issue.updated_at ? (
                    formatDateTime(issue.updated_at)
                  ) : (
                    <em className="text-navy-400">No updates</em>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate(`/issue/${issue.id}/edit`)}
            className="px-6 py-3 bg-yellow-400 text-navy-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-400/20"
          >
            Edit Issue
          </button>
        </div>
      </div>
    </div>
  );
}
