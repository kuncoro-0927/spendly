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
                className="group relative isolate flex items-center gap-2 rounded-lg p-2 text-sm transition-colors duration-300 hover:bg-orange/10"
              >
                {/* background gradient (active) */}
                <span
                  aria-hidden
                  className={`absolute inset-0 -z-10 rounded-lg bg-linear-to-r from-orange/15 via-80% to-100% to-yellow/15 transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* icon: dua lapis ditumpuk, di-crossfade */}
                {/* icon: dua lapis ditumpuk, di-crossfade */}
                <span className="grid text-xl">
                  <Icon
                    className={`col-start-1 row-start-1 transition-opacity duration-300 ${
                      isActive
                        ? "opacity-0"
                        : "opacity-100 group-hover:opacity-0"
                    }`}
                  />
                  <Icon
                    aria-hidden
                    className={`icon-gradient-fill col-start-1 row-start-1 transition-opacity duration-300 ${
                      isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </span>

                {/* label: teks biasa + teks gradient ditumpuk */}
                <span className="grid">
                  <span
                    className={`col-start-1 row-start-1 transition-opacity duration-300 ${
                      isActive
                        ? "opacity-0"
                        : "opacity-100 group-hover:opacity-0"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    aria-hidden
                    className={`col-start-1 row-start-1 bg-linear-to-r from-orange to-yellow bg-clip-text text-transparent transition-opacity duration-300 ${
                      isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {label}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
