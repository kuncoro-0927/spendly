import { CgMenuGridO } from "react-icons/cg";
import { CiGrid41 } from "react-icons/ci";
import { PiReceiptLight, PiWalletLight, PiChartBarLight } from "react-icons/pi";
import { CiSettings } from "react-icons/ci";
export default function SidebarNav() {
  return (
    <nav className="sticky top-8 p-3 h-fit bg-white rounded-2xl">
      <ul className="flex flex-col gap-1">
        <li className="font-semibold text-lg mb-2">Spendly</li>
        <li className="flex p-2 rounded-lg items-center gap-2 bg-gray text-sm">
          <CiGrid41 className="text-xl" />
          Dashboard
        </li>

        <li className="flex p-2 rounded-lg items-center gap-2 text-sm">
          <PiReceiptLight className="text-xl" />
          Transaksi
        </li>

        <li className="flex p-2 rounded-lg items-center gap-2 text-sm">
          <PiWalletLight className="text-xl" />
          Budget
        </li>

        <li className="flex p-2 rounded-lg items-center gap-2 text-sm">
          <PiChartBarLight className="text-xl" />
          Analytics
        </li>

        <li className="flex p-2 rounded-lg items-center gap-2 text-sm">
          <CiSettings className="text-xl" />
          Pengaturan
        </li>
      </ul>
    </nav>
  );
}
