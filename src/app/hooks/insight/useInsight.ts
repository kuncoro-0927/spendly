"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
type Transaction = {
  category_id: string;
  amount: number | string;
};

type PreviousTransaction = {
  amount: number | string;
};

type Category = {
  id: string;
  name: string;
};

type BudgetCategory = {
  category_id: string;
  amount: number | string;
};

export type CategoryInsight = {
  categoryId: string;
  categoryName: string;
  spent: number;
  budget: number;
  percentage: number;
  projected: number;
};

export type InsightData = {
  currentSpent: number;
  previousSpent: number;
  spendingChange: number | null;
  topCategory: CategoryInsight | null;
  riskyCategories: CategoryInsight[];
  projectedSpent: number | null;
};

export type AiInsight = {
  title: string;
  analysis: string;
};

export function useInsight(month: number, year: number) {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<AiInsight[]>([]);
  const loadInsight = useCallback(async () => {
    try {
      setError(null);

      // createClient() asynchronous, jadi harus di-await

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;
      if (!authData.user) throw new Error("User belum login.");

      const userId = authData.user.id;

      const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      const previousStart = new Date(year, month - 2, 1);

      const [currentResult, previousResult, budgetResult, categoriesResult] =
        await Promise.all([
          supabase
            .from("transactions")
            .select("category_id, amount")
            .eq("user_id", userId)
            .gte("transaction_date", formatDate(startDate))
            .lt("transaction_date", formatDate(endDate)),

          supabase
            .from("transactions")
            .select("amount")
            .eq("user_id", userId)
            .gte("transaction_date", formatDate(previousStart))
            .lt("transaction_date", formatDate(startDate)),

          supabase
            .from("budgets")
            .select("id")
            .eq("user_id", userId)
            .eq("month", month)
            .eq("year", year)
            .maybeSingle(),

          supabase
            .from("categories")
            .select("id, name")
            .or(`user_id.eq.${userId},user_id.is.null`),
        ]);

      if (currentResult.error) throw currentResult.error;
      if (previousResult.error) throw previousResult.error;
      if (budgetResult.error) throw budgetResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      const currentTransactions: Transaction[] = currentResult.data ?? [];

      const previousTransactions: PreviousTransaction[] =
        previousResult.data ?? [];

      const categories: Category[] = categoriesResult.data ?? [];

      const currentSpent = currentTransactions.reduce(
        (total: number, transaction: Transaction) =>
          total + Number(transaction.amount),
        0,
      );

      const previousSpent = previousTransactions.reduce(
        (total: number, transaction: PreviousTransaction) =>
          total + Number(transaction.amount),
        0,
      );

      const spendingChange =
        previousSpent > 0
          ? ((currentSpent - previousSpent) / previousSpent) * 100
          : null;

      const spentByCategory = new Map<string, number>();

      currentTransactions.forEach((transaction: Transaction) => {
        const categoryId = transaction.category_id;

        spentByCategory.set(
          categoryId,
          (spentByCategory.get(categoryId) ?? 0) + Number(transaction.amount),
        );
      });

      let budgetCategories: BudgetCategory[] = [];

      if (budgetResult.data) {
        const { data, error: categoryBudgetError } = await supabase
          .from("budget_categories")
          .select("category_id, amount")
          .eq("budget_id", budgetResult.data.id);

        if (categoryBudgetError) throw categoryBudgetError;

        budgetCategories = (data ?? []).map((item: BudgetCategory) => ({
          category_id: item.category_id,
          amount: Number(item.amount),
        }));
      }

      const now = new Date();
      const isCurrentMonth =
        now.getFullYear() === year && now.getMonth() + 1 === month;

      const daysInMonth = new Date(year, month, 0).getDate();
      const daysElapsed = isCurrentMonth
        ? Math.max(1, now.getDate())
        : daysInMonth;

      const categoryInsights: CategoryInsight[] = budgetCategories.map(
        (item: BudgetCategory) => {
          const category = categories.find(
            (category: Category) => category.id === item.category_id,
          );

          const spent = spentByCategory.get(item.category_id) ?? 0;
          const budget = Number(item.amount);

          return {
            categoryId: item.category_id,
            categoryName: category?.name ?? item.category_id,
            spent,
            budget,
            percentage: budget > 0 ? (spent / budget) * 100 : 0,
            projected: isCurrentMonth
              ? (spent / daysElapsed) * daysInMonth
              : spent,
          };
        },
      );

      const topCategory =
        [...categoryInsights]
          .filter((category: CategoryInsight) => category.spent > 0)
          .sort(
            (a: CategoryInsight, b: CategoryInsight) => b.spent - a.spent,
          )[0] ?? null;

      const projectedSpent = isCurrentMonth
        ? (currentSpent / daysElapsed) * daysInMonth
        : null;

      setInsight({
        currentSpent,
        previousSpent,
        spendingChange,
        topCategory,
        riskyCategories: isCurrentMonth
          ? categoryInsights.filter(
              (category: CategoryInsight) =>
                category.budget > 0 && category.projected > category.budget,
            )
          : [],
        projectedSpent,
      });

      const categorySpent = topCategory?.spent ?? 0;

      // Total anggaran seluruh kategori
      const monthlyBudget = budgetCategories.reduce(
        (total, category) => total + Number(category.amount),
        0,
      );

      const requests = [
        fetch("/api/insight/trend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentSpent,
            previousSpent,
            spendingChange: spendingChange ?? 0,
          }),
        }),
        fetch("/api/insight/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topCategory: topCategory?.categoryName ?? "Belum ada pengeluaran",
            categorySpent,
            currentSpent,
          }),
        }),
        fetch("/api/insight/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentSpent,
            projectedSpent: projectedSpent ?? currentSpent,
            monthlyBudget,
          }),
        }),
      ];

      const responses = await Promise.all(requests);

      const results = await Promise.all(
        responses.map(async (response) => {
          const data = await response.json();

          if (!response.ok) {
            console.error("Trend API error:", data);
            throw new Error(data.error ?? "Gagal mengambil insight.");
          }

          return data as AiInsight;
        }),
      );

      setAiInsight(results);
    } catch (err) {
      console.error("Gagal mengambil insight:", err);
      setError("Insight gagal dimuat.");
      setInsight(null);
      setAiInsight([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadInsight();
  }, [loadInsight]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await loadInsight();
  }, [loadInsight]);

  return {
    insight,
    aiInsight,
    loading,
    error,
    refetch,
  };
}
