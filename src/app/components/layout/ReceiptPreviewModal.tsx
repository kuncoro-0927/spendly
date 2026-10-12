"use client";

import { PiXLight } from "react-icons/pi";
import ReceiptItemCard from "../shared/ReceiptItemCard";
import { formatRupiah } from "@/lib/receipt/format";
import { useReceiptForm } from "@/app/hooks/receipt/useReceiptForm";
import { ReceiptResult } from "@/lib/receipt/receipt-types";

type Props = {
  result: ReceiptResult | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function ReceiptPreviewModal({
  result,
  loading,
  error,
  onClose,
  onSaved,
}: Props) {
  const {
    transactions,
    date,
    setDate,
    expandedIndex,
    toggleExpanded,
    updateTransaction,
    deleteTransaction,
    total,
    saving,
    saveError,
    save,
  } = useReceiptForm(result, onSaved);

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/40 p-4 scrollbar-hide">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Periksa Nota Belanja
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {result.store || "Nota belanja"} · {transactions.length} barang
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-500"
            aria-label="Tutup modal"
          >
            <PiXLight />
          </button>
        </div>

        {loading && (
          <p className="mt-4 text-sm text-gray-500">
            AI sedang membaca nota...
          </p>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <label className="mt-5 block text-xs text-[#6c6c6c]">
          Tanggal transaksi
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-orange"
          />
        </label>

        <div className="mt-4 max-h-[45vh] space-y-6 overflow-y-auto scrollbar-hide">
          {transactions.map((transaction, index) => (
            <ReceiptItemCard
              key={index}
              index={index}
              transaction={transaction}
              categories={result.categories}
              expanded={expandedIndex === index}
              onToggle={() => toggleExpanded(index)}
              onChange={(field, value) =>
                updateTransaction(index, field, value)
              }
              onDelete={() => deleteTransaction(index)}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">Total belanja</span>
          <span className="font-semibold text-gray-900">
            {formatRupiah(total)}
          </span>
        </div>

        {saveError && <p className="mt-3 text-sm text-red-500">{saveError}</p>}

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
            onClick={save}
            disabled={saving || loading || transactions.length === 0}
            className="flex-1 cursor-pointer rounded-xl bg-orange py-3 text-sm font-medium text-white duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan transaksi"}
          </button>
        </div>
      </div>
    </div>
  );
}
