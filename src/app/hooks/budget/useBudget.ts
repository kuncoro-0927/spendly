import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getCurrentPeriod } from "@/lib/period/period";
import { usePeriodStartDay } from "@/lib/period/periodProvider";
export type Category = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  created_at: string;
};

type BudgetCategory = {
  category_id: string;
  amount: number;
};

type Budget = {
  id: string;
  income: number;
};

export const useBudget = (monthParam?: number, yearParam?: number) => {
  const startDay = usePeriodStartDay();
  const current = getCurrentPeriod(startDay);

  const [categories, setCategories] = useState<Category[]>([]);
  const [income, setIncome] = useState("");
  const [budgetValues, setBudgetValues] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const month = monthParam ?? current.month;
  const year = yearParam ?? current.year;

  const totalBudget = Object.values(budgetValues).reduce(
    (total, value) => total + Number(value || 0),
    0,
  );

  const remaining = Number(income || 0) - totalBudget;

  const getBudgetData = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: true,
        });

      if (categoryError) {
        console.error("GET CATEGORIES:", categoryError.message);
        return;
      }

      const userCategories = categoryData || [];

      setCategories(userCategories);

      const { data: budgetData, error: budgetError } = await supabase
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

      // sebelumnya: if (!budgetData) return;
      if (!budgetData) {
        setIncome("");
        setBudgetValues({});
        return;
      }

      const budget = budgetData as Budget;

      setIncome(String(budget.income ?? 0));

      const { data: budgetCategoryData, error: budgetCategoryError } =
        await supabase
          .from("budget_categories")
          .select("category_id, amount")
          .eq("budget_id", budget.id);

      if (budgetCategoryError) {
        console.error("GET BUDGET CATEGORIES:", budgetCategoryError.message);
        return;
      }

      const values: Record<string, string> = {};

      (budgetCategoryData as BudgetCategory[] | null)?.forEach((item) => {
        values[item.category_id] = String(item.amount ?? 0);
      });

      setBudgetValues(values);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getBudgetData();
  }, [month, year]);

  const handleBudgetChange = (categoryId: string, value: string) => {
    setBudgetValues((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Silakan login terlebih dahulu.");
        return;
      }

      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .upsert(
          {
            user_id: user.id,
            month,
            year,
            income: Number(income || 0),
          },
          {
            onConflict: "user_id,month,year",
          },
        )
        .select()
        .single();

      if (budgetError || !budget) {
        console.error("SAVE BUDGET:", budgetError?.message);

        alert("Gagal menyimpan budget.");
        return;
      }

      const rows = categories.map((category) => ({
        budget_id: budget.id,
        category_id: category.id,
        amount: Number(budgetValues[category.id] || 0),
      }));

      if (rows.length > 0) {
        const { error: categoryError } = await supabase
          .from("budget_categories")
          .upsert(rows, {
            onConflict: "budget_id,category_id",
          });

        if (categoryError) {
          console.error("SAVE BUDGET CATEGORIES:", categoryError.message);

          alert("Budget tersimpan, tetapi kategori gagal disimpan.");

          return;
        }
      }

      window.dispatchEvent(new Event("budget-updated"));

      alert("Budget berhasil disimpan!");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();

    if (!name) {
      alert("Nama kategori wajib diisi.");
      return;
    }

    setAddingCategory(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Silakan login terlebih dahulu.");
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name,
          icon: newCategoryIcon,
        })
        .select()
        .single();

      if (error) {
        console.error("ADD CATEGORY:", error.message);

        if (error.code === "23505") {
          alert("Kategori tersebut sudah ada.");
        } else {
          alert("Gagal menambahkan kategori.");
        }

        return;
      }

      if (data) {
        const category = data as Category;

        setCategories((prev) => [...prev, category]);

        setBudgetValues((prev) => ({
          ...prev,
          [category.id]: "",
        }));
      }

      setNewCategoryName("");
      setNewCategoryIcon("");
      setShowAddCategory(false);
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const confirmed = window.confirm(`Hapus kategori "${category.name}"?`);

    if (!confirmed) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    const { data: budget, error: budgetError } = await supabase
      .from("budgets")
      .select("id")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (budgetError) {
      console.error("GET BUDGET:", budgetError.message);
      alert("Gagal mengambil data budget.");
      return;
    }

    // Hapus alokasi budget kategori terlebih dahulu
    if (budget) {
      const { error: budgetCategoryError } = await supabase
        .from("budget_categories")
        .delete()
        .eq("budget_id", budget.id)
        .eq("category_id", category.id);

      if (budgetCategoryError) {
        console.error("DELETE BUDGET CATEGORY:", budgetCategoryError.message);
        alert("Budget kategori gagal dihapus.");
        return;
      }
    }

    // Hapus kategori
    const { error: categoryError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id)
      .eq("user_id", user.id);

    if (categoryError) {
      console.error("DELETE CATEGORY:", categoryError.message);
      alert("Kategori gagal dihapus.");
      return;
    }

    // Perbarui state lokal
    setCategories((prev) => prev.filter((item) => item.id !== category.id));

    setBudgetValues((prev) => {
      const updated = { ...prev };
      delete updated[category.id];
      return updated;
    });

    // Perbarui dashboard dan sidebar
    window.dispatchEvent(new Event("budget-updated"));
  };

  return {
    categories,
    income,
    setIncome,
    budgetValues,

    loading,
    saving,

    showAddCategory,
    setShowAddCategory,

    newCategoryName,
    setNewCategoryName,

    newCategoryIcon,
    setNewCategoryIcon,

    addingCategory,

    totalBudget,
    remaining,

    handleBudgetChange,
    handleSave,
    handleAddCategory,
    handleDeleteCategory,
  };
};
