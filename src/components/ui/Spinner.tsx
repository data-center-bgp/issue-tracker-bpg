interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export function Spinner({ size = "lg" }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-gold-400 border-t-transparent ${sizeClasses[size]}`}
    />
  );
}

export function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-ledger flex items-center justify-center">
      <Spinner />
    </div>
  );
}
