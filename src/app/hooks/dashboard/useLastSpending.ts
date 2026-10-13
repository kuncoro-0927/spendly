"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { usePeriodStartDay } from "@/lib/period/periodProvider";
import { getPeriodRange, toDateString } from "@/lib/period/period";

export type Spending = {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  category_name: string;
  category_icon: string;
};

export const useLastSpending = (month: number, year: number) => {
  const startDay = usePeriodStartDay();

  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [loading, setLoading] = useState(true);

  // Penanda permintaan terbaru, supaya respons lama tidak menimpa yang baru
  const requestId = useRef(0);

  const fetchSpendings = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (id !== requestId.current) return;

      if (!user) {
        setSpendings([]);
        return;
      }

      // Rentang periode mengikuti tanggal gajian (end eksklusif)
      const { start, end } = getPeriodRange(month, year, startDay);

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("id, description, amount, transaction_date, category_id")
        .eq("user_id", user.id)
        .gte("transaction_date", toDateString(start))
        .lt("transaction_date", toDateString(end))
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      if (!transactions?.length) {
        if (id === requestId.current) setSpendings([]);
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

      // Permintaan ini sudah usang, jangan timpa state
      if (id !== requestId.current) return;

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
      if (id === requestId.current) setLoading(false);
    }
  }, [month, year, startDay]);

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
