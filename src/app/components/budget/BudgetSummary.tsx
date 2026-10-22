import {
  LuArrowDownToLine,
  LuChartNoAxesColumnIncreasing,
} from "react-icons/lu";
import { TbMoneybag } from "react-icons/tb";
import Skeleton from "@/app/components/ui/Skeleton";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

type BudgetSummaryProps = {
  income: number;
  totalBudget: number;
  remaining: number;
  loading?: boolean;
};

export function BudgetSummary({
  income,
  totalBudget,
  remaining,
  loading = false,
}: BudgetSummaryProps) {
  return loading ? (
    <section className="animate-pulse rounded-2xlp-6">
      <Skeleton className="mb-5 h-5 w-40" />

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-hide [&>*]:w-[60%] [&>*]:shrink-0 [&>*]:snap-start lg:grid lg:grid-cols-3 lg:gap-4 lg:snap-none lg:overflow-visible lg:[&>*]:w-auto">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-white/60 p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>

            <Skeleton className="mt-5 h-6 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  ) : (
    <section className=" bg-white mb-8">
      <h2 className="mb-5 font-semibold text-gray-900">Ringkasan Budget</h2>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-hide [&>*]:w-[60%] [&>*]:shrink-0 [&>*]:snap-start lg:grid lg:grid-cols-3 lg:gap-4 lg:snap-none lg:overflow-visible lg:[&>*]:w-auto">
        <div className="rounded-xl border border-black/20 p-4">
          <p className="flex items-center gap-2 text-base font-medium text-green-600">
            <span className="rounded-lg bg-green-50 p-2">
              <LuArrowDownToLine />
            </span>
            Total Income
          </p>

          <p className="mt-5 text-lg font-semibold">{formatRupiah(income)}</p>
          <span className="text-xs text-[#6c6c6c]">Lorem, ipsum dolor.</span>
        </div>

        <div className="rounded-xl border border-black/20 p-4">
          <p className="flex items-center gap-2 text-base font-medium text-red-600">
            <span className="rounded-lg bg-red-50 p-2">
              <LuChartNoAxesColumnIncreasing />
            </span>
            Total Budget
          </p>

          <p className="mt-5 text-lg font-semibold">
            {formatRupiah(totalBudget)}
          </p>
          <span className="text-xs text-[#6c6c6c]">Lorem, ipsum dolor.</span>
        </div>

        <div className="rounded-xl border border-black/20 p-4">
          <p className="flex items-center gap-2 text-base font-medium text-blue-600">
            <span className="rounded-lg bg-blue-50 p-2">
              <TbMoneybag />
            </span>
            Tabungan
          </p>

          <p
            className={`mt-5 text-lg font-semibold ${
              remaining < 0 ? "text-red-500" : "text-gray-900"
            }`}
          >
            {formatRupiah(remaining)}
          </p>

          <span className="text-xs text-[#6c6c6c]">Lorem, ipsum dolor.</span>
        </div>
      </div>

      {/* {remaining < 0 && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          Total budget kamu melebihi pendapatan bulanan.
        </div>
      )} */}
    </section>
  );
}
