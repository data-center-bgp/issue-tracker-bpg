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

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 grid gap-4 sm:grid-cols-[8rem_1fr]"
    >
      <div>
        <label
          htmlFor="updateProgress"
          className="block text-sm font-medium text-ink-200 mb-2"
        >
          Progress (%)
        </label>
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
          className={inputClasses}
        />
        <input
          type="range"
          aria-label="Progress slider"
          min={0}
          max={100}
          step={5}
          value={Number(progress) || 0}
          onChange={(e) => setProgress(e.target.value)}
          className="mt-3 w-full accent-gold-400"
        />
      </div>
      <div>
        <label
          htmlFor="updateNote"
          className="block text-sm font-medium text-ink-200 mb-2"
        >
          What happened? *
        </label>
        <textarea
          id="updateNote"
          required
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe what was done since the last update..."
          className={`${inputClasses} resize-none`}
        />
      </div>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          disabled={saving || !note.trim()}
          className="flex items-center gap-2"
        >
          {!saving && <PlusIcon className="w-4 h-4" />}
          {saving ? "Saving..." : "Add Progress Update"}
        </Button>
        <span className="font-mono text-xs text-ink-400">
          Setting 100% marks the issue completed.
        </span>
      </div>
      {error && (
        <div className="sm:col-span-2">
          <ErrorBanner message={error} />
        </div>
      )}
    </form>
  );
}
