"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/lib/supabase/client"; // sesuaikan path file browser-mu

type Props = { next?: string; onError?: (message: string) => void };

export default function ButtonLoginGoogle({ next = "/", onError }: Props) {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    // kalau sukses, browser langsung pindah ke Google, jadi loading tidak perlu dimatikan
    if (error) {
      setLoading(false);
      onError?.(error.message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      className="flex items-center text-sm gap-3 w-full lg:max-w-[80%] mx-auto mt-4 border border-black/20 rounded-lg justify-center text-center py-2.5 hover:-translate-y-0.5 hover:shadow-md duration-300 cursor-pointer"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
      ) : (
        <FcGoogle className="text-lg" />
      )}
      Lanjutkan dengan Google
    </button>
  );
}
