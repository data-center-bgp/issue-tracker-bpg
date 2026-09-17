import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  accent?: "gold" | "rust" | "moss" | "none";
  className?: string;
}

const accentClasses = {
  gold: "border-l-4 border-l-gold-400",
  rust: "border-l-4 border-l-rust-400",
  moss: "border-l-4 border-l-moss-400",
  none: "",
};

export function Panel({ children, accent = "none", className = "" }: PanelProps) {
  return (
    <div
      className={`bg-ink-900 border border-ink-700 rounded-md ${accentClasses[accent]} ${className}`}
    >
      {children}
    </div>
  );
}
