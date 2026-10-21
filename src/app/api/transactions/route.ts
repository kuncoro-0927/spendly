import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPeriod } from "@/lib/period/period";

type TransactionInput = {
  description: string;
  amount: number;
  category_id: string;
  transaction_date: string;
};

type BudgetUpdate = {
  category_id: string;
  month: number;
  year: number;
  amount: number;
};

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

const isValidDate = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);

  // Menolak tanggal yang "meluap", misalnya 2026-02-30
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toLocaleDateString("en-CA") === value
  );
};

// Ambil budget periode itu, atau buat baru dengan income 0 kalau belum ada
async function getOrCreateBudgetId(
  supabase: SupabaseServer,
  userId: string,
  month: number,
  year: number,
): Promise<string> {
  const find = () =>
    supabase
      .from("budgets")
      .select("id")
      .eq("user_id", userId)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

  const { data: existing, error: findError } = await find();
  if (findError) throw findError;
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("budgets")
    .insert({ user_id: userId, month, year, income: 0 })
    .select("id")
    .single();

  if (insertError) {
    // Permintaan lain baru saja membuatnya (unique user_id, month, year)
    if (insertError.code === "23505") {
      const { data: retry, error: retryError } = await find();
      if (retryError) throw retryError;
      if (retry) return retry.id;
    }
    throw insertError;
  }

  return created.id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transactions = body.transactions as TransactionInput[];
    const budgetUpdates: BudgetUpdate[] = Array.isArray(body.budgetUpdates)
      ? body.budgetUpdates
      : [];
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: "Data transaksi tidak valid." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User belum login." }, { status: 401 });
    }

    // Validasi transaksi
    for (const transaction of transactions) {
      if (
        typeof transaction.description !== "string" ||
        !transaction.description.trim() ||
        typeof transaction.amount !== "number" ||
        !Number.isFinite(transaction.amount) ||
        transaction.amount <= 0 ||
        !transaction.category_id ||
        !isValidDate(transaction.transaction_date)
      ) {
        return NextResponse.json(
          { error: "Data transaksi tidak lengkap atau tidak valid." },
          { status: 400 },
        );
      }
    }

    // Pastikan category_id memang milik user
    const categoryIds = [
      ...new Set(transactions.map((transaction) => transaction.category_id)),
    ];

    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", user.id)
      .in("id", categoryIds);

    if (categoryError) {
      console.error("CHECK CATEGORIES:", categoryError);

      return NextResponse.json(
        { error: "Gagal memvalidasi kategori." },
        { status: 500 },
      );
    }

    if (!categories || categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "Kategori transaksi tidak valid." },
        { status: 400 },
      );
    }

    // Tanggal gajian user menentukan batas periode
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("period_start_day")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) {
      console.error("GET USER SETTINGS:", settingsError);

      return NextResponse.json(
        { error: "Gagal mengambil pengaturan periode." },
        { status: 500 },
      );
    }

    const startDay = settings?.period_start_day ?? 1;

    const periodOf = (date: string) =>
      getCurrentPeriod(startDay, new Date(`${date}T00:00:00`));

    // Satu request bisa berisi tanggal dari periode berbeda,
    // jadi siapkan budget untuk tiap periode yang muncul
    const budgetIds = new Map<string, string>();

    for (const transaction of transactions) {
      const { month, year } = periodOf(transaction.transaction_date);
      const key = `${year}-${month}`;

      if (!budgetIds.has(key)) {
        budgetIds.set(
          key,
          await getOrCreateBudgetId(supabase, user.id, month, year),
        );
      }
    }

    const insertData = transactions.map((transaction) => {
      const { month, year } = periodOf(transaction.transaction_date);

      return {
        user_id: user.id,
        budget_id: budgetIds.get(`${year}-${month}`)!,
        category_id: transaction.category_id,
        description: transaction.description.trim(),
        amount: transaction.amount,
        transaction_date: transaction.transaction_date,
        input_source: "ai",
      };
    });

    // Batas yang dinaikkan user di modal konfirmasi (disimpan sebelum transaksinya)
    // 1. Validasi bentuk data
    for (const update of budgetUpdates) {
      if (
        typeof update?.category_id !== "string" ||
        !categoryIds.includes(update.category_id) ||
        typeof update.amount !== "number" ||
        !Number.isFinite(update.amount) ||
        update.amount <= 0 ||
        !Number.isInteger(update.month) ||
        update.month < 1 ||
        update.month > 12 ||
        !Number.isInteger(update.year)
      ) {
        return NextResponse.json(
          { error: "Data perubahan budget tidak valid." },
          { status: 400 },
        );
      }
    }

    // 2. Total batas setelah perubahan tidak boleh melebihi pemasukan periode itu
    const updatesByPeriod = new Map<string, BudgetUpdate[]>();

    for (const update of budgetUpdates) {
      const key = `${update.year}-${update.month}`;
      updatesByPeriod.set(key, [...(updatesByPeriod.get(key) ?? []), update]);
    }

    for (const updates of updatesByPeriod.values()) {
      const { month, year } = updates[0];

      const { data: budget } = await supabase
        .from("budgets")
        .select("id, income")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      const income = Number(budget?.income ?? 0);

      // Pemasukan belum diisi: batas total tidak dicek
      if (!budget || income <= 0) continue;

      const { data: rows } = await supabase
        .from("budget_categories")
        .select("category_id, amount")
        .eq("budget_id", budget.id);

      const limits = new Map(
        (rows ?? []).map((row) => [row.category_id, Number(row.amount)]),
      );
      updates.forEach((u) => limits.set(u.category_id, u.amount));

      const total = [...limits.values()].reduce((sum, v) => sum + v, 0);

      if (total > income) {
        return NextResponse.json(
          { error: "Total batas melebihi pemasukan periode ini." },
          { status: 400 },
        );
      }
    }

    // 3. Simpan
    for (const update of budgetUpdates) {
      const budgetId = await getOrCreateBudgetId(
        supabase,
        user.id,
        update.month,
        update.year,
      );

      const { error: limitError } = await supabase
        .from("budget_categories")
        .upsert(
          {
            budget_id: budgetId,
            category_id: update.category_id,
            amount: update.amount,
          },
          { onConflict: "budget_id,category_id" },
        );

      if (limitError) {
        console.error("UPDATE BUDGET LIMIT:", limitError);
        return NextResponse.json(
          { error: "Gagal memperbarui batas budget." },
          { status: 500 },
        );
      }
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert(insertData)
      .select();

    if (error) {
      console.error("INSERT TRANSACTIONS:", error);

      return NextResponse.json(
        { error: "Gagal menyimpan transaksi." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Transaksi berhasil disimpan.",
      transactions: data,
    });
  } catch (error) {
    console.error("TRANSACTION API ERROR:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan transaksi." },
      { status: 500 },
    );
  }
}
