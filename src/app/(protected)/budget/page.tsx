"use client";

import { useState } from "react";
import { BudgetHeader } from "../../components/budget/BudgetHeader";
import { IncomeCard } from "../../components/budget/IncomeCard";
import { BudgetCategoryList } from "../../components/budget/BudgetCategoryList";
import { BudgetSummary } from "../../components/budget/BudgetSummary";
import { AddCategoryModal } from "../../components/budget/AddCategoryModal";
import { SaveBudgetButton } from "../../components/budget/SaveBudgetButton";
import DeleteCategoryModal from "../../components/budget/DeleteCategoryModal";
import { useBudget, type Category } from "../../hooks/budget/useBudget";

export default function BudgetPage() {
  const budget = useBudget();

  // Kategori yang sedang akan dihapus. null = modal tertutup.
  const [deleting, setDeleting] = useState<Category | null>(null);

  return (
    <section className="flex-1 pb-52 xl:pb-6 p-6 sm:px-20 md:px-28 xl:px-6 bg-white lg:rounded-2xl shadow-md">
      <BudgetHeader />

      <div className="max-w-5xl space-y-3">
        <IncomeCard
          income={budget.income}
          onChange={budget.setIncome}
          loading={budget.loading}
        />

        <BudgetCategoryList
          categories={budget.categories}
          budgetValues={budget.budgetValues}
          onBudgetChange={budget.handleBudgetChange}
          onAddCategory={() => budget.setShowAddCategory(true)}
          onDeleteCategory={setDeleting}
          loading={budget.loading}
        />

        <BudgetSummary
          income={Number(budget.income || 0)}
          totalBudget={budget.totalBudget}
          remaining={budget.remaining}
          loading={budget.loading}
        />

        {budget.limitError && !budget.loading && (
          <p role="alert" className="text-sm text-red-500">
            {budget.limitError}
          </p>
        )}
        <SaveBudgetButton
          saving={budget.saving}
          onClick={budget.handleSave}
          disabled={budget.loading || !!budget.limitError}
        />
      </div>

      <AddCategoryModal
        open={budget.showAddCategory}
        name={budget.newCategoryName}
        icon={budget.newCategoryIcon}
        adding={budget.addingCategory}
        onClose={() => budget.setShowAddCategory(false)}
        onNameChange={budget.setNewCategoryName}
        onIconChange={budget.setNewCategoryIcon}
        onSubmit={budget.handleAddCategory}
      />

      {deleting && (
        <DeleteCategoryModal
          key={deleting.id}
          category={deleting}
          loadUsage={() => budget.countCategoryTransactions(deleting)}
          onClose={() => setDeleting(null)}
          onConfirm={() => budget.deleteCategory(deleting)}
        />
      )}
    </section>
  );
}
