import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  todayString,
  type DashboardIssue,
  type DashboardKpi,
} from "../lib/dashboard";

// PostgREST returns at most 1000 rows per request, so aggregate over every page.
const PAGE_SIZE = 1000;

async function fetchAll<T>(table: string, columns: string): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as unknown as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

// Supabase errors are plain objects with a message, not always Error instances.
function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

interface DashboardData {
  issues: DashboardIssue[];
  kpis: DashboardKpi[];
  today: string;
  loading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    issues: [],
    kpis: [],
    today: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [issues, kpis] = await Promise.all([
          fetchAll<DashboardIssue>(
            "issues",
            "id, problem, progress, status, business_unit_id, kpi_id, due_date"
          ),
          fetchAll<DashboardKpi>("kpis", "id, kpi_type"),
        ]);
        if (cancelled) return;
        setData({
          issues,
          kpis,
          today: todayString(),
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        setData((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage(error, "Failed to load dashboard data"),
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
