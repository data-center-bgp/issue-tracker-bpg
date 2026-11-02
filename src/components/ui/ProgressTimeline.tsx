import { CheckIcon } from "./icons";

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

const sameYear = (value: string) =>
  new Date(value).getFullYear() === new Date().getFullYear();

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear(value) ? {} : { year: "numeric" }),
  });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Shows where an update moved progress to, against the full 0-100 track.
function JumpBar({ from, to }: { from: number; to: number }) {
  const low = Math.min(from, to);
  const high = Math.max(from, to);
  const color =
    to < from ? "bg-rust-300" : to === 100 ? "bg-moss-400" : "bg-gold-400";

  return (
    <div
      className="relative mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-ink-800"
      aria-hidden="true"
    >
      <div
        className="absolute inset-y-0 left-0 bg-ink-500"
        style={{ width: `${low}%` }}
      />
      <div
        className={`absolute inset-y-0 ${color}`}
        style={{ left: `${low}%`, width: `${high - low}%` }}
      />
    </div>
  );
}

function Node({ kind }: { kind: "latest" | "done" | "past" | "opened" }) {
  const base =
    "relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2";
  if (kind === "done") {
    return (
      <span className={`${base} border-moss-400 bg-moss-400 text-ink-950`}>
        <CheckIcon className="h-3 w-3" />
      </span>
    );
  }
  if (kind === "latest") {
    return <span className={`${base} border-gold-400 bg-gold-400`} />;
  }
  if (kind === "past") {
    return <span className={`${base} border-gold-400/60 bg-ink-900`} />;
  }
  return <span className={`${base} border-ink-500 bg-ink-900`} />;
}

interface RowProps {
  at: string;
  node: "latest" | "done" | "past" | "opened";
  last?: boolean;
  children: React.ReactNode;
}

function Row({ at, node, last = false, children }: RowProps) {
  return (
    <li className="grid grid-cols-[1.25rem_1fr] gap-x-4 sm:grid-cols-[5.5rem_1.25rem_1fr]">
      <div className="hidden pt-0.5 text-right sm:block">
        <p className="text-sm font-medium text-ink-100">{formatDay(at)}</p>
        <p className="font-mono text-[11px] text-ink-400">{formatTime(at)}</p>
      </div>
      <div className="relative flex justify-center">
        <Node kind={node} />
        {!last && (
          <span className="absolute -bottom-0 top-5 w-px bg-ink-700" />
        )}
      </div>
      <div className={last ? "" : "pb-8"}>
        <p className="mb-1 text-xs text-ink-400 sm:hidden">
          {formatDay(at)}, {formatTime(at)}
        </p>
        {children}
      </div>
    </li>
  );
}

export function ProgressTimeline({ updates, openedAt }: ProgressTimelineProps) {
  // The change each update made, relative to the one before it.
  const entries = updates
    .map((update, index) => ({
      update,
      from: index === 0 ? 0 : updates[index - 1].progress,
    }))
    .reverse();

  return (
    <ol>
      {entries.length === 0 && (
        <li className="mb-6 text-sm text-ink-300">
          No updates yet. Add the first one above to start the timeline.
        </li>
      )}

      {entries.map(({ update, from }, index) => {
        const delta = update.progress - from;
        const done = update.progress === 100;
        return (
          <Row
            key={update.id}
            at={update.created_at}
            node={done ? "done" : index === 0 ? "latest" : "past"}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                className={`font-display text-2xl font-semibold leading-none ${
                  done ? "text-moss-300" : "text-ink-50"
                }`}
              >
                {update.progress}%
              </span>
              {delta !== 0 && (
                <span
                  className={`rounded-sm px-1.5 py-0.5 font-mono text-xs ${
                    delta > 0
                      ? "bg-gold-400/10 text-gold-300"
                      : "bg-rust-400/15 text-rust-300"
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              )}
              {done && (
                <span className="text-sm font-medium text-moss-300">
                  Completed
                </span>
              )}
            </div>
            <JumpBar from={from} to={update.progress} />
            <p className="mt-3 max-w-prose whitespace-pre-wrap text-ink-100">
              {update.note}
            </p>
            {update.author_name && (
              <p className="mt-1 text-xs text-ink-400">
                Added by {update.author_name}
              </p>
            )}
          </Row>
        );
      })}

      <Row at={openedAt} node="opened" last>
        <p className="text-ink-200">Issue opened</p>
        <p className="mt-1 text-xs text-ink-400">Progress starts at 0%.</p>
      </Row>
    </ol>
  );
}
