import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

interface Profile {
  head_name: string | null;
  business_unit_id: number | null;
  is_admin: boolean;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadedForUserId, setLoadedForUserId] = useState<string | undefined>();

  // Reset the stale profile as soon as the signed-in user changes, without
  // waiting a render cycle for the fetch effect below to kick in.
  if (user?.id !== loadedForUserId && profile !== null) {
    setProfile(null);
  }

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    supabase
      .from("users")
      .select("head_name, business_unit_id, is_admin")
      .eq("auth_user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setProfile(data);
        setLoadedForUserId(user.id);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return profile;
}
