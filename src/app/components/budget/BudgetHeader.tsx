import { LuWallet } from "react-icons/lu";

export function BudgetHeader() {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray flex items-center justify-center">
          <LuWallet className="text-[#6c6c6c] text-xl" />
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
