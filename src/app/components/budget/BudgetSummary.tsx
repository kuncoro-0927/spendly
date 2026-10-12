import {
  LuArrowDownToLine,
  LuChartNoAxesColumnIncreasing,
} from "react-icons/lu";
import { TbMoneybag } from "react-icons/tb";

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
};

export function BudgetSummary({
  income,
  totalBudget,
  remaining,
}: BudgetSummaryProps) {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="font-semibold text-gray-900 mb-5">Ringkasan Budget</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl  p-4 border border-black/10">
          <p className="text-base text-green-600 flex items-center gap-2 font-medium">
            <span className="p-2 rounded-lg bg-green-50">
              <LuArrowDownToLine className="text-green-600" />
            </span>
            Total Income
          </p>

          <p className="text-lg font-semibold mt-5">{formatRupiah(income)}</p>
          <span className="text-xs text-[#6c6c6c]">Lorem, ipsum dolor.</span>
        </div>
        <div className="rounded-xl  p-4 border border-black/10">
          <p className="text-base text-red-600 flex items-center gap-2 font-medium">
            <span className="p-2 rounded-lg bg-red-50">
              <LuChartNoAxesColumnIncreasing className="text-red-600" />
            </span>
            Total Budget
          </p>
          <p className="text-lg font-semibold mt-5">
            {formatRupiah(totalBudget)}
          </p>
          <span className="text-xs text-[#6c6c6c]">Lorem, ipsum dolor.</span>
        </div>

        <div className="rounded-xl  p-4 border border-black/10">
          <p className="text-base text-blue-600 flex items-center gap-2 font-medium">
            <span className="p-2 rounded-lg bg-blue-50">
              <TbMoneybag className="text-blue-600" />
            </span>
           Tabungan
          </p>

          <p
            className={`text-lg font-semibold mt-5 ${
              remaining < 0 ? "text-red-500" : "text-gray-900"
            }`}
          >
            {formatRupiah(remaining)}
          </p>

          <span className="text-xs text-[#6c6c6c]">Lorem, ipsum dolor.</span>
        </div>
      </div>

      {remaining < 0 && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          Total budget kamu melebihi pendapatan bulanan.
        </div>
      )}
    </section>
  );
}
