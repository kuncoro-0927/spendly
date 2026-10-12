"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { PiWallet } from "react-icons/pi";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }

      setSuccess(
        "Registrasi berhasil. Silakan cek email untuk verifikasi akun sebelum login.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registrasi gagal. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f8] px-4 py-10">
      {" "}
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        {" "}
        <div className="mb-8 flex flex-col items-center">
          {" "}
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-orange/10">
            {" "}
            <PiWallet className="text-orange" size={28} />{" "}
          </div>
          ```
          <h1 className="text-2xl font-semibold">Buat akun Spendly</h1>
          <p className="mt-2 text-center text-sm text-[#6c6c6c]">
            Mulai kelola keuanganmu dengan lebih mudah.
          </p>
        </div>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Nama lengkap
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="rounded-lg border border-black/15 px-3 py-2.5 text-sm outline-none transition focus:border-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="rounded-lg border border-black/15 px-3 py-2.5 text-sm outline-none transition focus:border-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="rounded-lg border border-black/15 px-3 py-2.5 text-sm outline-none transition focus:border-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Konfirmasi password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              className="rounded-lg border border-black/15 px-3 py-2.5 text-sm outline-none transition focus:border-orange"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-green-600">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-linear-to-r from-orange to-yellow px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Membuat akun..." : "Daftar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#6c6c6c]">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-orange hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
