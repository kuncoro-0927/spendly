import {
  PiHouseLight,
  PiHamburgerLight,
  PiCarLight,
  PiSoccerBallLight,
  PiShoppingBagLight,
} from "react-icons/pi";
import { CiMedicalCross } from "react-icons/ci";
import { LuTrash2 } from "react-icons/lu";
import { Category } from "@/app/hooks/budget/useBudget";

const iconMap: Record<string, React.ElementType> = {
  house: PiHouseLight,
  hamburger: PiHamburgerLight,
  car: PiCarLight,
  soccer: PiSoccerBallLight,
  "shopping-bag": PiShoppingBagLight,
  medical: CiMedicalCross,
};

type BudgetCategoryItemProps = {
  category: Category;
  value: string;
  onChange: (categoryId: string, value: string) => void;
  onDelete: (category: Category) => void;
};

const formatRupiahInput = (value: string) => {
  const number = value.replace(/\D/g, "");

  if (!number) return "";

  return new Intl.NumberFormat("id-ID").format(Number(number));
};

export function BudgetCategoryItem({
  category,
  value,
  onChange,
  onDelete,
}: BudgetCategoryItemProps) {
  const Icon = iconMap[category.icon] ?? PiHouseLight;

  return (
    <div className="flex items-center gap-4 border border-black/10 rounded-xl p-4">
      <div className="w-11 h-11 shrink-0 rounded-xl bg-orange/15 flex items-center justify-center">
        <Icon className="text-xl text-orange" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{category.name}</p>

        <p className="text-xs text-[#6c6c6c] mt-0.5">Batas pengeluaran</p>
      </div>

      <div className="relative w-44">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          IDR
        </span>

        <input
          type="text"
          inputMode="numeric"
          value={formatRupiahInput(value)}
          onChange={(e) => {
            const newValue = e.target.value.replace(/\D/g, "");
            onChange(category.id, newValue);
          }}
          placeholder="0"
          className="w-full border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:border-yellow"
        />
      </div>

      <button
        type="button"
        onClick={() => onDelete(category)}
        className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
        title="Hapus kategori"
      >
        <LuTrash2 size={17} />
      </button>
    </div>
  );
}
