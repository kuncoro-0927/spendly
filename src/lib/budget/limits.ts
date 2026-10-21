import { BudgetWarning, PeriodBudget } from "@/app/hooks/budget/useBudgetCheck";
export type WarningState = {
  needed: number; // batas minimum agar transaksi muat
  value: number; // nilai saat ini (diketik user, atau saran bawaan)
  max: number | null; // batas tertinggi yang diizinkan, null = pemasukan belum diisi
  tooLow: boolean;
  tooHigh: boolean;
  impossible: boolean; // tidak ada nilai yang valid, anggaran sudah penuh
};

export function evaluateWarnings(
  warnings: BudgetWarning[],
  periods: Record<string, PeriodBudget>,
  raises: Record<string, number>,
) {
  const inPeriodOf = (w: BudgetWarning) =>
    warnings.filter((x) => x.periodKey === w.periodKey);

  // Nilai bawaan: saran yang dibulatkan, tapi tidak melewati sisa pemasukan
  const defaultOf = (w: BudgetWarning) => {
    const needed = w.spent + w.added;
    const period = periods[w.periodKey];

    if (!period || period.income <= 0) return w.suggested;
    if (inPeriodOf(w).length > 1) return needed;

    const room = period.income - (period.totalLimit - w.limit);
    return Math.min(w.suggested, Math.max(room, needed));
  };

  const valueOf = (w: BudgetWarning) => raises[w.key] ?? defaultOf(w);

  const states: Record<string, WarningState> = {};

  for (const w of warnings) {
    const period = periods[w.periodKey];
    const inPeriod = inPeriodOf(w);
    const needed = w.spent + w.added;
    const value = valueOf(w);

    let max: number | null = null;
    let impossible = false;

    if (period && period.income > 0) {
      // Batas kategori lain di periode itu yang tidak ikut dinaikkan
      const untouched =
        period.totalLimit - inPeriod.reduce((sum, x) => sum + x.limit, 0);

      const othersNow = inPeriod
        .filter((x) => x.key !== w.key)
        .reduce((sum, x) => sum + valueOf(x), 0);

      max = Math.max(period.income - untouched - othersNow, 0);

      // Walau semua dinaikkan seminimal mungkin, totalnya tetap melebihi pemasukan
      const minimumTotal =
        untouched + inPeriod.reduce((sum, x) => sum + x.spent + x.added, 0);

      impossible = minimumTotal > period.income;
    }

    states[w.key] = {
      needed,
      value,
      max,
      tooLow: value < needed,
      tooHigh: max !== null && value > max,
      impossible,
    };
  }

  const blocked = Object.values(states).some(
    (s) => s.tooLow || s.tooHigh || s.impossible,
  );

  return { states, blocked };
}
