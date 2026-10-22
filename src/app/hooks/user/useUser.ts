"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function useUser() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const meta = user.user_metadata ?? {};

    setProfile({
      // Cadangan: bagian email sebelum @, supaya sapaan tidak pernah kosong
      name: meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "",
      email: user.email ?? "",
      avatarUrl: meta.avatar_url ?? meta.picture ?? null,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Event ini sudah dikirim useSettings setelah profil disimpan
  useEffect(() => {
    const handleUpdated = () => {
      load();
    };

    window.addEventListener("profile-updated", handleUpdated);
    return () => window.removeEventListener("profile-updated", handleUpdated);
  }, [load]);

  return {
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    avatarUrl: profile?.avatarUrl ?? null,
    loading,
  };
}
