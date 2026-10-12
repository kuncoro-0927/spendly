"use client";

import { useSearchParams } from "next/navigation";
import { useDashboard } from "@/app/hooks/dashboard/useDashboard";
import Skeleton from "../ui/Skeleton";
export default function TotalBalanceCard() {
  const searchParams = useSearchParams();

  const now = new Date();
  const month = Number(searchParams.get("month")) || now.getMonth() + 1;
  const year = Number(searchParams.get("year")) || now.getFullYear();

  const { summary, loading } = useDashboard(month, year);

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

  return (
    <div className="flex flex-col justify-between rounded-xl bg-linear-to-tr from-orange to-yellow p-5">
      <span className="text-xl font-medium text-white">Hi, John!</span>

      <div className="mt-auto flex items-end justify-between gap-1">
        <div className="flex flex-col">
          <span className="text-sm text-white">Sisa anggaran bulan ini</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-white">IDR</span>

            <span className="text-white text-3xl font-medium">
              {formatShortRupiah(summary.remaining)}
            </span>

            <span className="text-sm text-white">
              / {formatShortRupiah(summary.totalBudget)}
            </span>
          </div>
        </div>

        <div className="rounded-full bg-white/20 px-2 py-1.5 text-xs text-white backdrop-blur-sm">
          {new Intl.DateTimeFormat("id-ID", {
            month: "short",
            year: "numeric",
          }).format(new Date(year, month - 1, 1))}
        </div>
      </div>
    </div>
  );
}
