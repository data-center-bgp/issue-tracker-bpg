import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
        .is("deleted_at", null)
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

  return (
    <div className="min-h-screen bg-linear-to-br from-navy-950 via-navy-900 to-navy-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
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
            Back
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditMode ? "Edit Issue" : "Add New Issue"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-navy-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-navy-700/50 p-8">
            {/* KPI Selection */}
            <div className="mb-6">
              <label
                htmlFor="kpiId"
                className="block text-sm font-medium text-navy-200 mb-2"
              >
                Related KPI *
              </label>
              <select
                id="kpiId"
                value={kpiId || ""}
                onChange={(e) =>
                  setKpiId(e.target.value ? parseInt(e.target.value) : null)
                }
                required
                className="w-full px-4 py-3 bg-navy-800/50 border border-navy-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
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
              <label
                htmlFor="problem"
                className="block text-sm font-medium text-navy-200 mb-2"
              >
                Problem *
              </label>
              <textarea
                id="problem"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 bg-navy-800/50 border border-navy-600 rounded-lg text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                placeholder="Describe the problem..."
              />
            </div>

            {/* Solution */}
            <div className="mb-6">
              <label
                htmlFor="solution"
                className="block text-sm font-medium text-navy-200 mb-2"
              >
                Solution *
              </label>
              <textarea
                id="solution"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 bg-navy-800/50 border border-navy-600 rounded-lg text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                placeholder="Describe the solution..."
              />
            </div>

            {/* To Do */}
            <div className="mb-6">
              <label
                htmlFor="toDo"
                className="block text-sm font-medium text-navy-200 mb-2"
              >
                To Do
              </label>
              <textarea
                id="toDo"
                value={toDo}
                onChange={(e) => setToDo(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-navy-800/50 border border-navy-600 rounded-lg text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                placeholder="List action items (optional)..."
              />
            </div>

            {/* To Do Tools */}
            <div className="mb-6">
              <label
                htmlFor="toDoTools"
                className="block text-sm font-medium text-navy-200 mb-2"
              >
                Tools Required
              </label>
              <textarea
                id="toDoTools"
                value={toDoTools}
                onChange={(e) => setToDoTools(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-navy-800/50 border border-navy-600 rounded-lg text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                placeholder="List required tools and resources (optional)..."
              />
            </div>

            {/* Progress */}
            <div className="mb-6">
              <label
                htmlFor="progress"
                className="block text-sm font-medium text-navy-200 mb-2"
              >
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
                className="w-full px-4 py-3 bg-navy-800/50 border border-navy-600 rounded-lg text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="0"
              />
              <p className="text-xs text-navy-400 mt-1">
                Enter a value between 0-100. Default is 0% (On Progress)
              </p>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label
                  htmlFor="openDate"
                  className="block text-sm font-medium text-navy-200 mb-2"
                >
                  Open Date *
                </label>
                <input
                  type="date"
                  id="openDate"
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-navy-800/50 border border-navy-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-navy-200 mb-2"
                >
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-navy-800/50 border border-navy-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="actualCloseDate"
                  className="block text-sm font-medium text-navy-200 mb-2"
                >
                  Actual Close Date
                </label>
                <input
                  type="date"
                  id="actualCloseDate"
                  value={actualCloseDate}
                  onChange={(e) => setActualCloseDate(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-800/50 border border-navy-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-navy-400 mt-1">
                  Fill when issue is resolved
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-linear-to-r from-yellow-400 to-yellow-500 text-navy-900 font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-navy-900 transition-all duration-200 shadow-lg shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Issue"
                  : "Create Issue"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-navy-800 text-yellow-400 rounded-lg hover:bg-navy-700 transition-colors border border-navy-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
