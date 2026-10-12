"use client";

import { BudgetHeader } from "../../components/budget/BudgetHeader";
import { IncomeCard } from "../../components/budget/IncomeCard";
import { BudgetCategoryList } from "../../components/budget/BudgetCategoryList";
import { BudgetSummary } from "../../components/budget/BudgetSummary";
import { AddCategoryModal } from "../../components/budget/AddCategoryModal";
import { SaveBudgetButton } from "../../components/budget/SaveBudgetButton";
import { useBudget } from "../../hooks/budget/useBudget";

export default function BudgetPage() {
  const budget = useBudget();

  if (budget.loading) {
    return (
      <main className="flex-1 p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-sm text-gray-500">Memuat budget...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <BudgetHeader />

      <div className="max-w-5xl space-y-3">
        <IncomeCard income={budget.income} onChange={budget.setIncome} />

        <BudgetCategoryList
          categories={budget.categories}
          budgetValues={budget.budgetValues}
          onBudgetChange={budget.handleBudgetChange}
          onAddCategory={() => budget.setShowAddCategory(true)}
          onDeleteCategory={budget.handleDeleteCategory}
        />

        <BudgetSummary
          income={Number(budget.income || 0)}
          totalBudget={budget.totalBudget}
          remaining={budget.remaining}
        />

        <SaveBudgetButton saving={budget.saving} onClick={budget.handleSave} />
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
    </main>
  );
}
