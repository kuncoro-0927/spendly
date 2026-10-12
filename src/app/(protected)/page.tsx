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
export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const now = new Date();
  const month = Number(searchParams.get("month")) || now.getMonth() + 1;
  const year = Number(searchParams.get("year")) || now.getFullYear();

  const { categories, loading, summary } = useDashboard(month, year);

  if (loading) {
    return <div>Memuat dashboard...</div>;
  }

  return (
    <div className="bg-white w-auto p-6 rounded-xl">
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

      <div className="mt-8 flex items-center justify-between">
        <div>
          <h1 className="font-medium text-xl">Rabu, 7 Oktober 2026</h1>
          <span className="text-sm text-[#6c6c6c]">
            Lorem ipsum dolor sit, amet consectetur adipisicing.
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

      <div className="grid grid-cols-2 gap-3 mt-8">
        <TotalBalanceCard />
        <InsightCard />
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

        <div className="grid grid-cols-2 gap-3 mt-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <BudgetCard
                key={category.id}
                name={category.name}
                icon={category.icon}
                spent={category.spent}
                budget={category.budget}
                hasBudget={category.hasBudget}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">Belum ada budget.</p>
          )}
        </div>
      </div>
    </div>
  );
}
