import { PiChartLineDownLight, PiChartLineUpLight } from "react-icons/pi";
import Skeleton from "@/app/components/ui/Skeleton";
import { formatRupiahText } from "@/lib/transactions/display";
import ComparisonNote from "./ComparisonNote";
type Props = {
  total: number;
  count: number;
  difference: number | null; // selisih nominal dibanding periode lalu
  loading: boolean;
  hasFilters: boolean;
};

export default function TotalCard({
  total,
  count,
  difference,
  loading,
  hasFilters,
}: Props) {
  const up = difference !== null && difference > 0;

  return (
    <div className="flex min-h-[120px] w-full lg:max-w-[300px] flex-col justify-between rounded-xl bg-linear-to-tr from-orange to-yellow  p-3 duration-300 hover:border-orange hover:shadow-sm">
      <span className="text-sm text-white">Total pengeluaran</span>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-20" />
        </div>
      ) : (
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-white">IDR</span>
              <span className="text-white text-2xl font-semibold">
                {total.toLocaleString("id-ID")}
              </span>
            </div>

            <span className="text-xs text-white">{count} transaksi</span>
          </div>

          <ComparisonNote
            difference={difference}
            hasFilters={hasFilters}
            align="end"
          />
        </div>
      )}
    </div>
  );
}
