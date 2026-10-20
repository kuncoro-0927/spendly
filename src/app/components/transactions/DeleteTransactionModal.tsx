"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { PiWarningLight } from "react-icons/pi";
import { useLockBodyScroll } from "@/app/hooks/shared/useLockBodyScroll";
import { formatShortRupiah, resolveIcon } from "@/lib/transactions/display";
import type {
  TransactionCategory,
  TransactionItem,
} from "@/app/hooks/transactions/useTransactions";

type Props = {
  transaction: TransactionItem;
  category?: TransactionCategory;
  onClose: () => void;
  // Mengembalikan pesan error, atau null kalau berhasil
  onConfirm: () => Promise<string | null>;
};

const formatLongDate = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export default function DeleteTransactionModal({
  transaction,
  category,
  onClose,
  onConfirm,
}: Props) {
  useLockBodyScroll();

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Tutup dengan Escape, kecuali sedang menghapus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [deleting, onClose]);

  const handleConfirm = async () => {
    if (deleting) return;

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
      aria-labelledby="delete-transaction-title"
      aria-describedby="delete-transaction-desc"
      onMouseDown={(e) => {
        // Klik di area gelap menutup modal
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div className="my-auto w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
          <PiWarningLight className="text-2xl text-red-500" />
        </div>

        <h2
          id="delete-transaction-title"
          className="mt-4 text-center text-lg font-semibold text-gray-900"
        >
          Hapus transaksi?
        </h2>

        <p
          id="delete-transaction-desc"
          className="mt-1 text-center text-sm text-gray-500"
        >
          Transaksi ini akan dihapus permanen dan tidak bisa dikembalikan.
        </p>

        {/* Ringkasan transaksi yang akan dihapus */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-black/10  p-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-orange/15 to-yellow/15">
              <Icon
                icon={resolveIcon(category?.icon)}
                width={20}
                height={20}
                className="icon-gradient-fill"
              />
            </span>

            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">
                {transaction.description}
              </span>
              <span className="truncate text-xs text-[#6c6c6c]">
                {category?.name ?? "Lainnya"}
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="shrink-0 whitespace-nowrap text-right text-sm font-semibold">
              <span className="text-[10px] font-normal text-[#6c6c6c]">
                IDR{" "}
              </span>
              {formatShortRupiah(transaction.amount)}
            </span>
            <span className="truncate text-xs text-[#6c6c6c]">
              {formatLongDate(transaction.transaction_date)}
            </span>
          </div>
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
            disabled={deleting}
            className="flex-1 cursor-pointer rounded-xl bg-red-500 py-3 text-sm font-medium text-white duration-300 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-md disabled:opacity-50"
          >
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
