import Image from "next/image";
import { PiChartLineUpLight } from "react-icons/pi";
export default function SidebarProfile() {
  return (
    <div className="sticky h-fit top-8">
      <div className="bg-white p-3 rounded-2xl flex items-center gap-2">
        <Image
          src="/images/profile.svg"
          className="rounded-xl"
          width={40}
          height={40}
          alt=""
        />

        <div className="flex flex-col">
          <span className="text-sm font-medium">John Doe</span>
          <span className="text-[#6c6c6c] text-xs">
            khitanhesthik@gmail.com
          </span>
        </div>
      </div>

      {/* total income */}
      <div className="mt-3 bg-white p-6 rounded-2xl flex flex-col">
        <span className="text-sm font-medium">Total Income</span>
        <span className="font-semibold text-2xl">IDR 6.000.000</span>
        <span className="flex items-center gap-1 text-xs mt-3">
          <PiChartLineUpLight className="text-sm text-green-600" />
          <span className="text-green-600">+0,05% </span> bulan ini
        </span>
      </div>

      {/* total spent */}
      <div className="mt-3 bg-white p-6 rounded-2xl flex flex-col">
        <span className="text-sm font-medium">Total Spent</span>
        <span className="font-semibold text-2xl">IDR 2.000.000</span>
        <span className="flex items-center gap-1 text-xs mt-3">
          <PiChartLineUpLight className="text-sm text-green-600" />
          <span className="text-green-600">+0,05% </span> bulan ini
        </span>
      </div>
    </div>
  );
}
