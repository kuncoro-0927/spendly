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

  return (
    <main className="flex-1 pb-52 lg:pb-6 p-6 bg-white">
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
          onDeleteCategory={budget.handleDeleteCategory}
          loading={budget.loading}
        />

        <BudgetSummary
          income={Number(budget.income || 0)}
          totalBudget={budget.totalBudget}
          remaining={budget.remaining}
          loading={budget.loading}
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
