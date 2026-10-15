"use client";

import { useState } from "react";

import Image from "next/image";
import { PiSignOutLight } from "react-icons/pi";
import { IoIosArrowDown } from "react-icons/io";

import { useUser } from "@/app/hooks/user/useUser";

import TotalIncome from "../dashboard/TotalIncome";
import TotalTabungan from "../dashboard/TotalTabungan";
import TotalSpent from "../dashboard/TotalSpent";
export default function SidebarProfile() {
  const { name, email } = useUser();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();
      console.log("Logout response:", response.status, data);

      if (!response.ok) {
        throw new Error(data.error || "Gagal logout");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="sticky h-fit top-8">
      {/* Profile dropdown */}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsProfileOpen((prev) => !prev)}
          aria-expanded={isProfileOpen}
          className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 cursor-pointer ${
            isProfileOpen
              ? "border-orange bg-orange/5"
              : "border-transparent bg-white hover:border-black/20"
          }`}
        >
          <Image
            src="/images/profile.svg"
            className="rounded-xl"
            width={40}
            height={40}
            alt="Profile"
          />

          <div className="flex min-w-0 flex-1 flex-col">
            {/* <span className="text-sm font-medium">{name}</span>
            <span className="truncate text-xs text-[#6c6c6c]">{email}</span> */}
                 <span className="text-sm font-medium">John Doe</span>
            <span className="truncate text-xs text-[#6c6c6c]">johndoe@gmail.com</span>
          </div>
          <IoIosArrowDown
            className={`shrink-0 text-lg text-gray-500 transition-transform duration-200 ${
              isProfileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Custom dropdown */}

        <div
          className={`absolute left-0 right-0 top-full z-20 mt-2 origin-top rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_12px_35px_rgba(0,0,0,0.10)] transition-all duration-200 ${
            isProfileOpen
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible -translate-y-2 scale-[0.98] opacity-0"
          }`}
        >
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="mt-1 truncate text-sm font-medium text-gray-800">
              {email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition-colors cursor-pointer hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PiSignOutLight className="text-xl" />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </div>

      {/* total income */}
      <TotalIncome />

      {/* tabungan */}
      <TotalTabungan />

      {/* total spent */}
      <TotalSpent />
    </div>
  );
}
