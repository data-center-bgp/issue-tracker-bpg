export interface ProgressUpdate {
  id: number;
  issue_id: number;
  progress: number;
  note: string;
  author_name: string | null;
  created_at: string;
}

interface ProgressTimelineProps {
  // Oldest first.
  updates: ProgressUpdate[];
  openedAt: string;
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function Dot({ done }: { done: boolean }) {
  return (
    <span
      className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-ink-900 ${
        done ? "bg-moss-400" : "bg-gold-400"
      }`}
    />
  );
}

export function ProgressTimeline({ updates, openedAt }: ProgressTimelineProps) {
  // The change each update made, relative to the one before it.
  const entries = updates
    .map((update, index) => ({
      update,
      delta: update.progress - (index === 0 ? 0 : updates[index - 1].progress),
    }))
    .reverse();

  return (
    <ol className="border-l border-ink-700 ml-1.5">
      {entries.length === 0 && (
        <li className="relative pl-6 pb-6 text-sm text-ink-400">
          No progress updates yet.
        </li>
      )}

      {entries.map(({ update, delta }) => {
        const done = update.progress === 100;
        return (
          <li key={update.id} className="relative pl-6 pb-6">
            <Dot done={done} />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className={`font-mono text-lg font-semibold ${
                  done ? "text-moss-400" : "text-gold-300"
                }`}
              >
                {update.progress}%
              </span>
              {delta !== 0 && (
                <span className="font-mono text-xs text-ink-400">
                  {delta > 0 ? `+${delta}` : delta}%
                </span>
              )}
              {done && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-moss-400">
                  Completed
                </span>
              )}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-ink-100">{update.note}</p>
            <p className="mt-1 font-mono text-xs text-ink-400">
              {formatDateTime(update.created_at)}
              {update.author_name && ` · ${update.author_name}`}
            </p>
          </li>
        );
      })}

      <li className="relative pl-6">
        <Dot done={false} />
        <p className="font-mono text-sm text-ink-300">Issue opened</p>
        <p className="mt-1 font-mono text-xs text-ink-400">
          {formatDateTime(openedAt)}
        </p>
      </li>
    </ol>
  );
}
