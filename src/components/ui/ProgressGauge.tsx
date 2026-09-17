interface ProgressGaugeProps {
  progress: number;
}

export function ProgressGauge({ progress }: ProgressGaugeProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const fillColor = clamped === 100 ? "var(--color-moss-400)" : "var(--color-gold-400)";

  return (
    <div className="relative h-3 w-full overflow-hidden rounded-sm border border-ink-700 bg-ink-800">
      <div
        className="h-full transition-all duration-300"
        style={{ width: `${clamped}%`, backgroundColor: fillColor }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, transparent 0, transparent calc(10% - 1px), rgba(11,18,32,0.55) calc(10% - 1px), rgba(11,18,32,0.55) 10%)",
        }}
      />
    </div>
  );
}
