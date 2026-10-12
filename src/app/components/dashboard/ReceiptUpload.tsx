"use client";

import { useState, type FormEvent } from "react";

type Category = {
  id: string;
  name: string;
};

type ReceiptTransaction = {
  description: string;
  amount: number;
  category_id: string;
};

type ReceiptResult = {
  store: string | null;
  transaction_date: string | null;
  transactions: ReceiptTransaction[];
  categories: Category[];
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ReceiptUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ReceiptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const total =
    result?.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    ) ?? 0;

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Pilih foto nota terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai/receipt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membaca nota.");
      }

      if (!Array.isArray(data.transactions)) {
        throw new Error(
          "Format hasil AI belum sesuai. Periksa API pembaca nota.",
        );
      }

      setResult({
        store: data.store ?? null,
        transaction_date: data.transaction_date ?? getLocalDate(),
        transactions: data.transactions.map(
          (transaction: ReceiptTransaction) => ({
            description: transaction.description ?? "",
            amount: Number(transaction.amount) || 0,
            category_id: transaction.category_id ?? "",
          }),
        ),
        categories: data.categories ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  function updateTransaction(
    index: number,
    field: keyof ReceiptTransaction,
    value: string | number,
  ) {
    if (!result) return;

    setResult({
      ...result,
      transactions: result.transactions.map((transaction, i) =>
        i === index ? { ...transaction, [field]: value } : transaction,
      ),
    });
  }

  async function handleSave() {
    if (!result || result.transactions.length === 0) {
      setError("Tidak ada transaksi yang bisa disimpan.");
      return;
    }

    const invalidTransaction = result.transactions.some(
      (transaction) =>
        !transaction.description.trim() ||
        !Number.isFinite(transaction.amount) ||
        transaction.amount <= 0 ||
        !transaction.category_id,
    );

    if (invalidTransaction) {
      setError(
        "Pastikan setiap transaksi memiliki deskripsi, nominal, dan kategori.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions: result.transactions.map((transaction) => ({
            description: `${transaction.description} (${result.store || "Nota belanja"})`,
            amount: transaction.amount,
            category_id: transaction.category_id,
            transaction_date: result.transaction_date || getLocalDate(),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan transaksi.");
      }

      window.dispatchEvent(new Event("transactions-updated"));

      setResult(null);
      setFile(null);

      const input = document.getElementById(
        "receipt-file",
      ) as HTMLInputElement | null;

      if (input) input.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5">
      {" "}
      <h2 className="text-lg font-semibold">Upload Nota Belanja</h2>{" "}
      <p className="mt-1 text-sm text-gray-500">
        AI akan membaca nota dan memisahkan pengeluaran berdasarkan
        kategori.{" "}
      </p>
      <form onSubmit={handleAnalyze} className="mt-4 space-y-3">
        <input
          id="receipt-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setResult(null);
            setError("");
          }}
          className="block w-full text-sm"
        />

        <button
          type="submit"
          disabled={!file || loading || saving}
          className="rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Membaca nota..." : "Baca Nota"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {result && (
        <div className="mt-5 space-y-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-sm text-gray-500">Nama toko</p>
            <p className="font-semibold">{result.store || "Tidak terbaca"}</p>
          </div>

          <div>
            <label htmlFor="receipt-date" className="text-sm text-gray-500">
              Tanggal transaksi
            </label>
            <input
              id="receipt-date"
              type="date"
              value={result.transaction_date || getLocalDate()}
              onChange={(event) =>
                setResult({
                  ...result,
                  transaction_date: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border border-black/20 p-2 text-sm"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500">Rincian pengeluaran</p>

            <div className="mt-2 space-y-3">
              {result.transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-xl border border-black/10 p-3"
                >
                  <div>
                    <label
                      htmlFor={`receipt-description-${index}`}
                      className="text-sm text-gray-500"
                    >
                      Deskripsi
                    </label>
                    <input
                      id={`receipt-description-${index}`}
                      type="text"
                      value={transaction.description}
                      onChange={(event) =>
                        updateTransaction(
                          index,
                          "description",
                          event.target.value,
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-black/20 p-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`receipt-amount-${index}`}
                      className="text-sm text-gray-500"
                    >
                      Nominal (Rp)
                    </label>
                    <input
                      id={`receipt-amount-${index}`}
                      type="number"
                      min="1"
                      value={transaction.amount || ""}
                      onChange={(event) =>
                        updateTransaction(
                          index,
                          "amount",
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value),
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-black/20 p-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`receipt-category-${index}`}
                      className="text-sm text-gray-500"
                    >
                      Kategori
                    </label>
                    <select
                      id={`receipt-category-${index}`}
                      value={transaction.category_id}
                      onChange={(event) =>
                        updateTransaction(
                          index,
                          "category_id",
                          event.target.value,
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-black/20 p-2 text-sm"
                    >
                      <option value="">Pilih kategori</option>
                      {result.categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
            <span className="text-sm font-medium">Total semua transaksi</span>
            <span className="text-lg font-semibold">{formatRupiah(total)}</span>
          </div>

          <p className="text-xs text-gray-500">
            Periksa kembali nominal dan kategori sebelum menyimpan. Total di
            atas adalah penjumlahan hasil pembacaan AI.
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              result.transactions.length === 0 ||
              result.transactions.some(
                (transaction) =>
                  !transaction.category_id ||
                  !transaction.description.trim() ||
                  transaction.amount <= 0,
              ) ||
              saving
            }
            className="w-full rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Konfirmasi & Simpan"}
          </button>
        </div>
      )}
    </section>
  );
}
