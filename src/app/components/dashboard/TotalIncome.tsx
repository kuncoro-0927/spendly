import Skeleton from "../ui/Skeleton";
import { PiChartLineUpLight } from "react-icons/pi";
import { useSearchParams } from "next/navigation";
import { useDashboard } from "@/app/hooks/dashboard/useDashboard";
import { getCurrentPeriod } from "@/lib/period/period";
import { usePeriodStartDay } from "@/lib/period/periodProvider";

export default function TotalIncome() {
  const searchParams = useSearchParams();

  const startDay = usePeriodStartDay();
  const current = getCurrentPeriod(startDay);

  const month = Number(searchParams.get("month")) || current.month;
  const year = Number(searchParams.get("year")) || current.year;
  const { summary, loading } = useDashboard(month, year);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  return (
    <div className="mt-3 flex flex-col rounded-2xl bg-white border border-black/20 lg:border-none p-6">
      {loading ? (
        <>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-40" />
          <Skeleton className="mt-4 h-3 w-28" />
        </>
      ) : (
        <>
          <span className="text-sm font-medium">Total Income</span>
          <span className="text-2xl font-semibold">
            {formatRupiah(summary.income)}
          </span>
          <span className="mt-3 flex items-center gap-1 text-xs">
            <PiChartLineUpLight className="text-sm text-green-600" />
            <span className="text-green-600">+0,05%</span> bulan ini
          </span>
        </>
      )}
    </div>
  );
}
