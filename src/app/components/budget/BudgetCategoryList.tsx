import { LuPlus } from "react-icons/lu";
import { Category } from "@/app/hooks/budget/useBudget";
import { BudgetCategoryItem } from "./BudgetCategoryItem";
import Skeleton from "@/app/components/ui/Skeleton";

type BudgetCategoryListProps = {
  categories: Category[];
  budgetValues: Record<string, string>;
  onBudgetChange: (categoryId: string, value: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (category: Category) => void;
  loading?: boolean;
};

export function BudgetCategoryList({
  categories,
  budgetValues,
  onBudgetChange,
  onAddCategory,
  onDeleteCategory,
  loading = false,
}: BudgetCategoryListProps) {
  return loading ? (
    <section className="animate-pulse rounded-2xl">
      <div className="mb-6 flex items-center justify-between gap-4 ">
        <div className="flex-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>

        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl bg-gray-100 p-4"
          >
            <Skeleton className="h-10 w-10 shrink-0" />

            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>

            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  ) : (
    <section className="mb-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Budget Kategori</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tentukan batas pengeluaran untuk setiap kategori.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddCategory}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-orange via-90%  to-yellow to-100% px-4 py-2.5 text-sm text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-sm"
        >
          <LuPlus size={14} />
          <span className="hidden lg:block">Tambah kategori</span>
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
