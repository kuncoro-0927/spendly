import { PiCarLight } from "react-icons/pi";
export default function BudgetCategoryMock() {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white  p-4 duration-300 hover:border-orange hover:shadow-md">
      <div className="flex w-full items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-orange/15 to-yellow/15">
          <PiCarLight width={22} height={22} className="icon-gradient-fill" />
        </span>

        <div className="flex w-full flex-col gap-1">
          <span className="text-xs font-medium leading-none">Transportasi</span>
          <span className="text-xs text-[#6c6c6c]">lorem ipsum</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] text-[#6c6c6c]">IDR</span>

          <span className="bg-linear-to-r from-orange to-yellow bg-clip-text text-xl font-semibold text-transparent">
            150K
          </span>

          <span className="text-xs text-[#6c6c6c]">/ 300K</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6c6c6c]">today</span>
            <span className="bg-linear-to-r from-orange to-yellow bg-clip-text text-xs font-medium text-transparent">
              20K
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6c6c6c]">yesterday</span>
            <span className="bg-linear-to-r from-orange to-yellow bg-clip-text text-xs font-medium text-transparent">
              40K
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray">
            <div
              className="h-full rounded-full bg-linear-to-r from-orange to-yellow"
              style={{ width: `${50}%` }}
            />
          </div>

          <p className="text-xs text-[#6c6c6c]">50%</p>
        </div>
      </div>
    </div>
  );
}
