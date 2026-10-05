import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Spinner } from "../components/ui/Spinner";
import { StatusStamp } from "../components/ui/StatusStamp";
import { ProgressGauge } from "../components/ui/ProgressGauge";
import { BackLink } from "../components/ui/BackLink";
import { PencilIcon, TrashIcon } from "../components/ui/icons";
import { formatBusinessUnitName } from "../lib/format";

interface Issue {
  id: number;
  created_at: string;
  updated_at: string;
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchIssueDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch issue details
      const { data: issueData, error: issueError } = await supabase
        .from("issues")
        .select("*")
        .eq("id", issueId)
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

  const handleDelete = async () => {
    if (!issue) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const { error } = await supabase.from("issues").delete().eq("id", issue.id);
      if (error) throw error;
      navigate(`/business-unit/${issue.business_unit_id}`);
    } catch (error: unknown) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete issue"
      );
      setDeleting(false);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !issue || !businessUnit) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorBanner message={error || "Issue not found"} />
        <Button variant="primary" onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <BackLink onClick={() => navigate(`/business-unit/${issue.business_unit_id}`)}>
          Back to {formatBusinessUnitName(businessUnit.business_unit)}
        </BackLink>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-3xl font-semibold text-ink-50">
            Issue Details
          </h1>
        </div>
        <p className="text-ink-400 font-mono text-sm">
          #{issue.id.toString().padStart(4, "0")}
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
          {/* Business Unit & KPI Info */}
          <Panel className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-ink-400 font-mono text-xs uppercase tracking-widest mb-1">
                  Business Unit
                </p>
                <p className="text-ink-50 font-medium text-lg">
                  {formatBusinessUnitName(businessUnit.business_unit)}
                </p>
              </div>
              <div>
                <p className="text-ink-400 font-mono text-xs uppercase tracking-widest mb-1">
                  KPI
                </p>
                <p className="text-ink-50 font-medium text-lg">
                  {kpi ? (
                    kpi.kpi_type
                  ) : (
                    <em className="text-ink-400 not-italic">No KPI assigned</em>
                  )}
                </p>
              </div>
            </div>
          </Panel>

          {/* Problem Section */}
          <Panel accent="rust" className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink-50 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-rust-400"
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
            <p className="text-ink-200 whitespace-pre-wrap">
              {issue.problem || (
                <em className="text-ink-400 not-italic">No problem description</em>
              )}
            </p>
          </Panel>

          {/* Solution Section */}
          <Panel accent="moss" className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink-50 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-moss-400"
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
            <p className="text-ink-200 whitespace-pre-wrap">
              {issue.solution || (
                <em className="text-ink-400 not-italic">No solution provided</em>
              )}
            </p>
          </Panel>

          {/* To Do Section */}
          <Panel accent="gold" className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink-50 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gold-400"
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
            <p className="text-ink-200 whitespace-pre-wrap">
              {issue.to_do || <em className="text-ink-400 not-italic">No action items</em>}
            </p>
          </Panel>

          {/* To Do Tools Section */}
          <Panel className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink-50 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-ink-300"
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
            <p className="text-ink-200 whitespace-pre-wrap">
              {issue.to_do_tools || (
                <em className="text-ink-400 not-italic">No tools specified</em>
              )}
            </p>
          </Panel>

          {/* Status & Progress */}
          <Panel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-ink-400 font-mono text-xs uppercase tracking-widest mb-2">
                  Status
                </p>
                <StatusStamp completed={issue.progress === 100} />
              </div>
              <div className="text-right">
                <p className="text-ink-400 font-mono text-xs uppercase tracking-widest mb-2">
                  Progress
                </p>
                <span className="text-ink-50 font-mono font-bold text-2xl">
                  {issue.progress}%
                </span>
              </div>
            </div>
            <ProgressGauge progress={issue.progress} />
          </Panel>

          {/* Timeline */}
          <Panel className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink-50 mb-4">
              Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-ink-400 font-mono text-xs uppercase tracking-widest">
                  Created At
                </p>
                <p className="text-ink-50 font-medium">
                  {formatDateTime(issue.created_at)}
                </p>
              </div>
              <div>
                <p className="text-ink-400 font-mono text-xs uppercase tracking-widest">
                  Open Date
                </p>
                <p className="text-ink-50 font-medium">
                  {formatDate(issue.open_date)}
                </p>
              </div>
              <div>
                <p className="text-ink-400 font-mono text-xs uppercase tracking-widest">
                  Due Date
                </p>
                <p className="text-ink-50 font-medium">
                  {formatDate(issue.due_date)}
                </p>
              </div>
              <div>
                <p className="text-ink-400 font-mono text-xs uppercase tracking-widest">
                  Actual Close Date
                </p>
                <p className="text-ink-50 font-medium">
                  {issue.actual_close_date ? (
                    formatDate(issue.actual_close_date)
                  ) : (
                    <em className="text-ink-400 not-italic">Not closed yet</em>
                  )}
                </p>
              </div>
              <div>
                <p className="text-ink-400 font-mono text-xs uppercase tracking-widest">
                  Last Updated
                </p>
                <p className="text-ink-50 font-medium">
                  {issue.updated_at ? (
                    formatDateTime(issue.updated_at)
                  ) : (
                    <em className="text-ink-400 not-italic">No updates</em>
                  )}
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Edit / Delete */}
        <div className="mt-6">
          {deleteError && (
            <div className="mb-4">
              <ErrorBanner message={deleteError} />
            </div>
          )}
          {confirmingDelete ? (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-ink-200 font-mono text-sm">
                Delete this issue? This cannot be undone.
              </span>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                {deleting ? "Deleting..." : "Confirm Delete"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button
                onClick={() => navigate(`/issue/${issue.id}/edit`)}
                className="flex items-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Issue
              </Button>
              <Button
                variant="danger"
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Delete Issue
              </Button>
            </div>
          )}
        </div>
    </div>
  );
}
