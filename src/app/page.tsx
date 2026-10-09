"use client";

import {
  PiHamburgerLight,
  PiCarLight,
  PiSoccerBallLight,
  PiShoppingBagLight,
  PiHouseLight,
} from "react-icons/pi";
import { CiMedicalCross } from "react-icons/ci";
import TotalBalanceCard from "./components/dashboard/TotalBalanceCard";
import InsightCard from "./components/dashboard/InsightCard";
import LastSpendingCard from "./components/dashboard/LastSpendingCard";
import BudgetCard from "./components/dashboard/BudgetCard";
import { useDashboard } from "./hooks/dashboard.ts/useDashboard";

export default function Home() {
  const { categories, loading } = useDashboard();

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

      <div className="mt-8">
        <h1 className="font-medium text-xl">Rabu, 7 Oktober 2026</h1>
        <span className="text-sm text-[#6c6c6c]">
          Lorem ipsum dolor sit, amet consectetur adipisicing.
        </span>
      </div>

      {/* insight */}

      <div className="grid grid-cols-2 gap-3 mt-8">
        <TotalBalanceCard />
        <InsightCard />
      </div>

      {/* pembelian terakhir */}

      <div className="mt-8">
        <span className="font-semibold">Lorem, ipsum dolor.</span>
        <div className="mt-2 flex items-center gap-3">
          {/* card */}
          <LastSpendingCard />
          <LastSpendingCard />
          <LastSpendingCard />
        </div>
      </div>

      {/* sisa budget */}
      <div className="mt-8">
        <span className="font-semibold">Lorem, ipsum dolor.</span>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {/* card */}
          {categories.map((category) => (
            <BudgetCard
              key={category.id}
              name={category.name}
              icon={category.icon}
              spent={category.spent}
              budget={category.budget}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
