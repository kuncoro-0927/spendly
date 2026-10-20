"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { usePeriodStartDay } from "@/lib/period/periodProvider";
import { getPeriodRange, toDateString } from "@/lib/period/period";

export type TransactionItem = {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  category_id: string;
  input_source: string;
};

export type TransactionCategory = {
  id: string;
  name: string;
  icon: string;
};

export type TransactionGroup = {
  date: string;
  label: string;
  total: number;
  items: TransactionItem[];
};

export type TransactionPayload = {
  description: string;
  amount: number;
  category_id: string;
  transaction_date: string;
};

type Filters = {
  search: string;
  categoryId: string | null;
};

type PreviousItem = {
  amount: number;
  category_id: string;
  description: string;
};

const dateLabel = (date: string) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date === toDateString(today)) return "Hari ini";
  if (date === toDateString(yesterday)) return "Kemarin";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
};

export function useTransactions(month: number, year: number, filters: Filters) {
  const startDay = usePeriodStartDay();

  const [items, setItems] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [previousItems, setPreviousItems] = useState<PreviousItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Penanda permintaan terbaru, supaya respons lama tidak menimpa yang baru
  const requestId = useRef(0);

  const fetchTransactions = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (id !== requestId.current) return;

      if (!user) {
        setItems([]);
        setCategories([]);
        setPreviousItems([]);
        return;
      }

      const { start, end, previousStart } = getPeriodRange(
        month,
        year,
        startDay,
      );

      const [current, previous, categoryResult] = await Promise.all([
        supabase
          .from("transactions")
          .select(
            "id, description, amount, transaction_date, category_id, input_source",
          )
          .eq("user_id", user.id)
          .gte("transaction_date", toDateString(start))
          .lt("transaction_date", toDateString(end))
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false }),

        supabase
          .from("transactions")
          .select("amount, category_id, description")
          .eq("user_id", user.id)
          .gte("transaction_date", toDateString(previousStart))
          .lt("transaction_date", toDateString(start)),
        supabase
          .from("categories")
          .select("id, name, icon")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

      if (current.error) throw current.error;
      if (previous.error) throw previous.error;
      if (categoryResult.error) throw categoryResult.error;

      if (id !== requestId.current) return;

      setItems(
        (current.data ?? []).map((row) => ({
          ...row,
          amount: Number(row.amount),
        })),
      );
      setCategories(categoryResult.data ?? []);

      setPreviousItems(
        (previous.data ?? []).map((row) => ({
          ...row,
          amount: Number(row.amount),
        })),
      );
    } catch (err) {
      if (id !== requestId.current) return;

      console.error("GET TRANSACTIONS:", err);
      setError("Gagal memuat transaksi.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [month, year, startDay]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Ikut diperbarui saat transaksi disimpan dari chat, nota, atau halaman ini
  useEffect(() => {
    const handleUpdated = () => {
      fetchTransactions();
    };

    window.addEventListener("transactions-updated", handleUpdated);

    return () => {
      window.removeEventListener("transactions-updated", handleUpdated);
    };
  }, [fetchTransactions]);

  const hasFilters =
    filters.search.trim() !== "" || filters.categoryId !== null;

  const filtered = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return items.filter(
      (item) =>
        (!filters.categoryId || item.category_id === filters.categoryId) &&
        (!keyword || item.description.toLowerCase().includes(keyword)),
    );
  }, [items, filters.search, filters.categoryId]);

  const groups = useMemo(() => {
    const map = new Map<string, TransactionGroup>();

    // items sudah terurut dari tanggal terbaru, jadi urutan grup ikut benar
    for (const item of filtered) {
      const group = map.get(item.transaction_date) ?? {
        date: item.transaction_date,
        label: dateLabel(item.transaction_date),
        total: 0,
        items: [],
      };

      group.items.push(item);
      group.total += item.amount;
      map.set(item.transaction_date, group);
    }

    return [...map.values()];
  }, [filtered]);

  const categoryById = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category.id, category]),
      ) as Record<string, TransactionCategory>,
    [categories],
  );

  const total = filtered.reduce((sum, item) => sum + item.amount, 0);

  const previousFilteredTotal = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return previousItems
      .filter(
        (item) =>
          (!filters.categoryId || item.category_id === filters.categoryId) &&
          (!keyword || item.description.toLowerCase().includes(keyword)),
      )
      .reduce((sum, item) => sum + item.amount, 0);
  }, [previousItems, filters.search, filters.categoryId]);

  const difference =
    previousFilteredTotal === 0 ? null : total - previousFilteredTotal;

  // Mengembalikan pesan error, atau null kalau berhasil
  const send = async (url: string, init: RequestInit) => {
    try {
      const response = await fetch(url, init);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) return (data.error as string) || "Terjadi kesalahan.";

      window.dispatchEvent(new Event("transactions-updated"));
      return null;
    } catch (err) {
      console.error("TRANSACTION REQUEST:", err);
      return "Gagal menghubungi server.";
    }
  };

  const deleteTransaction = (id: string) =>
    send(`/api/transactions/${id}`, { method: "DELETE" });

  const updateTransaction = (id: string, payload: TransactionPayload) =>
    send(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  return {
    groups,
    categories,
    categoryById,
    total,
    count: filtered.length,
    difference,
    hasFilters,
    loading,
    error,
    deleteTransaction,
    updateTransaction,
  };
}
