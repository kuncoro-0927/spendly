import {
  PiChartLineDownLight,
  PiChartLineUpLight,
  PiInfoLight,
  PiMinusLight,
} from "react-icons/pi";
import { formatRupiahText } from "@/lib/transactions/display";

type Props = {
  difference: number | null; // null = periode lalu belum punya data
  hasFilters: boolean;
  align?: "start" | "end";
};

export default function ComparisonNote({
  difference,
  hasFilters,
  align = "end",
}: Props) {
  const alignment =
    align === "end" ? "items-end text-right" : "items-start text-left";

  // Periode lalu belum ada data: tetap tampil sebagai keterangan
  if (difference === null) {
    return (
      <span
        className={`flex w-full flex-col gap-0.5 text-xs text-white ${alignment}`}
      >
        {/* <span className="flex items-center gap-1">
          <PiInfoLight className="shrink-0 text-sm" />
          Belum ada pembanding
        </span> */}
        <span className="text-[10px]  flex items-start gap-1">
          <PiInfoLight className="shrink-0 text-sm" />
          {hasFilters ? "Data lalu kosong" : "Periode lalu kosong"}
        </span>
      </span>
    );
  }

  if (difference === 0) {
    return (
      <span
        className={`flex flex-col gap-0.5 text-xs text-[#6c6c6c] ${alignment}`}
      >
        <span className="flex items-center gap-1">
          <PiMinusLight className="text-sm" />
          Sama
        </span>
        <span className="text-[10px]">seperti periode lalu</span>
      </span>
    );
  }

  const up = difference > 0;

  return (
    <span className={`flex flex-col gap-0.5 ${alignment}`}>
      <span
        className={`flex items-center gap-1 text-[11px] px-1.5 py-1 rounded-full backdrop-blur-md ${
          up ? "text-red-500 bg-red-100/70" : "text-green-600 bg-green-100/70"
        }`}
      >
        {up ? (
          <PiChartLineUpLight className="text-sm" />
        ) : (
          <PiChartLineDownLight className="text-sm" />
        )}
        {up ? "Naik" : "Turun"} {formatRupiahText(difference)}
      </span>

      <span className="text-[10px] text-white">dari periode lalu</span>
    </span>
  );
}
