import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPeriod } from "@/lib/period/period";
import { getOrCreateBudgetId, isValidDate } from "@/lib/transactions/server";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();

    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const { amount, category_id, transaction_date } = body;

    if (
      !description ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      typeof category_id !== "string" ||
      !category_id ||
      !isValidDate(transaction_date)
    ) {
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

    // Kategori harus milik user
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (categoryError) throw categoryError;

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak valid." },
        { status: 400 },
      );
    }

    // Periode baru ditentukan dari tanggal (bisa berpindah periode)
    const { data: settings } = await supabase
      .from("user_settings")
      .select("period_start_day")
      .eq("user_id", user.id)
      .maybeSingle();

    const startDay = settings?.period_start_day ?? 1;
    const { month, year } = getCurrentPeriod(
      startDay,
      new Date(`${transaction_date}T00:00:00`),
    );

    const budgetId = await getOrCreateBudgetId(supabase, user.id, month, year);

    const { data, error } = await supabase
      .from("transactions")
      .update({
        description,
        amount,
        category_id,
        transaction_date,
        budget_id: budgetId,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ transaction: data });
  } catch (error) {
    console.error("UPDATE TRANSACTION:", error);

    return NextResponse.json(
      { error: "Gagal memperbarui transaksi." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User belum login." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Transaksi dihapus." });
  } catch (error) {
    console.error("DELETE TRANSACTION:", error);

    return NextResponse.json(
      { error: "Gagal menghapus transaksi." },
      { status: 500 },
    );
  }
}
