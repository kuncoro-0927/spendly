"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDashboard } from "@/app/hooks/dashboard/useDashboard";
import Skeleton from "../ui/Skeleton";
import { useUser } from "@/app/hooks/user/useUser";
import { usePeriodStartDay } from "@/lib/period/periodProvider";
import { formatPeriodRange, getCurrentPeriod } from "@/lib/period/period";

const formatShortRupiah = (value: number = 0) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}Jt`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}K`;
  }

  return value.toLocaleString("id-ID");
};

export default function TotalBalanceCard() {
  const searchParams = useSearchParams();

  const startDay = usePeriodStartDay();
  const current = getCurrentPeriod(startDay);

  const month = Number(searchParams.get("month")) || current.month;
  const year = Number(searchParams.get("year")) || current.year;

  const { name } = useUser();
  const { summary, loading } = useDashboard(month, year);

  if (loading) {
    return (
      <div className="flex min-h-40 flex-col justify-between rounded-xl bg-gray-100 p-5">
        <Skeleton className="h-6 w-28" />

        <div className="mt-8 flex items-end justify-between gap-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-36" />
          </div>

          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>
    );
  }

  const { totalBudget, remaining } = summary;

  // Tiga keadaan kartu
  const state = totalBudget === 0 ? "empty" : remaining < 0 ? "over" : "ok";

  return (
    <div className="flex min-h-52 flex-col justify-between rounded-xl bg-linear-to-tr from-orange to-yellow p-5">
      <span className="text-xl font-medium text-white">
        {name ? `Hi, ${name}!` : "Hi!"}
      </span>

      <div className="mt-auto flex items-end justify-between gap-2">
        {state === "empty" && (
          <div className="flex flex-col items-start gap-3">
            <span className="text-sm text-white">
              Atur budget untuk melihat sisa anggaranmu
            </span>

            <Link
              href={`/budget?month=${month}&year=${year}`}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-orange duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              Atur budget
            </Link>
          </div>
        )}

        {state === "ok" && (
          <div className="flex flex-col">
            <span className="text-sm text-white">
              Sisa anggaran periode ini
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-white">IDR</span>

              <span className="text-3xl font-medium text-white">
                {formatShortRupiah(remaining)}
              </span>

              <span className="text-sm text-white">
                / {formatShortRupiah(totalBudget)}
              </span>
            </div>
          </div>
        )}

        {state === "over" && (
          <div className="flex flex-col">
            <span className="text-sm text-white">Melebihi budget</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-white">IDR</span>

              <span className="text-3xl font-medium text-white">
                {formatShortRupiah(Math.abs(remaining))}
              </span>

              <span className="text-sm text-white">
                dari {formatShortRupiah(totalBudget)}
              </span>
            </div>
          </div>
        )}

        <div className="shrink-0 whitespace-nowrap rounded-full bg-white/20 px-2 py-1.5 text-[10px] text-white backdrop-blur-sm">
          {formatPeriodRange(month, year, startDay)}
        </div>
      </div>
    </div>
  );
}
