import Skeleton from "@/app/components/ui/Skeleton";
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
  // Skeleton memakai ukuran dan susunan yang sama dengan kartu aslinya
  if (loading) {
    return (
      <div
        className="flex min-h-[120px] w-full flex-col justify-between rounded-xl bg-gray-100 p-3 lg:max-w-[300px]"
        role="status"
        aria-label="Memuat total pengeluaran"
      >
        {/* label "Total pengeluaran" */}
        <Skeleton className="h-4 w-28" />

        <div className="flex items-end justify-between gap-6">
          {/* jumlah dan "n transaksi" */}
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-16" />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[120px] w-full flex-col justify-between rounded-xl bg-linear-to-tr from-orange to-yellow p-3 duration-300 hover:border-orange hover:shadow-sm lg:max-w-[300px]">
      <span className="text-sm text-white">Total pengeluaran</span>

      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-white">IDR</span>
            <span className="text-2xl font-semibold text-white">
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
    </div>
  );
}
