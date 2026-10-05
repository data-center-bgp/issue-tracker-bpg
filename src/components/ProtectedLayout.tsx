import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "./AppShell";

export function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  );
}
