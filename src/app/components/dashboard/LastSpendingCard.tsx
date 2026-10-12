"use client";

import { Icon } from "@iconify/react";
import { useLastSpending } from "@/app/hooks/dashboard/useLastSpending";

type LastSpendingCardProps = {
  month: number;
  year: number;
};

const legacyIconMap: Record<string, string> = {
  house: "ph:house-light",
  hamburger: "ph:hamburger-light",
  car: "ph:car-light",
  soccer: "ph:football-light",
  "shopping-bag": "ph:shopping-bag-light",
  medical: "ph:first-aid-kit-light",
};

export default function LastSpendingCard({
  month,
  year,
}: LastSpendingCardProps) {
  const { spendings, loading: spendingLoading } = useLastSpending(month, year);

  if (spendingLoading) {
    return <p className="text-sm text-gray-500">Memuat transaksi...</p>;
  }

  if (spendings.length === 0) {
    return <p className="text-sm text-gray-500">Belum ada pengeluaran.</p>;
  }

  return (
    <div className="contents">
      {spendings.map((spending) => {
        const iconName =
          legacyIconMap[spending.category_icon] ??
          spending.category_icon ??
          "ph:house-light";

        return (
          <div
            key={spending.id}
            className="flex w-full min-w-0 items-start justify-between gap-3 rounded-2xl border border-black/20 p-4 duration-300 hover:border-orange hover:shadow-md"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/10">
                <Icon
                  icon={iconName}
                  width={22}
                  height={22}
                  className="text-orange"
                />
              </span>

              <div className="flex min-w-0 flex-col items-start gap-1">
                <span className="w-full truncate text-sm font-semibold">
                  {spending.description}
                </span>

                <span className="whitespace-nowrap text-xs text-[#6c6c6c]">
                  {spending.category_name}
                </span>
              </div>
            </div>

            <span className="whitespace-nowrap text-sm font-semibold">
              {new Intl.NumberFormat("id-ID", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(spending.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
