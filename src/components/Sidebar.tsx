import { NavLink, useParams } from "react-router-dom";
import { useBusinessUnits } from "../hooks/useBusinessUnits";
import { formatBusinessUnitName } from "../lib/format";
import { Spinner } from "./ui/Spinner";
import {
  BuildingIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
} from "./ui/icons";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const { businessUnits, loading } = useBusinessUnits();
  const { businessUnitId } = useParams<{ businessUnitId?: string }>();

  // Collapsing only applies on desktop (md+); the mobile drawer always shows labels.
  const hideWhenCollapsed = collapsed ? "md:hidden" : "";
  const centerWhenCollapsed = collapsed ? "md:justify-center md:px-0" : "";

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky inset-y-0 left-0 z-40 w-64 ${
          collapsed ? "md:w-16" : "md:w-64"
        } shrink-0 md:h-screen md:self-start bg-ink-900 border-r border-ink-700 flex flex-col transition-[width,transform] duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Brand (h-16 matches the TopBar so the two bottom borders line up) */}
        <div
          className={`h-16 shrink-0 flex items-center gap-3 px-5 border-b border-ink-700 ${
            collapsed ? "md:justify-center md:px-0" : ""
          }`}
        >
          <div
            className={`flex items-center gap-3 min-w-0 ${hideWhenCollapsed}`}
          >
            <div className="inline-flex items-center justify-center w-9 h-9 bg-gold-400 rounded-sm shrink-0">
              <svg
                className="w-5 h-5 text-ink-950"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <span className="font-display text-lg font-semibold text-ink-50 truncate">
              Issue Tracker
            </span>
          </div>

          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden md:inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-sm border border-ink-700 text-ink-300 hover:text-gold-300 hover:bg-ink-800 transition-colors ${
              collapsed ? "" : "ml-auto"
            }`}
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-4">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              title={collapsed ? "Dashboard" : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${centerWhenCollapsed} ${
                  isActive
                    ? "bg-gold-400/10 text-gold-300"
                    : "text-ink-200 hover:bg-ink-800 hover:text-ink-50"
                }`
              }
            >
              <DashboardIcon className="w-4 h-4 shrink-0" />
              <span className={hideWhenCollapsed}>Dashboard</span>
            </NavLink>
          </div>

          <p
            className={`px-6 mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-500 ${hideWhenCollapsed}`}
          >
            Business Units
          </p>
          {collapsed && (
            <div className="hidden md:block h-px bg-ink-700 mx-3 mb-2" />
          )}

          {loading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <ul className="px-3 space-y-0.5">
              {businessUnits.map((unit) => {
                const isActive = businessUnitId === String(unit.id);
                const name = formatBusinessUnitName(unit.business_unit);
                return (
                  <li key={unit.id}>
                    <NavLink
                      to={`/business-unit/${unit.id}`}
                      onClick={onClose}
                      title={collapsed ? name : undefined}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm transition-colors ${centerWhenCollapsed} ${
                        isActive
                          ? "bg-gold-400/10 text-gold-300"
                          : "text-ink-300 hover:bg-ink-800 hover:text-ink-50"
                      }`}
                    >
                      <BuildingIcon className="w-4 h-4 shrink-0 text-ink-500" />
                      <span className={`truncate ${hideWhenCollapsed}`}>
                        {name}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </aside>
    </>
  );
}
