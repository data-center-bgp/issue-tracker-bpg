interface StatusStampProps {
  completed: boolean;
}

export function StatusStamp({ completed }: StatusStampProps) {
  const label = completed ? "Completed" : "On Progress";
  const colorClasses = completed
    ? "border-moss-400 text-moss-300"
    : "border-rust-400 text-rust-300";

  return (
    <span
      className={`inline-block rotate-[-2deg] rounded-sm border-[3px] border-double px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-widest ${colorClasses}`}
    >
      {label}
    </span>
  );
}
