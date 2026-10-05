import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { Button } from "./ui/Button";
import { LogoutIcon } from "./ui/icons";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, signOut } = useAuth();
  const profile = useProfile();

  const displayName = profile?.head_name || user?.email;

  return (
    <header className="flex items-center justify-between gap-4 px-4 md:px-8 py-4 border-b border-ink-700 bg-ink-900">
      <button
        onClick={onMenuClick}
        className="md:hidden text-ink-200 hover:text-ink-50"
        aria-label="Open navigation"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-ink-50 truncate max-w-[220px]">
            {displayName}
          </p>
          {profile?.is_admin && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-gold-400">
              Admin
            </p>
          )}
        </div>
        <Button
          variant="danger-solid"
          onClick={signOut}
          className="px-4 py-2 flex items-center gap-2"
        >
          <LogoutIcon className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
