import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentPeriod,
  getPeriodRange,
  toDateString,
} from "@/lib/period/period";
import { isValidDate } from "@/lib/transactions/server";

type Input = { category_id: string; amount: number; transaction_date: string };

type Warning = {
  key: string;
  category_id: string;
  category_name: string;
  month: number;
  year: number;
  spent: number;
  added: number;
  limit: number;
  over: number;
  suggested: number;
  periodKey: string;
};

type PeriodData = {
  limits: Map<string, number>;
  spent: Map<string, number>;
  income: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const input = (
      Array.isArray(body.transactions) ? body.transactions : []
    ).filter(
      (t: Input) =>
        typeof t?.category_id === "string" &&
        t.category_id &&
        typeof t.amount === "number" &&
        t.amount > 0 &&
        isValidDate(t.transaction_date),
    ) as Input[];

    if (input.length === 0) return NextResponse.json({ warnings: [] });

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User belum login." }, { status: 401 });
    }

    const { data: settings } = await supabase
      .from("user_settings")
      .select("period_start_day")
      .eq("user_id", user.id)
      .maybeSingle();

    const startDay = settings?.period_start_day ?? 1;

    // Jumlahkan per periode dan kategori (beberapa barang di kategori yang sama jadi satu)
    const added = new Map<
      string,
      { category_id: string; month: number; year: number; amount: number }
    >();

    for (const t of input) {
      const { month, year } = getCurrentPeriod(
        startDay,
        new Date(`${t.transaction_date}T00:00:00`),
      );
      const key = `${year}-${month}-${t.category_id}`;
      const entry = added.get(key) ?? {
        category_id: t.category_id,
        month,
        year,
        amount: 0,
      };

      entry.amount += t.amount;
      added.set(key, entry);
    }

    const { data: categories } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", user.id);

    const nameById = new Map((categories ?? []).map((c) => [c.id, c.name]));

    const periods = new Map<string, PeriodData>();

    const loadPeriod = async (month: number, year: number) => {
      const key = `${year}-${month}`;
      const cached = periods.get(key);
      if (cached) return cached;

      const limits = new Map<string, number>();
      const spent = new Map<string, number>();

      const { data: budget } = await supabase
        .from("budgets")
        .select("id, income")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      const income = Number(budget?.income ?? 0);

      if (budget) {
        const { data: rows } = await supabase
          .from("budget_categories")
          .select("category_id, amount")
          .eq("budget_id", budget.id);

        (rows ?? []).forEach((row) =>
          limits.set(row.category_id, Number(row.amount)),
        );
      }

      const { start, end } = getPeriodRange(month, year, startDay);

      const { data: transactions } = await supabase
        .from("transactions")
        .select("category_id, amount")
        .eq("user_id", user.id)
        .gte("transaction_date", toDateString(start))
        .lt("transaction_date", toDateString(end));

      (transactions ?? []).forEach((row) =>
        spent.set(
          row.category_id,
          (spent.get(row.category_id) ?? 0) + Number(row.amount),
        ),
      );

      const data = { limits, spent, income };
      periods.set(key, data);
      return data;
    };

    const warnings: Warning[] = [];

    for (const entry of added.values()) {
      const period = await loadPeriod(entry.month, entry.year);

      // Kategori tanpa batas tidak pernah memicu peringatan
      const limit = period.limits.get(entry.category_id) ?? 0;
      if (limit <= 0) continue;

      const spent = period.spent.get(entry.category_id) ?? 0;
      const total = spent + entry.amount;
      if (total <= limit) continue;

      warnings.push({
        key: `${entry.year}-${entry.month}-${entry.category_id}`,
        category_id: entry.category_id,
        category_name: nameById.get(entry.category_id) ?? "Kategori",
        month: entry.month,
        periodKey: `${entry.year}-${entry.month}`,
        year: entry.year,
        spent,
        added: entry.amount,
        limit,
        over: total - limit,
        // Saran batas baru: total dibulatkan ke atas per Rp 10.000
        suggested: Math.ceil(total / 10_000) * 10_000,
      });
    }

    const periodSummary: Record<
      string,
      { income: number; totalLimit: number }
    > = {};

    for (const [key, data] of periods) {
      periodSummary[key] = {
        income: data.income,
        totalLimit: [...data.limits.values()].reduce((sum, v) => sum + v, 0),
      };
    }

    return NextResponse.json({ warnings, periods: periodSummary });
  } catch (error) {
    console.error("CHECK BUDGET:", error);
    return NextResponse.json({ warnings: [], periods: {} });
  }
}
