import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getErrorMessage } from "../lib/format";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { Button } from "./ui/Button";
import { ErrorBanner } from "./ui/ErrorBanner";
import { PlusIcon } from "./ui/icons";

interface ProgressUpdateFormProps {
  issueId: number;
  currentProgress: number;
  onAdded: () => void;
}

const inputClasses =
  "w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-sm text-ink-50 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all";

// Keep what the user types a clean 0-100 integer: "010" becomes "10", "250"
// becomes "100". An empty field stays empty so it can be cleared and retyped.
function normalizeProgress(value: string): string {
  if (value === "") return "";
  const n = Math.floor(Number(value));
  if (Number.isNaN(n)) return "";
  return String(Math.min(100, Math.max(0, n)));
}

export function ProgressUpdateForm({
  issueId,
  currentProgress,
  onAdded,
}: ProgressUpdateFormProps) {
  const { user } = useAuth();
  const profile = useProfile();
  const [progress, setProgress] = useState(String(currentProgress));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = Number(progress) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase.from("issue_progress_updates").insert({
      issue_id: issueId,
      progress: Number(progress),
      note: note.trim(),
      author_name: profile?.head_name || user?.email || null,
    });

    if (error) {
      setError(getErrorMessage(error, "Failed to add progress update"));
      setSaving(false);
      return;
    }

    setNote("");
    setSaving(false);
    onAdded();
  };

  const change =
    value === currentProgress
      ? "Same as now. The note still goes on the timeline."
      : `Moves progress from ${currentProgress}% to ${value}%.`;

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-md border border-ink-700 bg-ink-950/60 p-4 sm:p-5"
    >
      <h3 className="mb-4 font-display text-base font-semibold text-ink-50">
        Add an update
      </h3>

      <label
        htmlFor="updateProgress"
        className="mb-2 block text-sm font-medium text-ink-200"
      >
        New progress
      </label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          aria-label="Progress slider"
          className="tracker-range flex-1"
          min={0}
          max={100}
          step={5}
          value={value}
          style={{ "--fill": `${value}%` } as React.CSSProperties}
          onChange={(e) => setProgress(e.target.value)}
        />
        <div className="relative w-24 shrink-0">
          <input
            id="updateProgress"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            step={1}
            required
            value={progress}
            // Selecting on focus means typing replaces the old value.
            onFocus={(e) => e.target.select()}
            onChange={(e) => setProgress(normalizeProgress(e.target.value))}
            className={`${inputClasses} pr-8 text-right font-display text-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
            %
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-300">
        {change}
        {value === 100 && " This marks the issue completed."}
      </p>

      <label
        htmlFor="updateNote"
        className="mb-2 mt-5 block text-sm font-medium text-ink-200"
      >
        What happened? *
      </label>
      <textarea
        id="updateNote"
        required
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Describe what was done since the last update..."
        className={`${inputClasses} resize-none`}
      />

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button
          type="submit"
          disabled={saving || !note.trim() || progress === ""}
          className="flex items-center gap-2"
        >
          {!saving && <PlusIcon className="h-4 w-4" />}
          {saving ? "Saving..." : "Add update"}
        </Button>
      </div>
    </form>
  );
}
