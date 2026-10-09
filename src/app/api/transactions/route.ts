import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type TransactionInput = {
  description: string;
  amount: number;
  category_id: string;
  transaction_date: string;
};

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

    // Ambil user yang sedang login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User belum login." }, { status: 401 });
    }

    // Validasi transaksi
    for (const transaction of transactions) {
      if (
        !transaction.description ||
        typeof transaction.amount !== "number" ||
        transaction.amount <= 0 ||
        !transaction.category_id ||
        !transaction.transaction_date
      ) {
        return NextResponse.json(
          { error: "Data transaksi tidak lengkap." },
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

    // Ambil budget berdasarkan tanggal transaksi
    const budgetKeys = [
      ...new Set(
        transactions.map((transaction) => {
          const date = new Date(`${transaction.transaction_date}T00:00:00`);

          return {
            month: date.getMonth() + 1,
            year: date.getFullYear(),
          };
        }),
      ),
    ];

    const budgetIds = new Map<string, string>();

    for (const budgetKey of budgetKeys) {
      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .select("id")
        .eq("user_id", user.id)
        .eq("month", budgetKey.month)
        .eq("year", budgetKey.year)
        .maybeSingle();

      if (budgetError) {
        console.error("GET BUDGET:", budgetError);

        return NextResponse.json(
          { error: "Gagal mengambil budget." },
          { status: 500 },
        );
      }

      if (!budget) {
        return NextResponse.json(
          {
            error: `Budget untuk ${budgetKey.month}/${budgetKey.year} belum dibuat.`,
          },
          { status: 400 },
        );
      }

      budgetIds.set(`${budgetKey.year}-${budgetKey.month}`, budget.id);
    }

    // Siapkan data untuk insert
    const insertData = transactions.map((transaction) => {
      const date = new Date(`${transaction.transaction_date}T00:00:00`);

      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const budgetId = budgetIds.get(`${year}-${month}`);

      return {
        user_id: user.id,
        budget_id: budgetId,
        category_id: transaction.category_id,
        description: transaction.description,
        amount: transaction.amount,
        transaction_date: transaction.transaction_date,
        input_source: "ai",
      };
    });

    // Simpan semua transaksi
    const { data, error } = await supabase
      .from("transactions")
      .insert(insertData)
      .select();
    if (error) {
      console.error("INSERT TRANSACTIONS:", error);

      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
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
