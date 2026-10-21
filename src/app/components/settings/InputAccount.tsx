"use client";

import { PiSignOutLight } from "react-icons/pi";
import { MdDelete } from "react-icons/md";
import { useState } from "react";
import type { SettingsErrors } from "@/app/hooks/settings/useSettings";

type Props = {
  hasPassword: boolean;
  password: string;
  confirm: string;
  errors: SettingsErrors;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onLogout: () => void;
  // Mengembalikan pesan error, atau null kalau berhasil
  onDeleteAccount: () => Promise<string | null>;
};
export default function InputAccount({
  hasPassword,
  password,
  confirm,
  errors,
  onPasswordChange,
  onConfirmChange,
  onLogout,
  onDeleteAccount,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");

    const message = await onDeleteAccount();

    // Kalau berhasil, hook langsung mengarahkan ke halaman login
    if (message) {
      setDeleteError(message);
      setDeleting(false);
    }
  };
  return (
    <section className="mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="font-medium">Keamanan Akun</span>
          <span className="text-sm text-[#6c6c6c]">
            Lorem ipsum dolor sit amet consectetur.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {hasPassword ? (
            <>
              <div className="w-full">
                <label className="mb-1 block text-sm  text-[#6c6c6c]">
                  Ubah Kata Sandi
                </label>

                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="Kosongkan kalau tidak ingin mengubah"
                  className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-orange"
                />
              </div>

              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}

              <div className="w-full">
                <label className="mb-1 block text-sm  text-[#6c6c6c]">
                  Konfirmasi Kata Sandi
                </label>

                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  placeholder="Konfirmasi Kata Sandi Baru"
                  onChange={(e) => onConfirmChange(e.target.value)}
                  className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-orange"
                />
              </div>

              {errors.confirm && (
                <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-[#6c6c6c]">
              Kamu masuk lewat Google, jadi tidak ada sandi yang bisa diubah di
              sini.
            </p>
          )}

          <div className="w-full">
            <label className="mb-1 block text-sm  text-[#6c6c6c]">Logout</label>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 text-center justify-center rounded-lg px-4 py-2 text-sm bg-red-100 border border-red-300 hover:-translate-y-0.5 hover:shadow-md duration-300 cursor-pointer"
            >
              <PiSignOutLight className="text-red-600" />
              <span className="text-red-600">Logout</span>
            </button>
          </div>

          {!confirming ? (
            <div className="w-full">
              <label className="mb-1 block text-sm  text-[#6c6c6c]">
                Hapus Akun
              </label>
              <button
                onClick={() => setConfirming(true)}
                className="w-full flex items-center gap-2 text-center justify-center rounded-lg px-4 py-2 text-sm text-red-600 border border-red-300 hover:border-red-600 hover:bg-red-600 hover:text-white hover:-translate-y-0.5 hover:shadow-md duration-300 cursor-pointer"
              >
                <MdDelete className="text-lg" />
                <span className="">Hapus Akun Permanen</span>
              </button>
            </div>
          ) : (
            // <button
            //   type="button"
            //   onClick={() => setConfirming(true)}
            //   className="mt-3 cursor-pointer rounded-lg border border-red-300 bg-red-100 px-4 py-2 text-sm text-red-500 duration-300 hover:bg-red-200"
            // >
            //   Hapus akun
            // </button>
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <label className="block text-xs text-gray-700">
                Ketik <b>HAPUS</b> untuk melanjutkan
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-black outline-none focus:border-red-400"
                />
              </label>

              {deleteError && (
                <p className="mt-2 text-xs text-red-500">{deleteError}</p>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setTyped("");
                    setDeleteError("");
                  }}
                  disabled={deleting}
                  className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white py-2 text-sm text-gray-600"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={typed !== "HAPUS" || deleting}
                  className="flex-1 cursor-pointer rounded-lg bg-red-500 py-2 text-sm text-white disabled:opacity-50"
                >
                  {deleting ? "Menghapus..." : "Hapus permanen"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
