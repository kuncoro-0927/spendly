import type { createClient } from "@/lib/supabase/server";

export type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export const isValidDate = (value: unknown): value is string => {
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
export async function getOrCreateBudgetId(
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
