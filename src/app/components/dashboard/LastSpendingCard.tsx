"use client";

import { Icon } from "@iconify/react";
import { useLastSpending } from "@/app/hooks/dashboard/useLastSpending";
import Skeleton from "../ui/Skeleton";
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
    return (
      <div className="contents">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex w-full min-w-0 items-start justify-between gap-3 rounded-2xl bg-gray-100 p-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Skeleton className="size-10 shrink-0" />

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>

            <Skeleton className="h-4 w-16 shrink-0" />
          </div>
        ))}
      </div>
    );
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
            className="flex w-full min-w-0 items-start justify-between gap-3 rounded-xl border border-black/20 p-3 duration-300 hover:border-orange/70 hover:shadow-md"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-orange/15 to-yellow/15">
                <Icon
                  icon={iconName}
                  width={22}
                  height={22}
                  className="icon-gradient-fill"
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

            <span className="whitespace-nowrap leading-tight font-semibold">
              <span className="text-[10px] font-normal text-[#6c6c6c] leading-tight">
                IDR{" "}
              </span>
              <span className="text-sm bg-linear-to-r from-orange to-yellow bg-clip-text text-transparent">
                {spending.amount >= 1000000
                  ? `${(spending.amount / 1000000).toLocaleString("id-ID", {
                      maximumFractionDigits: 1,
                    })} Jt`
                  : spending.amount >= 1000
                    ? `${(spending.amount / 1000).toLocaleString("id-ID", {
                        maximumFractionDigits: 1,
                      })}K`
                    : spending.amount.toLocaleString("id-ID")}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
