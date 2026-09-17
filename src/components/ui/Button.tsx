import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

const variantClasses = {
  primary:
    "bg-gold-400 text-ink-950 font-semibold hover:bg-gold-300 shadow-lg shadow-gold-400/10 disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "bg-ink-900 text-gold-400 border border-ink-700 hover:bg-ink-800",
  danger:
    "bg-ink-900 text-rust-300 border border-rust-700 hover:bg-rust-900/40 disabled:opacity-50 disabled:cursor-not-allowed",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`px-6 py-3 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-ink-950 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
