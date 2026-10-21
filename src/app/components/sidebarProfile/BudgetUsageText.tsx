import { PiChartPieSliceLight } from "react-icons/pi";

type Props = {
  spent: number;
  budget: number;
  className?: string;
};

export default function BudgetUsageText({
  spent,
  budget,
  className = "",
}: Props) {
  // Belum ada budget: tidak ada yang bisa dibandingkan
  if (budget <= 0) {
    return (
      <span
        className={`flex items-center gap-1 text-xs text-[#6c6c6c] ${className}`}
      >
        <PiChartPieSliceLight className="text-sm" />
        Budget belum diatur
      </span>
    );
  }

  const raw = (spent / budget) * 100;
  const over = raw > 100;

  // Di bawah 1% tampil "<1%", bukan "0%", supaya pengeluaran kecil tetap terlihat
  const label = spent > 0 && raw < 1 ? "<1%" : `${Math.round(raw)}%`;

  return (
    <span className={`flex items-center gap-1 text-xs ${className}`}>
      <PiChartPieSliceLight
        className={`text-sm ${over ? "text-red-500" : "text-orange"}`}
      />
      <span className={over ? "text-red-500" : "text-orange"}>{label}</span>
      <span className="text-[#6c6c6c]">dari budget terpakai</span>
    </span>
  );
}
