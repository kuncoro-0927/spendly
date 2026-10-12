import { Icon } from "@iconify/react";

type BudgetCategoryCardProps = {
  name: string;
  icon: string;
  spent: number;
  budget: number;
  hasBudget: boolean;
  todaySpent: number;
  yesterdaySpent: number;
};

const formatShortRupiah = (value: number = 0) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}Jt`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}K`;
  }

  return value.toLocaleString("id-ID");
};

export default function BudgetCard({
  name,
  icon,
  spent = 0,
  budget = 0,
  hasBudget,
  todaySpent = 0,
  yesterdaySpent = 0,
}: BudgetCategoryCardProps) {
  console.log("BudgetCard dirender:", { name, budget, hasBudget });

  const iconName = icon.includes(":")
    ? icon
    : (
        {
          house: "ph:house-light",
          hamburger: "ph:hamburger-light",
          car: "ph:car-light",
          soccer: "ph:football-light",
          "shopping-bag": "ph:shopping-bag-light",
          medical: "ph:first-aid-kit-light",
        } as Record<string, string>
      )[icon] || "ph:house-light";

  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return hasBudget ? (
    <div className="flex flex-col gap-6 rounded-2xl border border-black/20 p-4 duration-300 hover:border-orange hover:shadow-md">
      <div className="flex w-full items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange/10">
          <Icon
            icon={iconName}
            width={22}
            height={22}
            className="text-orange"
          />
        </span>

        <div className="flex w-full flex-col">
          <span className="text-sm font-medium leading-none">{name}</span>
          <span className="text-sm text-[#6c6c6c]">Lorem ipsum dolor sit.</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-[#6c6c6c]">IDR</span>

          <span className="bg-linear-to-r from-orange to-yellow bg-clip-text text-2xl font-semibold text-transparent">
            {formatShortRupiah(spent)}
          </span>

          <span className="text-sm text-[#6c6c6c]">
            / {formatShortRupiah(budget)}
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#6c6c6c]">today</span>
            <span className="bg-linear-to-r from-orange to-yellow bg-clip-text text-transparent font-medium text-sm">
              {" "}
              {formatShortRupiah(todaySpent)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-[#6c6c6c]">yesterday</span>
            <span className="bg-linear-to-r from-orange to-yellow bg-clip-text text-transparent font-medium text-sm">
              {formatShortRupiah(yesterdaySpent)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray">
            <div
              className="h-full rounded-full bg-linear-to-r from-orange to-yellow"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className=" text-xs text-[#6c6c6c]">{Math.round(percentage)}%</p>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-sm text-gray-500">Belum ada budget.</p>
  );
}
