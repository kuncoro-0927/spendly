import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPeriod } from "@/lib/period/period";

type TransactionInput = {
  description: string;
  amount: number;
  category_id: string;
  transaction_date: string;
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
