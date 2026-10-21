"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentPeriod } from "@/lib/period/period";
import { usePeriodStartDay } from "@/lib/period/periodProvider";
import {
  useTransactions,
  type TransactionItem,
} from "@/app/hooks/transactions/useTransactions";
import { TransactionsHeader } from "@/app/components/transactions/TransactionsHeader";
import ItemList from "@/app/components/transactions/ItemList";
import EditTransactionModal from "@/app/components/transactions/EditTransactionModal";
import Skeleton from "@/app/components/ui/Skeleton";
import DeleteTransactionModal from "@/app/components/transactions/DeleteTransactionModal";
import CategoryChipsSkeleton from "@/app/components/transactions/CategoryChipsSkeleton";
export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startDay = usePeriodStartDay();
  const current = getCurrentPeriod(startDay);

  const month = Number(searchParams.get("month")) || current.month;
  const year = Number(searchParams.get("year")) || current.year;

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [editing, setEditing] = useState<TransactionItem | null>(null);
  const [deleting, setDeleting] = useState<TransactionItem | null>(null);
  const t = useTransactions(month, year, { search, categoryId });

  const handlePeriodChange = (newMonth: number, newYear: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("month", String(newMonth));
    params.set("year", String(newYear));

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const chips: { id: string | null; name: string }[] = [
    { id: null, name: "Semua" },
    ...t.categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
  ];

  return (
    <div className="w-auto bg-white p-6 pb-52 lg:rounded-xl lg:pb-6">
      <TransactionsHeader
        month={month}
        year={year}
        onPeriodChange={handlePeriodChange}
        search={search}
        onSearchChange={setSearch}
        total={t.total}
        count={t.count}
        difference={t.difference}
        hasFilters={t.hasFilters}
        loading={t.loading}
      />

      {/* Filter kategori */}

      <div className="mb-6">
        {t.loading && t.categories.length === 0 ? (
          <CategoryChipsSkeleton />
        ) : (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {chips.map((chip) => (
              <button
                key={chip.id ?? "all"}
                type="button"
                onClick={() => setCategoryId(chip.id)}
                aria-pressed={categoryId === chip.id}
                className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs duration-200 ${
                  categoryId === chip.id
                    ? "border-transparent bg-linear-to-r from-orange to-yellow text-white"
                    : "border-black/20 text-gray-600 hover:border-orange"
                }`}
              >
                {chip.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {t.loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl bg-gray-100 p-2"
            >
              {/* Icon + Description */}
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

                <div className="flex min-w-0 flex-col gap-2">
                  <Skeleton className="h-3 w-28 max-w-full rounded-md" />
                  <Skeleton className="h-3 w-20 max-w-full rounded-md" />
                </div>
              </div>

              {/* Amount + Actions */}
              <div className="flex shrink-0 items-center gap-3 sm:gap-8">
                <Skeleton className="h-5 w-16 rounded-md sm:w-20" />

                <div className="flex items-center gap-2 sm:gap-3">
                  <Skeleton className="h-7 w-8 rounded-md sm:w-14" />
                  <Skeleton className="h-7 w-8 rounded-md sm:w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : t.error ? (
        <p className="text-sm text-red-500">{t.error}</p>
      ) : t.groups.length === 0 ? (
        <p className="text-sm text-gray-500">
          {t.hasFilters
            ? "Tidak ada transaksi yang cocok."
            : "Belum ada transaksi di periode ini. Catat lewat kolom chat di bawah."}
        </p>
      ) : (
        <ItemList
          groups={t.groups}
          categoryById={t.categoryById}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      )}

      {editing && (
        <EditTransactionModal
          key={editing.id}
          transaction={editing}
          categories={t.categories}
          onClose={() => setEditing(null)}
          onSave={(payload) => t.updateTransaction(editing.id, payload)}
        />
      )}

      {deleting && (
        <DeleteTransactionModal
          key={deleting.id}
          transaction={deleting}
          category={t.categoryById[deleting.category_id]}
          onClose={() => setDeleting(null)}
          onConfirm={() => t.deleteTransaction(deleting.id)}
        />
      )}
    </div>
  );
}
