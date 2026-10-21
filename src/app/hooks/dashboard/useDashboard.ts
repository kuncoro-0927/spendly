"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getPeriodRange, toDateString } from "@/lib/period/period";
import { usePeriodStartDay } from "@/lib/period/periodProvider";
type DashboardCategory = {
  id: string;
  name: string;
  icon: string;
  budget: number;
  spent: number;
  hasBudget: boolean;
  todaySpent: number;
  yesterdaySpent: number;
};

const EMPTY_SUMMARY = {
  income: 0,
  previousIncome: 0,
  spending: 0,
  remaining: 0,
  savings: 0,
  previousSaving: 0,
  totalBudget: 0,
};

export const useDashboard = (month: number, year: number) => {
  const startDay = usePeriodStartDay();

  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  // Penanda permintaan terbaru, supaya respons lama tidak menimpa yang baru
  const requestId = useRef(0);

  const fetchDashboard = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (id !== requestId.current) return;

      if (!user) {
        setCategories([]);
        setSummary(EMPTY_SUMMARY);
        return;
      }

      // Budget periode yang dipilih (month dan year = bulan mulai periode)
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

      // Periode sebelumnya
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;

      // Income periode sebelumnya
      const { data: previousBudget, error: previousBudgetError } =
        await supabase
          .from("budgets")
          .select("id, income")
          .eq("user_id", user.id)
          .eq("month", prevMonth)
          .eq("year", prevYear)
          .maybeSingle();

      if (previousBudgetError) {
        console.error("GET PREVIOUS BUDGET:", previousBudgetError.message);
        return;
      }

      // Total budget kategori periode sebelumnya
      let previousTotalBudget = 0;

      if (previousBudget) {
        const { data: previousBudgetCategories, error } = await supabase
          .from("budget_categories")
          .select("amount")
          .eq("budget_id", previousBudget.id);

        if (error) {
          console.error("GET PREVIOUS BUDGET CATEGORIES:", error.message);
          return;
        }

        previousTotalBudget = (previousBudgetCategories || []).reduce(
          (total, item) => total + Number(item.amount || 0),
          0,
        );
      }

      // Sisa income setelah dialokasikan ke budget
      const previousSaving = Math.max(
        0,
        Number(previousBudget?.income || 0) - previousTotalBudget,
      );

      const { start: previousStart, end: previousEnd } = getPeriodRange(
        prevMonth,
        prevYear,
        startDay,
      );

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

      // Transaksi dalam rentang periode (end eksklusif)
      const { start, end } = getPeriodRange(month, year, startDay);

      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .select("category_id, amount, transaction_date")
        .eq("user_id", user.id)
        .gte("transaction_date", toDateString(start))
        .lt("transaction_date", toDateString(end));

      if (transactionError) {
        console.error("GET TRANSACTIONS:", transactionError.message);
        return;
      }

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const todayDate = toDateString(today);
      const yesterdayDate = toDateString(yesterday);

      const result = categoryData.map((category) => {
        const budgetData = budgetCategories.find(
          (item) => item.category_id === category.id,
        );

        const categoryTransactions = (transactionData || []).filter(
          (transaction) => transaction.category_id === category.id,
        );

        const spent = categoryTransactions.reduce(
          (total, transaction) => total + Number(transaction.amount || 0),
          0,
        );

        // Kalau periode yang dilihat tidak memuat hari ini, hasilnya otomatis 0
        const todaySpent = categoryTransactions
          .filter(
            (transaction) =>
              transaction.transaction_date?.slice(0, 10) === todayDate,
          )
          .reduce(
            (total, transaction) => total + Number(transaction.amount || 0),
            0,
          );

        const yesterdaySpent = categoryTransactions
          .filter(
            (transaction) =>
              transaction.transaction_date?.slice(0, 10) === yesterdayDate,
          )
          .reduce(
            (total, transaction) => total + Number(transaction.amount || 0),
            0,
          );

        return {
          id: category.id,
          name: category.name,
          icon: category.icon,
          budget: Number(budgetData?.amount || 0),
          spent,
          hasBudget: budgetData !== undefined && budgetData !== null,
          todaySpent,
          yesterdaySpent,
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

      // Permintaan ini sudah usang, jangan timpa state
      if (id !== requestId.current) return;

      setSummary({
        income,
        previousIncome: Number(previousBudget?.income || 0),
        spending: totalSpending,
        remaining: remainingBudget,
        savings,
        previousSaving,
        totalBudget,
      });

      setCategories(result);
    } catch (error) {
      console.error("GET DASHBOARD:", error);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [month, year, startDay]);

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
