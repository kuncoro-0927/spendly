import {
  PiChartLineDownLight,
  PiChartLineUpLight,
  PiMinusLight,
} from "react-icons/pi";
import { formatRupiahText } from "@/lib/transactions/display";

const AREA = 40;

type BarsProps = {
  current: number;
  previous: number;
  currentClassName?: string;
};

export function PeriodBars({
  current,
  previous,
  currentClassName = "bg-linear-to-t from-orange to-yellow",
}: BarsProps) {
  const max = Math.max(current, previous, 1);

  const barHeight = (value: number) =>
    value > 0 ? Math.max((value / max) * AREA, 4) : 2;

  return (
    <div
      role="img"
      aria-label="Perbandingan periode lalu dan periode ini"
      className="flex shrink-0 items-end gap-2"
    >
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-end" style={{ height: AREA }}>
          <div
            className="w-4 rounded-t-md bg-gray-300"
            style={{ height: barHeight(previous) }}
          />
        </div>
        <span className="text-[10px] text-[#6c6c6c]">Lalu</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-end" style={{ height: AREA }}>
          <div
            className={`w-4 rounded-t-md ${currentClassName}`}
            style={{ height: barHeight(current) }}
          />
        </div>
        <span className="text-[10px] text-[#6c6c6c]">Ini</span>
      </div>
    </div>
  );
}

type TextProps = {
  current: number;
  previous: number;
  upIsGood?: boolean;
  emptyLabel?: string;
  className?: string;
};

export function PeriodText({
  current,
  previous,
  upIsGood = true,
  emptyLabel = "Belum ada data",
  className = "",
}: TextProps) {
  // Kedua periode belum memiliki nilai
  if (current === 0 && previous === 0) {
    return (
      <span className={`text-xs text-[#6c6c6c] ${className}`}>
        {emptyLabel}
      </span>
    );
  }

  // Periode sebelumnya belum memiliki nilai
  if (previous === 0) {
    return (
      <span className={`text-xs text-[#6c6c6c] ${className}`}>
        Belum ada data periode lalu
      </span>
    );
  }

  const difference = current - previous;

  // Nilainya sama
  if (difference === 0) {
    return (
      <span
        className={`flex items-center gap-1 text-xs text-[#6c6c6c] ${className}`}
      >
        <PiMinusLight className="text-sm" />
        Sama seperti periode lalu
      </span>
    );
  }

  const up = difference > 0;
  const good = up === upIsGood;

  return (
    <span
      className={`flex flex-wrap items-center gap-x-1 text-xs ${className}`}
    >
      <span
        className={`flex items-center gap-1 ${
          good ? "text-green-600" : "text-red-500"
        }`}
      >
        {up ? (
          <PiChartLineUpLight className="text-sm" />
        ) : (
          <PiChartLineDownLight className="text-sm" />
        )}
        {up ? "+" : "-"}
        {formatRupiahText(Math.abs(difference))}
      </span>

      <span className="text-[#6c6c6c]">dari periode lalu</span>
    </span>
  );
}
