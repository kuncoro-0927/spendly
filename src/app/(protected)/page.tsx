"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  PiHamburgerLight,
  PiCarLight,
  PiSoccerBallLight,
  PiShoppingBagLight,
  PiHouseLight,
} from "react-icons/pi";
import { CiMedicalCross } from "react-icons/ci";
import TotalBalanceCard from "../components/dashboard/TotalBalanceCard";
import InsightCard from "../components/dashboard/InsightCard";
import LastSpendingCard from "../components/dashboard/LastSpendingCard";
import BudgetCard from "../components/dashboard/BudgetCard";
import { useDashboard } from "../hooks/dashboard/useDashboard";
import MonthPicker from "../components/ui/MonthPickerButton";
import Skeleton from "../components/ui/Skeleton";
import TodayDate from "../components/dashboard/TodayDate";

import TotalIncome from "../components/dashboard/TotalIncome";
import TotalTabungan from "../components/dashboard/TotalTabungan";
import TotalSpent from "../components/dashboard/TotalSpent";
export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const now = new Date();
  const month = Number(searchParams.get("month")) || now.getMonth() + 1;
  const year = Number(searchParams.get("year")) || now.getFullYear();

  const { categories, loading, summary } = useDashboard(month, year);

  return (
    <div className="bg-white w-auto p-6 lg:rounded-xl">
      {/* icon kategori */}
      <div className="flex items-stretch gap-3">
        <div className="btn-gradient-border flex items-center justify-center h-12 w-12 rounded-full">
          <PiHouseLight className="text-xl text-black" />
        </div>

        <div className="btn-gradient-border flex items-center justify-center h-12 w-12 rounded-full">
          <PiHamburgerLight className="text-xl text-black" />
        </div>

        <div className="btn-gradient-border flex items-center justify-center h-12 w-12 rounded-full">
          <PiCarLight className="text-xl text-black" />
        </div>

        <div className="btn-gradient-border flex items-center justify-center h-12 w-12 rounded-full">
          <PiSoccerBallLight className="text-xl text-black" />
        </div>

        <div className="btn-gradient-border flex items-center justify-center h-12 w-12 rounded-full">
          <PiShoppingBagLight className="text-xl text-black" />
        </div>

        <div className="btn-gradient-border flex items-center justify-center h-12 w-12 rounded-full">
          <CiMedicalCross className="text-xl text-black" />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 lg:gap-0 lg:flex-row items-start lg:items-center justify-between">
        <div>
          <h1 className="font-medium text-lg lg:text-xl">
            <TodayDate />
          </h1>
          <span className="text-sm text-[#6c6c6c]">
            Pantau pengeluaranmu dan jaga anggaran tetap aman.
          </span>
        </div>
        <MonthPicker
          month={month - 1}
          year={year}
          onChange={(newMonth, newYear) => {
            const params = new URLSearchParams(searchParams.toString());

            params.set("month", String(newMonth + 1));
            params.set("year", String(newYear));

            router.replace(`?${params.toString()}`, { scroll: false });
          }}
        />
      </div>
      {/* insight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-8">
        <TotalBalanceCard />
        <InsightCard />
      </div>

      {/* total income, tabungan, spent */}
      <div className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-hide [&>*]:w-[60%] [&>*]:shrink-0 [&>*]:snap-start">
        <TotalIncome />
        <TotalTabungan />
        <TotalSpent />
      </div>

      {/* pembelian terakhir */}
      <div className="mt-8">
        <span className="font-semibold">Pengeluaran Terakhir</span>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <LastSpendingCard month={month} year={year} />
        </div>
      </div>

      {/* sisa budget */}
      <div className="mt-8">
        <span className="font-semibold">Lorem, ipsum dolor.</span>

        <div className="mt-2 grid grid-cols-2 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-6 rounded-2xl bg-gray-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 shrink-0" />

                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>

                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada budget.</p>
          ) : (
            categories.map((category) => (
              <BudgetCard
                key={category.id}
                name={category.name}
                icon={category.icon}
                spent={category.spent}
                budget={category.budget}
                hasBudget={category.hasBudget}
                todaySpent={category.todaySpent}
                yesterdaySpent={category.yesterdaySpent}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
