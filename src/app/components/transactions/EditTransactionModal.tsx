"use client";

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { PiXLight } from "react-icons/pi";
import { useLockBodyScroll } from "@/app/hooks/shared/useLockBodyScroll";
import { formatRupiahInput } from "@/lib/transactions/display";
import type {
  TransactionCategory,
  TransactionItem,
  TransactionPayload,
} from "@/app/hooks/transactions/useTransactions";

type Props = {
  transaction: TransactionItem;
  categories: TransactionCategory[];
  onClose: () => void;
  // Mengembalikan pesan error, atau null kalau berhasil
  onSave: (payload: TransactionPayload) => Promise<string | null>;
};

export default function EditTransactionModal({
  transaction,
  categories,
  onClose,
  onSave,
}: Props) {
  useLockBodyScroll();

  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(String(Math.round(transaction.amount)));
  const [categoryId, setCategoryId] = useState(transaction.category_id);
  const [date, setDate] = useState(transaction.transaction_date);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (saving) return;

    if (!description.trim() || Number(amount) <= 0 || !categoryId || !date) {
      setError("Lengkapi nama, nominal, kategori, dan tanggal.");
      return;
    }

    setSaving(true);
    setError("");

    const message = await onSave({
      description: description.trim(),
      amount: Number(amount),
      category_id: categoryId,
      transaction_date: date,
    });

    if (message) {
      setError(message);
      setSaving(false);
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto overscroll-contain bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-transaction-title"
    >
      <div className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2
            id="edit-transaction-title"
            className="text-lg font-semibold text-gray-900"
          >
            Edit transaksi
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Tutup"
            className="cursor-pointer text-xl text-gray-500"
          >
            <PiXLight />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-xs text-[#6c6c6c]">
            Nama transaksi
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-black outline-none focus:border-orange"
            />
          </label>

          <label className="block text-xs text-[#6c6c6c]">
            Nominal
            <input
              type="text"
              inputMode="numeric"
              value={formatRupiahInput(amount)}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              className="mt-1.5 w-full rounded-lg border border-gray-200  px-3 py-2 text-sm text-black outline-none focus:border-orange"
            />
          </label>

          <div className="relative">
            <label className="block text-xs text-[#6c6c6c]">Kategori</label>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1.5 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-black outline-none focus:border-orange"
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <IoIosArrowDown className="pointer-events-none absolute right-3 top-[34px] text-gray-500" />
          </div>

          <label className="block text-xs text-[#6c6c6c]">
            Tanggal
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-200  px-3 py-2 text-sm text-black outline-none focus:border-orange"
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 cursor-pointer rounded-xl bg-orange py-3 text-sm font-medium text-white duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
