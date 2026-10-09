"use client";

import { useState } from "react";
import { BsStars } from "react-icons/bs";
import {
  PiPlusCircleLight,
  PiMicrophoneLight,
  PiTrashLight,
} from "react-icons/pi";
import { RxArrowRight } from "react-icons/rx";

type Transaction = {
  description: string;
  amount: number;
  category_id: string;
  transaction_date: string;
};

type AiResult = {
  transactions?: Transaction[];
  error?: string;
};

export default function AiChat() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const handleSubmit = async () => {
    if (!message.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("AI ERROR:", error);

      setResult({
        error: "Gagal menghubungi AI.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setResult(null);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  };

  const transactions = result?.transactions ?? [];

  const handleSave = async () => {
    if (!transactions.length || saving) return;

    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error || "Gagal menyimpan transaksi.");
        return;
      }

      window.dispatchEvent(new Event("transactions-updated"));

      setResult(null);
      setMessage("");

      // Tutup modal
      setResult(null);

      // Bersihkan input
      setMessage("");
    } catch (error) {
      console.error("SAVE TRANSACTION:", error);

      setSaveError("Gagal menyimpan transaksi.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      {/* AI INPUT */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
        <div className="flex flex-col gap-6 border border-black/10 bg-white/40 backdrop-blur-md shadow-md px-5 py-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <BsStars className="text-orange text-xl shrink-0" />

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="Contoh: tadi makan nasi goreng 25rb"
              className="outline-none w-full bg-transparent"
            />
          </div>

          {saveError && (
            <p className="text-sm text-red-500 mt-3">{saveError}</p>
          )}
          <div className="flex items-center justify-between">
            <PiPlusCircleLight className="text-xl text-[#6c6c6c]" />

            <div className="flex items-center gap-2">
              <span className="bg-gray rounded-full h-8 w-8 items-center justify-center flex">
                <PiMicrophoneLight className="text-base" />
              </span>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                className="bg-orange h-8 w-8 flex items-center justify-center rounded-full disabled:opacity-50"
              >
                <RxArrowRight className="text-white text-base" />
              </button>
            </div>
          </div>

          {loading && (
            <p className="text-sm text-[#6c6c6c]">AI sedang memproses...</p>
          )}

          {result?.error && (
            <p className="text-sm text-red-500">{result.error}</p>
          )}
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {transactions.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Konfirmasi transaksi
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Pastikan data transaksi sudah benar.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <PiTrashLight className="text-xl" />
              </button>
            </div>

            {/* TRANSACTIONS */}
            <div className="flex flex-col gap-3 mt-5">
              {transactions.map((transaction, index) => (
                <div
                  key={`${transaction.category_id}-${index}`}
                  className="border border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(transaction.transaction_date)}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatRupiah(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-orange text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
