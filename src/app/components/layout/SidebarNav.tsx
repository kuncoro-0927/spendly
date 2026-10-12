"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CiGrid41, CiSettings } from "react-icons/ci";
import { PiReceiptLight, PiWalletLight, PiChartBarLight } from "react-icons/pi";

const navItems = [
  { href: "/", label: "Dashboard", icon: CiGrid41 },
  { href: "/transaksi", label: "Transaksi", icon: PiReceiptLight },
  { href: "/budget", label: "Budget", icon: PiWalletLight },
  { href: "/analytics", label: "Analytics", icon: PiChartBarLight },
  { href: "/pengaturan", label: "Pengaturan", icon: CiSettings },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky hidden lg:block top-8 h-fit rounded-2xl bg-white p-3">
      <ul className="flex flex-col gap-1">
        <li className="mb-2 text-lg font-semibold">Spendly</li>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-2 rounded-lg p-2 text-sm duration-300 hover:bg-orange/10 hover:text-orange ${
                  isActive ? "bg-orange/10 text-orange" : ""
                }`}
              >
                <Icon className="text-xl" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
