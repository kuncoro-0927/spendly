import { PiReceiptLight, PiCalendarDotsLight } from "react-icons/pi";
import { BsSearch } from "react-icons/bs";
import TotalCard from "./TotalCard";
import MonthPicker from "../ui/MonthPickerButton";
type Props = {
  month: number; // 1-based
  year: number;
  onPeriodChange: (month: number, year: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  total: number;
  hasFilters: boolean;
  count: number;
  difference: number | null;
  loading: boolean;
};

export function TransactionsHeader({
  month,
  year,
  onPeriodChange,
  search,
  onSearchChange,
  total,
  count,
  hasFilters,
  difference,
  loading,
}: Props) {
  return (
    <div className="flex flex-col gap-8 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-linear-to-r from-orange/15 to-yellow/15 flex items-center justify-center">
          <PiReceiptLight className="icon-gradient-fill text-xl" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transaksi</h1>

          <p className="text-sm text-[#6c6c6c]">
            Kelola riwayat transaksi kamu
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-start justify-between lg:items-end">
        <TotalCard
          total={total}
          count={count}
          hasFilters={hasFilters}
          difference={difference}
          loading={loading}
        />

        <div className="flex flex-col items-start lg:items-end gap-3">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari transaksi"
              className="w-full rounded-lg border border-black/20 py-2 pl-9 pr-4 text-sm outline-none focus:border-orange"
            />
            <BsSearch className="absolute text-sm bottom-3 left-3 text-[#6c6c6c]" />
          </div>

          <MonthPicker
            month={month - 1}
            year={year}
            onChange={(newMonth, newYear) =>
              onPeriodChange(newMonth + 1, newYear)
            }
          />
        </div>
      </div>
    </div>
  );
}
