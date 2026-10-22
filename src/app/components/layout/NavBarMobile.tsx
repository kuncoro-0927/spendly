"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiListLight, PiXLight } from "react-icons/pi";
import { CiGrid41, CiSettings } from "react-icons/ci";
import { PiReceiptLight, PiWalletLight, PiChartBarLight } from "react-icons/pi";

export default function NavBarMobile() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);

    onScroll(); // cek sekali di awal, kalau halaman di-reload dalam posisi sudah scroll
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navItems = [
    { href: "/", label: "Dashboard", icon: CiGrid41 },
    { href: "/transactions", label: "Transaksi", icon: PiReceiptLight },
    { href: "/budget", label: "Budget", icon: PiWalletLight },
    { href: "/settings", label: "Pengaturan", icon: CiSettings },
  ];
  return (
    <header
      ref={ref}
      className={`sticky top-0 z-99 border-b px-6 transition-all bg-white duration-300 lg:hidden ${
        scrolled
          ? "border-black/10 bg-white/40 shadow-sm backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="flex h-16 items-center justify-between">
        <Link href="/dashboard" className="text-lg font-semibold">
          Gemi
        </Link>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="cursor-pointer text-2xl"
        >
          {open ? <PiXLight /> : <PiListLight />}
        </button>
      </div>

      {/* Dropdown melayang */}
      <nav
        id="mobile-menu"
        className={`absolute right-4 top-full mt-2 w-56 origin-top-right rounded-2xl border border-black/10 bg-white p-2 shadow-xl transition-all duration-200 ${
          open
            ? "visible scale-100 opacity-100"
            : "invisible scale-95 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl p-3 text-sm duration-300 ${
                    isActive
                      ? "bg-orange/10 font-medium text-orange"
                      : "hover:bg-gray"
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
    </header>
  );
}
