"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIN_PASSWORD = 8;

type Values = { name: string; email: string; day: number };

export type SettingsErrors = Partial<
  Record<"name" | "email" | "avatar" | "password" | "confirm", string>
>;

export type SettingsMessage = {
  type: "success" | "error";
  text: string;
} | null;

const passwordError = (message: string) =>
  message.toLowerCase().includes("different from the old password")
    ? "Sandi baru harus berbeda dari sandi lama."
    : "Gagal mengubah sandi. Coba masuk ulang lalu ulangi.";

export function useSettings() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [initial, setInitial] = useState<Values>({
    name: "",
    email: "",
    day: 1,
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [day, setDay] = useState(1);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [hasPassword, setHasPassword] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const [errors, setErrors] = useState<SettingsErrors>({});
  const [message, setMessage] = useState<SettingsMessage>(null);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: settings } = await supabase
      .from("user_settings")
      .select("period_start_day")
      .eq("user_id", user.id)
      .maybeSingle();

    const meta = user.user_metadata ?? {};
    const loadedName =
      meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "";
    const loadedDay = settings?.period_start_day ?? 1;

    setUserId(user.id);
    setInitial({ name: loadedName, email: user.email ?? "", day: loadedDay });
    setName(loadedName);
    setEmail(user.email ?? "");
    setDay(loadedDay);
    setAvatarUrl(meta.avatar_url ?? meta.picture ?? null);
    // Akun yang daftar lewat Google tidak punya sandi
    setHasPassword(
      user.identities?.some((identity) => identity.provider === "email") ??
        true,
    );
    setPendingEmail(user.new_email ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeAvatar = (file: File | null) => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);

    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    if (!AVATAR_TYPES.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        avatar: "Format harus JPG, PNG, atau WebP.",
      }));
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setErrors((previous) => ({
        ...previous,
        avatar: "Ukuran maksimal 2 MB.",
      }));
      return;
    }

    setErrors((previous) => ({ ...previous, avatar: undefined }));
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const dirty =
    name.trim() !== initial.name ||
    email.trim() !== initial.email ||
    day !== initial.day ||
    avatarFile !== null ||
    password !== "" ||
    confirm !== "";

  const validate = () => {
    const next: SettingsErrors = {};

    if (!name.trim()) next.name = "Nama wajib diisi.";
    else if (name.trim().length > 50) next.name = "Maksimal 50 karakter.";

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = "Format email tidak valid.";
    }

    if (password || confirm) {
      if (password.length < MIN_PASSWORD) {
        next.password = `Minimal ${MIN_PASSWORD} karakter.`;
      } else if (password !== confirm) {
        next.confirm = "Konfirmasi sandi tidak sama.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (saving || !dirty) return;

    setMessage(null);
    if (!validate()) return;

    setSaving(true);

    const failures: string[] = [];
    const notes: string[] = [];
    let avatarUploaded = false;

    try {
      // 1. Foto profil
      let newAvatarUrl = avatarUrl;

      if (avatarFile) {
        const path = `${userId}/avatar`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, {
            upsert: true,
            contentType: avatarFile.type,
          });

        if (uploadError) {
          failures.push("Foto profil gagal diunggah.");
        } else {
          const { data } = supabase.storage.from("avatars").getPublicUrl(path);
          // Parameter v mencegah browser menampilkan foto lama dari cache
          newAvatarUrl = `${data.publicUrl}?v=${Date.now()}`;
          avatarUploaded = true;
        }
      }

      // 2. Nama dan foto (disimpan di metadata user)
      if (name.trim() !== initial.name || newAvatarUrl !== avatarUrl) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: name.trim(), avatar_url: newAvatarUrl },
        });

        if (error) failures.push("Nama atau foto gagal disimpan.");
      }

      // 3. Email: berubah setelah dikonfirmasi lewat email
      if (email.trim() !== initial.email) {
        const { error } = await supabase.auth.updateUser({
          email: email.trim(),
        });

        if (error) {
          failures.push("Email gagal diubah. Mungkin sudah dipakai akun lain.");
        } else {
          notes.push(
            "Cek email untuk konfirmasi, email baru aktif setelah dikonfirmasi.",
          );
        }
      }

      // 4. Tanggal gajian
      if (day !== initial.day) {
        const { error } = await supabase
          .from("user_settings")
          .upsert(
            { user_id: userId, period_start_day: day },
            { onConflict: "user_id" },
          );

        if (error) failures.push("Tanggal gajian gagal disimpan.");
      }

      // 5. Sandi
      if (password) {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) failures.push(passwordError(error.message));
        else {
          setPassword("");
          setConfirm("");
        }
      }

      if (avatarUploaded) {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview(null);
      }

      await load(); // muat ulang nilai terbaru dari Supabase

      // Sidebar dan halaman lain ikut diperbarui (termasuk tanggal gajian
      // di PeriodProvider, yang nilainya datang dari layout server)
      window.dispatchEvent(new Event("profile-updated"));
      router.refresh();

      setMessage(
        failures.length
          ? { type: "error", text: failures.join(" ") }
          : {
              type: "success",
              text: ["Perubahan tersimpan.", ...notes].join(" "),
            },
      );
    } catch (error) {
      console.error("SAVE SETTINGS:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan saat menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  // Mengembalikan pesan error, atau null kalau berhasil
  const deleteAccount = async (): Promise<string | null> => {
    setDeleting(true);

    try {
      const response = await fetch("/api/account", { method: "DELETE" });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return (data.error as string) || "Gagal menghapus akun.";
      }

      await supabase.auth.signOut({ scope: "local" });
      router.replace("/login");
      router.refresh();
      return null;
    } catch (error) {
      console.error("DELETE ACCOUNT:", error);
      return "Gagal menghubungi server.";
    } finally {
      setDeleting(false);
    }
  };

  return {
    loading,
    saving,
    deleting,
    dirty,
    errors,
    message,

    name,
    setName,
    email,
    setEmail,
    pendingEmail,
    avatarSrc: avatarPreview ?? avatarUrl,
    changeAvatar,

    day,
    setDay,

    hasPassword,
    password,
    setPassword,
    confirm,
    setConfirm,

    save,
    logout,
    deleteAccount,
  };
}
