import Skeleton from "../ui/Skeleton";
import { PiChartLineUpLight } from "react-icons/pi";
import { useSearchParams } from "next/navigation";
import { useDashboard } from "@/app/hooks/dashboard/useDashboard";
import { usePeriodStartDay } from "@/lib/period/periodProvider";
import { getCurrentPeriod } from "@/lib/period/period";
import { TbMoneybag } from "react-icons/tb";
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
    <div className="mt-3 flex flex-col rounded-2xl border border-black/20 lg:border-none bg-white p-3">
      {loading ? (
        <>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-3 h-8 w-40" />
          <Skeleton className="mt-4 h-3 w-28" />
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
          <span className="mt-3 flex items-center gap-1 text-xs text-[#6c6c6c]">
            <PiChartLineUpLight className="text-sm text-green-600" />
            <span className="text-green-600">+0,05%</span> vs periode lalu
          </span>
        </>
      )}
    </div>
  );
}
