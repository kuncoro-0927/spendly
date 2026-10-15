import { LuWallet } from "react-icons/lu";

export function BudgetHeader() {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-linear-to-r from-orange/15 to-yellow/15 flex items-center justify-center">
          <LuWallet strokeWidth={1.5} className="icon-gradient text-xl" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Budget</h1>

          <p className="text-sm text-[#6c6c6c]">
            Atur batas pengeluaran kamu setiap bulan.
          </p>
        </div>
      </div>
    </div>
  );
}
