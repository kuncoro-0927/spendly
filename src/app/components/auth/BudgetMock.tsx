import { PiCarLight } from "react-icons/pi";

export default function BudgetLoginMock() {
  return (
    <div
      className=" flex items-center gap-x-4 gap-y-3 rounded-xl border border-black/10 shadow-md bg-white p-3"
      aria-hidden="true"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/15">
        <PiCarLight width={20} height={20} className="text-orange" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-900">
          Transportasi
        </p>
        <p className="mt-0.5 text-[10px] text-[#6c6c6c]">Batas pengeluaran</p>
      </div>

      {/* Kolom nominal, tampil seperti sedang fokus */}
      <div className="relative order-last w-full max-w-[100px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
          IDR
        </span>

        <div className="flex min-h-[35px] w-full items-center rounded-lg border border-orange py-2 pl-9 pr-3 text-xs">
          <span className="text-[#6c6c6c]">300.000</span>

          <span className="ml-px inline-block h-3 w-px bg-gray-900 animate-[caret-blink_1s_step-end_infinite] motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
