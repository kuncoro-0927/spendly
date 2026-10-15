import { Icon } from "@iconify/react";
import { LuTrash2 } from "react-icons/lu";
import { Category } from "@/app/hooks/budget/useBudget";

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
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-black/10 p-4 sm:flex-nowrap">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-orange/15 to-yellow/15">
        <Icon
          icon={category.icon || "ph:house-light"}
          width={23}
          height={23}
          className="icon-gradient-fill"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{category.name}</p>
        <p className="mt-0.5 text-xs text-[#6c6c6c]">Batas pengeluaran</p>
      </div>

      {/* Mobile: turun ke baris sendiri. Desktop: sejajar di tengah */}
      <div className="relative order-last w-full sm:order-none sm:w-44">
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
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-yellow"
        />
      </div>

      <button
        type="button"
        onClick={() => onDelete(category)}
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
        title="Hapus kategori"
      >
        <LuTrash2 size={17} />
      </button>
    </div>
  );
}
