import { NavLink, useParams } from "react-router-dom";
import { useBusinessUnits } from "../hooks/useBusinessUnits";
import { formatBusinessUnitName } from "../lib/format";
import { Spinner } from "./ui/Spinner";
import { BuildingIcon, DashboardIcon } from "./ui/icons";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { businessUnits, loading } = useBusinessUnits();
  const { businessUnitId } = useParams<{ businessUnitId?: string }>();

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
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-ink-900 border-r border-ink-700 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-ink-700">
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

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-4">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold-400/10 text-gold-300"
                    : "text-ink-200 hover:bg-ink-800 hover:text-ink-50"
                }`
              }
            >
              <DashboardIcon className="w-4 h-4 shrink-0" />
              Dashboard
            </NavLink>
          </div>

          <p className="px-6 mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-500">
            Business Units
          </p>

          {loading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <ul className="px-3 space-y-0.5">
              {businessUnits.map((unit) => {
                const isActive = businessUnitId === String(unit.id);
                return (
                  <li key={unit.id}>
                    <NavLink
                      to={`/business-unit/${unit.id}`}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm transition-colors ${
                        isActive
                          ? "bg-gold-400/10 text-gold-300"
                          : "text-ink-300 hover:bg-ink-800 hover:text-ink-50"
                      }`}
                    >
                      <BuildingIcon className="w-4 h-4 shrink-0 text-ink-500" />
                      <span className="truncate">
                        {formatBusinessUnitName(unit.business_unit)}
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
