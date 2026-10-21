import Skeleton from "../ui/Skeleton";
import { useSearchParams } from "next/navigation";
import { useDashboard } from "@/app/hooks/dashboard/useDashboard";
import { getCurrentPeriod } from "@/lib/period/period";
import { usePeriodStartDay } from "@/lib/period/periodProvider";
import { LuArrowDownToLine } from "react-icons/lu";
import { PeriodBars, PeriodText } from "./PeriodComparison";

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

export default function TotalIncome() {
  const searchParams = useSearchParams();

  const startDay = usePeriodStartDay();
  const current = getCurrentPeriod(startDay);

  const month = Number(searchParams.get("month")) || current.month;
  const year = Number(searchParams.get("year")) || current.year;
  const { summary, loading } = useDashboard(month, year);

  return (
    <div className="mt-3 flex flex-col rounded-2xl border border-black/20 bg-white p-3 lg:border-none shadow-sm">
      {loading ? (
        <>
          {/* label */}
          <div className="flex items-center gap-3">
            <Skeleton className="size-8" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* jumlah dan grafik batang */}
          <div className="mt-2 flex items-end justify-between gap-3">
            <Skeleton className="h-7 w-28" />
          </div>

          {/* teks perbandingan */}
          <Skeleton className="mt-3 h-3 w-36" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-green-100/70 p-2">
              <LuArrowDownToLine className="text-base font-medium text-green-600" />
            </span>
            <span className="text-sm text-[#6c6c6c]">Total Income</span>
          </div>

          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xs">IDR</span>

              <span className="text-xl font-semibold">
                {formatShortRupiah(summary.income)}
              </span>
            </div>
          </div>

          <PeriodText
            current={summary.income}
            previous={summary.previousIncome}
            upIsGood
            emptyLabel="Belum ada pemasukan"
            className="mt-3"
          />
        </>
      )}
    </div>
  );
}
