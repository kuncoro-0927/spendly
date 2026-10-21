import Skeleton from "../ui/Skeleton";
import { PiChartLineUpLight } from "react-icons/pi";
import { useSearchParams } from "next/navigation";
import { useDashboard } from "@/app/hooks/dashboard/useDashboard";
import { usePeriodStartDay } from "@/lib/period/periodProvider";
import { getCurrentPeriod } from "@/lib/period/period";
import { TbMoneybag } from "react-icons/tb";
import { PeriodBars, PeriodText } from "./PeriodComparison";

export default function TotalTabungan() {
  const searchParams = useSearchParams();

  const startDay = usePeriodStartDay();
  const current = getCurrentPeriod(startDay);

  const month = Number(searchParams.get("month")) || current.month;
  const year = Number(searchParams.get("year")) || current.year;
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
  return (
    <div className="mt-3 flex flex-col rounded-2xl border border-black/20 lg:border-none bg-white p-3 shadow-sm">
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
            <span className="rounded-lg bg-blue-100/70 p-2">
              <TbMoneybag className="text-base font-medium text-blue-600" />
            </span>
            <span className="text-sm text-[#6c6c6c]">Tabungan</span>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xs">IDR</span>

            <span className="text-xl font-semibold">
              {formatShortRupiah(summary.savings)}
            </span>
          </div>
          <PeriodText
            current={summary.savings}
            previous={summary.previousSaving}
            upIsGood
            emptyLabel="Belum ada pemasukan"
            className="mt-3"
          />
        </>
      )}
    </div>
  );
}
