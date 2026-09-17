interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="bg-rust-900/40 border border-rust-700 text-rust-200 px-4 py-3 rounded-md text-sm">
      <span className="block font-mono text-[11px] uppercase tracking-widest text-rust-400 mb-1">
        Error
      </span>
      {message}
    </div>
  );
}
