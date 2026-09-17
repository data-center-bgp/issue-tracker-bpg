interface BackLinkProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function BackLink({ onClick, children }: BackLinkProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center text-gold-400 hover:text-gold-300 transition-colors mb-3 font-mono text-sm uppercase tracking-wide"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {children}
    </button>
  );
}
