"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";

export type BudgetWarning = {
  key: string;
  periodKey: string;
  category_id: string;
  category_name: string;
  month: number;
  year: number;
  spent: number;
  added: number;
  limit: number;
  over: number;
  suggested: number;
};

export type PeriodBudget = { income: number; totalLimit: number };

type Item = { category_id: string; amount: number; transaction_date: string };

export function useBudgetCheck(transactions: Item[]) {
  const [warnings, setWarnings] = useState<BudgetWarning[]>([]);
  const [periods, setPeriods] = useState<Record<string, PeriodBudget>>({});

  // Efek hanya jalan saat isi yang relevan berubah
  const signature = JSON.stringify(
    transactions.map((t) => [t.category_id, t.amount, t.transaction_date]),
  );

  useEffect(() => {
    const clear = () => {
      setWarnings([]);
      setPeriods({});
    };

    if (transactions.length === 0) {
      clear();
      return;
    }

    const controller = new AbortController();

    // Jeda sebentar supaya tidak menembak server di setiap ketikan
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/transactions/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions }),
          signal: controller.signal,
        });

        if (!response.ok) {
          clear();
          return;
        }

        const data = await response.json();
        setWarnings(data.warnings ?? []);
        setPeriods(data.periods ?? {});
      } catch (error) {
        if ((error as Error).name !== "AbortError") clear();
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return { warnings, periods };
}
