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

const LEGACY_ICONS: Record<string, string> = {
  house: "ph:house-light",
  hamburger: "ph:hamburger-light",
  car: "ph:car-light",
  soccer: "ph:football-light",
  "shopping-bag": "ph:shopping-bag-light",
  medical: "ph:first-aid-kit-light",
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
  const iconName = icon.includes(":")
    ? icon
    : (LEGACY_ICONS[icon] ?? "ph:house-light");

  // Batas dianggap ada hanya kalau barisnya ada DAN nominalnya lebih dari 0.
  // Kalau user menekan Simpan tanpa mengisi angka, baris bernilai 0 tetap terbentuk.
  const hasLimit = hasBudget && budget > 0;

  const percentage = hasLimit ? Math.min((spent / budget) * 100, 100) : 0;

  const subtitle = !hasLimit
    ? "Belum ada batas"
    : spent > budget
      ? "Melebihi batas"
      : `Sisa IDR ${formatShortRupiah(budget - spent)}`;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-black/20 p-4 duration-300 hover:border-orange hover:shadow-md">
      <div className="flex w-full items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-orange/15 to-yellow/15">
          <Icon
            icon={iconName}
            width={22}
            height={22}
            className="icon-gradient-fill"
          />
        </span>

        <div className="flex w-full flex-col">
          <span className="text-sm font-medium leading-none">{name}</span>
          <span className="text-sm text-[#6c6c6c]">{subtitle}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-[#6c6c6c]">IDR</span>

          <span className="bg-linear-to-r from-orange to-yellow bg-clip-text text-2xl font-semibold text-transparent">
            {formatShortRupiah(spent)}
          </span>

          {hasLimit && (
            <span className="text-sm text-[#6c6c6c]">
              / {formatShortRupiah(budget)}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6c6c6c]">today</span>
            <span className="bg-linear-to-r from-orange to-yellow bg-clip-text text-sm font-medium text-transparent">
              {formatShortRupiah(todaySpent)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6c6c6c]">yesterday</span>
            <span className="bg-linear-to-r from-orange to-yellow bg-clip-text text-sm font-medium text-transparent">
              {formatShortRupiah(yesterdaySpent)}
            </span>
          </div>
        </div>

        {hasLimit && (
          <div className="flex items-center gap-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray">
              <div
                className="h-full rounded-full bg-linear-to-r from-orange to-yellow"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="text-xs text-[#6c6c6c]">{Math.round(percentage)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
