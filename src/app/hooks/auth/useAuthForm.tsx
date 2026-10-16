"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export type AuthMode = "login" | "register";

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function useAuthForm() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const setValue = (key: keyof typeof initialValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError("");
    setSuccess("");
    // email & password sengaja dibiarkan, biar nggak ngetik ulang
    setValues((prev) => ({ ...prev, name: "", confirmPassword: "" }));
  };

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });

    if (error) {
      setError("Email atau password salah.");
      return;
    }
    router.push("/");
  };

  const register = async () => {
    if (values.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: { data: { full_name: values.name.trim() } },
    });

    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    setSuccess(
      "Registrasi berhasil. Cek email untuk verifikasi akun sebelum login.",
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") await login();
      else await register();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    switchMode,
    values,
    setValue,
    loading,
    error,
    success,
    handleSubmit,
  };
}
