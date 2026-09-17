import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { BackLink } from "../components/ui/BackLink";

interface KPI {
  id: number;
  kpi_type: string;
}

export function IssueFormPage() {
  const { issueId, businessUnitId } = useParams<{
    issueId?: string;
    businessUnitId?: string;
  }>();
  const navigate = useNavigate();
  const isEditMode = !!issueId;

  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [kpiId, setKpiId] = useState<number | null>(null);
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [toDo, setToDo] = useState("");
  const [toDoTools, setToDoTools] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [openDate, setOpenDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [actualCloseDate, setActualCloseDate] = useState("");

  const fetchKPIs = useCallback(async () => {
    if (businessUnitId) {
      const { data, error } = await supabase
        .from("kpis")
        .select("id, kpi_type")
        .eq("business_unit_id", businessUnitId)
        .order("kpi_type", { ascending: true });

      if (!error && data) {
        setKpis(data);
      }
    }
  }, [businessUnitId]);

  const fetchIssue = useCallback(async () => {
    if (issueId) {
      setLoading(true);
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .eq("id", issueId)
        .single();

      if (error) {
        setError("Failed to fetch issue");
        setLoading(false);
        return;
      }

      setKpiId(data.kpi_id);
      setProblem(data.problem || "");
      setSolution(data.solution || "");
      setToDo(data.to_do || "");
      setToDoTools(data.to_do_tools || "");
      setProgress(data.progress || 0);
      setOpenDate(
        data.open_date
          ? new Date(data.open_date).toISOString().split("T")[0]
          : ""
      );
      setDueDate(
        data.due_date ? new Date(data.due_date).toISOString().split("T")[0] : ""
      );
      setActualCloseDate(
        data.actual_close_date
          ? new Date(data.actual_close_date).toISOString().split("T")[0]
          : ""
      );
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchKPIs();
    if (isEditMode) {
      fetchIssue();
    }
  }, [fetchKPIs, fetchIssue, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const status = progress === 100 ? "completed" : "on_progress";
      const issueData = {
        business_unit_id: businessUnitId ? parseInt(businessUnitId) : undefined,
        kpi_id: kpiId,
        problem,
        solution,
        to_do: toDo || null,
        to_do_tools: toDoTools || null,
        progress: progress || 0,
        status,
        open_date: openDate,
        due_date: dueDate,
        actual_close_date: actualCloseDate || null,
        updated_at: new Date().toISOString(),
      };

      if (isEditMode) {
        const { error } = await supabase
          .from("issues")
          .update(issueData)
          .eq("id", issueId);

        if (error) throw error;
        navigate(`/issue/${issueId}`);
      } else {
        const { error } = await supabase
          .from("issues")
          .insert([{ ...issueData, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) throw error;
        navigate(`/business-unit/${businessUnitId}`);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to save issue");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-sm text-ink-50 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all";
  const labelClasses = "block text-sm font-medium text-ink-200 mb-2";

  return (
    <div className="min-h-screen bg-ledger p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <BackLink onClick={() => navigate(-1)}>Back</BackLink>
          <h1 className="font-display text-3xl font-semibold text-ink-50 mb-2">
            {isEditMode ? "Edit Issue" : "Add New Issue"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel className="p-8">
            {/* KPI Selection */}
            <div className="mb-6">
              <label htmlFor="kpiId" className={labelClasses}>
                Related KPI *
              </label>
              <select
                id="kpiId"
                value={kpiId || ""}
                onChange={(e) =>
                  setKpiId(e.target.value ? parseInt(e.target.value) : null)
                }
                required
                className={inputClasses}
              >
                <option value="" disabled>
                  -- Select KPI --
                </option>
                {kpis.map((kpi) => (
                  <option key={kpi.id} value={kpi.id}>
                    {kpi.kpi_type}
                  </option>
                ))}
              </select>
            </div>

            {/* Problem */}
            <div className="mb-6">
              <label htmlFor="problem" className={labelClasses}>
                Problem *
              </label>
              <textarea
                id="problem"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                required
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="Describe the problem..."
              />
            </div>

            {/* Solution */}
            <div className="mb-6">
              <label htmlFor="solution" className={labelClasses}>
                Solution *
              </label>
              <textarea
                id="solution"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                required
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="Describe the solution..."
              />
            </div>

            {/* To Do */}
            <div className="mb-6">
              <label htmlFor="toDo" className={labelClasses}>
                To Do
              </label>
              <textarea
                id="toDo"
                value={toDo}
                onChange={(e) => setToDo(e.target.value)}
                rows={3}
                className={`${inputClasses} resize-none`}
                placeholder="List action items (optional)..."
              />
            </div>

            {/* To Do Tools */}
            <div className="mb-6">
              <label htmlFor="toDoTools" className={labelClasses}>
                Tools Required
              </label>
              <textarea
                id="toDoTools"
                value={toDoTools}
                onChange={(e) => setToDoTools(e.target.value)}
                rows={3}
                className={`${inputClasses} resize-none`}
                placeholder="List required tools and resources (optional)..."
              />
            </div>

            {/* Progress */}
            <div className="mb-6">
              <label htmlFor="progress" className={labelClasses}>
                Progress (%)
              </label>
              <input
                type="number"
                id="progress"
                min="0"
                max="100"
                value={progress === 0 ? "" : progress}
                onChange={(e) => {
                  const value = e.target.value;
                  setProgress(value === "" ? 0 : parseInt(value));
                }}
                className={inputClasses}
                placeholder="0"
              />
              <p className="text-xs text-ink-400 mt-1 font-mono">
                Enter a value between 0-100. Default is 0% (On Progress)
              </p>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label htmlFor="openDate" className={labelClasses}>
                  Open Date *
                </label>
                <input
                  type="date"
                  id="openDate"
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="dueDate" className={labelClasses}>
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="actualCloseDate" className={labelClasses}>
                  Actual Close Date
                </label>
                <input
                  type="date"
                  id="actualCloseDate"
                  value={actualCloseDate}
                  onChange={(e) => setActualCloseDate(e.target.value)}
                  className={inputClasses}
                />
                <p className="text-xs text-ink-400 mt-1 font-mono">
                  Fill when issue is resolved
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6">
                <ErrorBanner message={error} />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Issue"
                  : "Create Issue"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </Panel>
        </form>
      </div>
    </div>
  );
}
