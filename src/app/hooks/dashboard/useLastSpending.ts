"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type Spending = {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  category_name: string;
  category_icon: string;
};

export const useLastSpending = (month: number, year: number) => {
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSpendings = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSpendings([]);
        return;
      }

      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

      const nextMonth = new Date(year, month, 1);
      const endDate = `${nextMonth.getFullYear()}-${String(
        nextMonth.getMonth() + 1,
      ).padStart(2, "0")}-01`;

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("id, description, amount, transaction_date, category_id")
        .eq("user_id", user.id)
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      if (!transactions?.length) {
        setSpendings([]);
        return;
      }

      const categoryIds = [
        ...new Set(transactions.map((item) => item.category_id)),
      ];

      const { data: categories, error: categoryError } = await supabase
        .from("categories")
        .select("id, name, icon")
        .in("id", categoryIds);

      if (categoryError) throw categoryError;

      setSpendings(
        transactions.map((transaction) => {
          const category = categories?.find(
            (item) => item.id === transaction.category_id,
          );

          return {
            id: transaction.id,
            description: transaction.description,
            amount: Number(transaction.amount),
            transaction_date: transaction.transaction_date,
            category_name: category?.name ?? "Lainnya",
            category_icon: category?.icon ?? "house",
          };
        }),
      );
    } catch (error) {
      console.error("GET LAST SPENDING:", error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSpendings();

    const handleUpdate = () => {
      fetchSpendings();
    };

    window.addEventListener("transactions-updated", handleUpdate);

    return () => {
      window.removeEventListener("transactions-updated", handleUpdate);
    };
  }, [fetchSpendings]);

  return { spendings, loading, fetchSpendings };
};
