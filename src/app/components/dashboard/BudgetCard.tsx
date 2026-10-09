import {
  PiHouseLight,
  PiHamburgerLight,
  PiCarLight,
  PiSoccerBallLight,
  PiShoppingBagLight,
} from "react-icons/pi";
import { CiMedicalCross } from "react-icons/ci";

const iconMap: Record<string, React.ElementType> = {
  house: PiHouseLight,
  hamburger: PiHamburgerLight,
  car: PiCarLight,
  soccer: PiSoccerBallLight,
  "shopping-bag": PiShoppingBagLight,
  medical: CiMedicalCross,
};

type BudgetCategoryCardProps = {
  name: string;
  icon: string;
  spent: number;
  budget: number;
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
}: BudgetCategoryCardProps) {
  const Icon = iconMap[icon];

  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  return (
    <div className="flex flex-col border border-black/20 rounded-2xl p-4 gap-6">
      <div className="flex items-center gap-3 w-full">
        <span className="bg-orange/10 flex items-center justify-center rounded-lg h-10 w-10 shrink-0">
          {Icon && <Icon className="text-orange" />}
        </span>

        <div className="flex flex-col w-full">
          <span className="font-medium text-sm leading-none">{name}</span>
          <span className="text-sm text-[#6c6c6c]">Lorem ipsum dolor sit.</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-[#6c6c6c]">IDR</span>

          <span className="font-semibold text-2xl bg-linear-to-r from-orange to-yellow bg-clip-text text-transparent">
            {formatShortRupiah(spent)}
          </span>

          <span className="text-sm text-[#6c6c6c]">
            / {formatShortRupiah(budget)}
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-gray overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-orange to-yellow"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-[#6c6c6c]">
          {Math.round(percentage)}% digunakan
        </p>
      </div>
    </div>
  );
}
