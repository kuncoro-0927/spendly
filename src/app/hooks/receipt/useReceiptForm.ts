import { useState } from "react";
import { ReceiptResult, ReceiptTransaction } from "@/lib/receipt/receipt-types";
export function useReceiptForm(
  result: ReceiptResult | null,
  onSaved: () => void,
) {
  const [transactions, setTransactions] = useState<ReceiptTransaction[]>(
    result?.transactions ?? [],
  );
  const [date, setDate] = useState(
    result?.transaction_date ?? new Date().toLocaleDateString("en-CA"),
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const total = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  );

  const updateTransaction = (
    index: number,
    field: keyof ReceiptTransaction,
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
    if (saving || !transactions.length) return;

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
            transaction_date: date,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan transaksi.");
      }

      window.dispatchEvent(new Event("transactions-updated"));
      onSaved();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Gagal menyimpan transaksi.",
      );
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}
