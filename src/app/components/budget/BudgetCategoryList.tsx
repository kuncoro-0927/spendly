import { LuPlus } from "react-icons/lu";
import { Category } from "@/app/hooks/budget/useBudget";
import { BudgetCategoryItem } from "./BudgetCategoryItem";

type BudgetCategoryListProps = {
  categories: Category[];
  budgetValues: Record<string, string>;
  onBudgetChange: (categoryId: string, value: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (category: Category) => void;
};

export function BudgetCategoryList({
  categories,
  budgetValues,
  onBudgetChange,
  onAddCategory,
  onDeleteCategory,
}: BudgetCategoryListProps) {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-semibold text-gray-900">Budget Kategori</h2>

          <p className="text-sm text-gray-500 mt-1">
            Tentukan batas pengeluaran untuk setiap kategori.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddCategory}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange text-white hover:-translate-y-0.5 hover:shadow-sm duration-300 text-sm transition cursor-pointer"
        >
          <LuPlus size={14} />
          Tambah kategori
        </button>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <BudgetCategoryItem
            key={category.id}
            category={category}
            value={budgetValues[category.id] ?? ""}
            onChange={onBudgetChange}
            onDelete={onDeleteCategory}
          />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-500">Belum ada kategori.</p>
        </div>
      )}
    </section>
  );
}
