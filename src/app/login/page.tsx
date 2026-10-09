"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { LuWallet } from "react-icons/lu";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
            <LuWallet size={24} />
          </div>

          <h1 className="text-2xl font-bold">Welcome to Spendly</h1>

          <p className="text-sm text-gray-500 mt-1">
            Kelola pengeluaranmu dengan lebih mudah.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white border border-black/10 rounded-2xl p-6"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full mt-2 border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full mt-2 border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Spendly — Personal Finance Tracker
        </p>
      </div>
    </main>
  );
}
