const DAY_MS = 86_400_000;

// Rentang periode. end bersifat eksklusif (dipakai dengan .lt)
export function getPeriodRange(month: number, year: number, startDay: number) {
  return {
    start: new Date(year, month - 1, startDay),
    end: new Date(year, month, startDay),
    previousStart: new Date(year, month - 2, startDay),
  };
}

// Periode yang sedang berjalan hari ini
export function getCurrentPeriod(startDay: number, today = new Date()) {
  const month =
    today.getDate() >= startDay ? today.getMonth() + 1 : today.getMonth();

  return month === 0
    ? { month: 12, year: today.getFullYear() - 1 }
    : { month, year: today.getFullYear() };
}

// "10 Okt sampai 9 Nov"
export function formatPeriodRange(
  month: number,
  year: number,
  startDay: number,
) {
  const { start, end } = getPeriodRange(month, year, startDay);
  const lastDay = new Date(end.getTime() - DAY_MS);
  const fmt = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  });

  return `${fmt.format(start)} sampai ${fmt.format(lastDay)}`;
}

export const daysBetween = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / DAY_MS);

export const toDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
