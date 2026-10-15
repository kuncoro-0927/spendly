import { useState } from "react";
import type { AiResult, Transaction } from "@/lib/receipt/receipt-types";
import type { Category } from "@/lib/receipt/receipt-types";

export function useAiChat() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [reply, setReply] = useState("");

  const reset = () => {
    setTransactions([]);
    setCategories([]);
    setExpandedIndex(null);
    setSaveError("");
  };

  const submit = async () => {
    if (!message.trim() || loading) return;

    setLoading(true);
    setError("");
    setReply("");
    reset();

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal memproses pesan.");
        return;
      }

      if (data.status !== "transaction") {
        setReply(
          data.reply ||
            "Aku bisa membantu mencatat dan mengelola pengeluaranmu.",
        );
        return;
      }

      setTransactions(data.transactions ?? []);
      setCategories(data.categories ?? []);
    } catch (err) {
      console.error("AI ERROR:", err);
      setError("Gagal menghubungi AI.");
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = (
    index: number,
    field: keyof Transaction,
    value: string | number,
  ) => {
    setTransactions((previous) =>
      previous.map((transaction, i) =>
        i === index ? { ...transaction, [field]: value } : transaction,
      ),
    );
  };

  const deleteTransaction = (index: number) => {
    setTransactions((previous) => previous.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex((previous) => (previous === index ? null : index));
  };

  const save = async () => {
    if (!transactions.length || saving) return;

    if (
      transactions.some(
        (transaction) =>
          !transaction.description.trim() ||
          transaction.amount <= 0 ||
          !transaction.category_id,
      )
    ) {
      setSaveError("Lengkapi nama, jumlah, dan kategori setiap barang.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: transactions.map((transaction) => ({
            ...transaction,
            description: transaction.description.trim(),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error || "Gagal menyimpan transaksi.");
        return;
      }

      window.dispatchEvent(new Event("transactions-updated"));
      reset();
      setMessage("");
    } catch (err) {
      console.error("SAVE TRANSACTION:", err);
      setSaveError("Gagal menyimpan transaksi.");
    } finally {
      setSaving(false);
    }
  };

  return {
    message,
    setMessage,
    error,
    transactions,
    categories,
    expandedIndex,
    loading,
    saving,
    saveError,
    submit,
    cancel: reset,
    save,
    reply,
    updateTransaction,
    deleteTransaction,
    toggleExpanded,
  };
}
