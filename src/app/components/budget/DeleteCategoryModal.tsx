"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { PiTrashLight } from "react-icons/pi";
import Skeleton from "@/app/components/ui/Skeleton";
import { useLockBodyScroll } from "@/app/hooks/shared/useLockBodyScroll";
import { resolveIcon } from "@/lib/transactions/display";
import type { Category } from "@/app/hooks/budget/useBudget";

type Props = {
  category: Category;
  // Jumlah transaksi di kategori ini, null kalau gagal diperiksa
  loadUsage: () => Promise<number | null>;
  onClose: () => void;
  // Mengembalikan pesan error, atau null kalau berhasil
  onConfirm: () => Promise<string | null>;
};

export default function DeleteCategoryModal({
  category,
  loadUsage,
  onClose,
  onConfirm,
}: Props) {
  useLockBodyScroll();

  const [checking, setChecking] = useState(true);
  const [count, setCount] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Periksa jumlah transaksi saat modal dibuka
  useEffect(() => {
    let cancelled = false;

    loadUsage().then((result) => {
      if (cancelled) return;
      setCount(result);
      setChecking(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tutup dengan Escape, kecuali sedang menghapus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [deleting, onClose]);

  // Ada transaksi (atau jumlahnya tidak diketahui): butuh persetujuan
  const needsAgreement = !checking && (count === null || count > 0);

  const canConfirm = !checking && !deleting && (!needsAgreement || agreed);

  const handleConfirm = async () => {
    if (!canConfirm) return;

    setDeleting(true);
    setError("");

    const message = await onConfirm();

    if (message) {
      setError(message);
      setDeleting(false);
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto overscroll-contain bg-black/40 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-category-title"
      aria-describedby="delete-category-desc"
      onMouseDown={(e) => {
        // Klik di area gelap menutup modal
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div className="my-auto w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
          <PiTrashLight className="text-2xl text-red-500" />
        </div>

        <h2
          id="delete-category-title"
          className="mt-4 text-center text-lg font-semibold text-gray-900"
        >
          Hapus kategori?
        </h2>

        <p
          id="delete-category-desc"
          className="mt-1 text-center text-sm text-gray-500"
        >
          Kategori dan batas budgetnya dihapus permanen dan tidak bisa
          dikembalikan.
        </p>

        {/* Kategori yang akan dihapus */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-black/20 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-orange/15 to-yellow/15">
            <Icon
              icon={resolveIcon(category.icon)}
              width={20}
              height={20}
              className="icon-gradient-fill"
            />
          </span>

          <div className="flex flex-col items-start">
            <span className="text-xs text-[#6c6c6c]">Kategori</span>
            <span className="truncate text-sm font-medium">
              {category.name}
            </span>
          </div>
        </div>

        {/* Dampak ke transaksi */}
        <div className="mt-3" aria-live="polite">
          {checking ? (
            <Skeleton className="h-4 w-56" />
          ) : count === 0 ? (
            <p className="text-xs text-[#6c6c6c]">
              Belum ada transaksi di kategori ini, jadi tidak ada riwayat yang
              hilang.
            </p>
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-600">
                {count === null
                  ? "Jumlah transaksi tidak bisa diperiksa."
                  : `${count.toLocaleString("id-ID")} transaksi di kategori ini ikut terhapus.`}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {count === null
                  ? "Transaksi di kategori ini kemungkinan ikut terhapus. "
                  : "Riwayatnya hilang dari semua periode. "}
                Mau menyimpannya? Pindahkan transaksinya ke kategori lain dulu
                lewat halaman Transaksi.
              </p>

              <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className=" size-4 shrink-0 accent-red-500"
                />
                Saya mengerti, hapus kategori beserta transaksinya.
              </label>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 cursor-pointer rounded-xl bg-red-500 py-3 text-sm font-medium text-white duration-300 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
