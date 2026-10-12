"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type DashboardCategory = {
  id: string;
  name: string;
  icon: string;
  budget: number;
  spent: number;
  hasBudget: boolean;
};

export const useDashboard = (month: number, year: number) => {
  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    income: 0,
    spending: 0,
    remaining: 0,
    savings: 0,
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCategories([]);
        setSummary({
          income: 0,
          spending: 0,
          remaining: 0,
          savings: 0,
        });
        return;
      }

      // Ambil budget sesuai bulan dan tahun yang dipilih
      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .select("id, income")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      if (budgetError) {
        console.error("GET BUDGET:", budgetError.message);
        return;
      }

      // Ambil kategori user
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("id, name, icon")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (categoryError) {
        console.error("GET CATEGORIES:", categoryError.message);
        return;
      }

      if (!categoryData) return;

      // Ambil budget setiap kategori
      let budgetCategories: {
        category_id: string;
        amount: number;
      }[] = [];

      if (budget) {
        const { data, error } = await supabase
          .from("budget_categories")
          .select("category_id, amount")
          .eq("budget_id", budget.id);

        if (error) {
          console.error("GET BUDGET CATEGORIES:", error.message);
          return;
        }

        budgetCategories = data || [];
      }

      // Ambil transaksi sesuai bulan dan tahun yang dipilih
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

      const nextMonth = new Date(year, month, 1);
      const endDate = `${nextMonth.getFullYear()}-${String(
        nextMonth.getMonth() + 1,
      ).padStart(2, "0")}-01`;

      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .select("category_id, amount")
        .eq("user_id", user.id)
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate);

      if (transactionError) {
        console.error("GET TRANSACTIONS:", transactionError.message);
        return;
      }

      const result = categoryData.map((category) => {
        const budgetData = budgetCategories.find(
          (item) => item.category_id === category.id,
        );

        const spent =
          transactionData
            ?.filter((transaction) => transaction.category_id === category.id)
            .reduce(
              (total, transaction) => total + Number(transaction.amount || 0),
              0,
            ) || 0;

        return {
          id: category.id,
          name: category.name,
          icon: category.icon,
          budget: Number(budgetData?.amount || 0),
          spent,
          hasBudget: budgetData !== undefined && budgetData !== null,
        };
      });
      const activeCategoryIds = new Set(
        categoryData.map((category) => category.id),
      );

      const totalBudget = budgetCategories
        .filter((item) => activeCategoryIds.has(item.category_id))
        .reduce((total, item) => total + Number(item.amount || 0), 0);

      const totalSpending = (transactionData || []).reduce(
        (total, item) => total + Number(item.amount || 0),
        0,
      );

      const income = Number(budget?.income || 0);
      const savings = Math.max(0, income - totalBudget);
      const remainingBudget = totalBudget - totalSpending;

      setSummary({
        income,
        spending: totalSpending,
        remaining: remainingBudget,
        savings,
      });

      setCategories(result);
    } catch (error) {
      console.error("GET DASHBOARD:", error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const handleDataUpdated = () => {
      fetchDashboard();
    };

    window.addEventListener("transactions-updated", handleDataUpdated);
    window.addEventListener("budget-updated", handleDataUpdated);

    return () => {
      window.removeEventListener("transactions-updated", handleDataUpdated);
      window.removeEventListener("budget-updated", handleDataUpdated);
    };
  }, [fetchDashboard]);

  return {
    categories,
    loading,
    fetchDashboard,
    summary,
  };
};
