"use client";

import { PiXLight } from "react-icons/pi";
import ReceiptItemCard from "../shared/ReceiptItemCard";
import { formatRupiah } from "@/lib/receipt/format";
import type { Category } from "@/lib/receipt/receipt-types";
import type { Transaction } from "@/lib/receipt/receipt-types";

type Props = {
  transactions: Transaction[];
  categories: Category[];
  expandedIndex: number | null;
  saving: boolean;
  error: string;
  onToggle: (index: number) => void;
  onChange: (
    index: number,
    field: keyof Transaction,
    value: string | number,
  ) => void;
  onDelete: (index: number) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function ConfirmTransactionModal({
  transactions,
  categories,
  expandedIndex,
  saving,
  error,
  onToggle,
  onChange,
  onDelete,
  onCancel,
  onSave,
}: Props) {
  const total = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 scrollbar-hide">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Konfirmasi transaksi
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Pastikan data transaksi sudah benar · {transactions.length} barang
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-xl text-gray-500"
            aria-label="Tutup modal"
          >
            <PiXLight />
          </button>
        </div>

        <div className="mt-4 max-h-[45vh] space-y-6 overflow-y-auto scrollbar-hide">
          {transactions.map((transaction, index) => (
            <ReceiptItemCard
              key={index}
              index={index}
              transaction={transaction}
              categories={categories}
              date={transaction.transaction_date}
              expanded={expandedIndex === index}
              onToggle={() => onToggle(index)}
              onChange={(field, value) => onChange(index, field, value)}
              onDelete={() => onDelete(index)}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">Total</span>
          <span className="font-semibold text-gray-900">
            {formatRupiah(total)}
          </span>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving || transactions.length === 0}
            className="flex-1 cursor-pointer rounded-xl bg-orange py-3 text-sm font-medium text-white duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan transaksi"}
          </button>
        </div>
      </div>
    </div>
  );
}
