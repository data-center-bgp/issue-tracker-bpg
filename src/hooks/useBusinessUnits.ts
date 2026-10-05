import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface BusinessUnit {
  id: number;
  business_unit: string;
}

export function useBusinessUnits() {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("business_units")
      .select("id, business_unit")
      .order("business_unit", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setBusinessUnits(data || []);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { businessUnits, loading, error };
}
