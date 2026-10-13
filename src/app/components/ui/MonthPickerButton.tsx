"use client";

import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { PiCalendarBlankLight } from "react-icons/pi";
import { usePeriodStartDay } from "@/lib/period/periodProvider";
import { formatPeriodRange, getCurrentPeriod } from "@/lib/period/period";

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

type Props = {
  month: number; // 0-based, sama seperti sebelumnya
  year: number;
  onChange: (month: number, year: number) => void;
};

export default function MonthPicker({ month, year, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const startDay = usePeriodStartDay();
  const current = getCurrentPeriod(startDay); // month 1-based

  // formatPeriodRange memakai month 1-based
  const rangeLabel = formatPeriodRange(month + 1, year, startDay);

  // Tutup saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-gray-300"
      >
        <PiCalendarBlankLight className="shrink-0 text-lg text-[#6c6c6c]" />

        <span className="flex flex-col leading-tight">
          <span className="font-medium">
            {months[month]} {year}
          </span>
          <span className="text-[11px] text-[#6c6c6c]">{rangeLabel}</span>
        </span>

        <IoIosArrowDown
          className={`shrink-0 text-[#6c6c6c] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-100 bg-white p-3 shadow-lg lg:right-0 lg:left-auto">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onChange(month, year - 1)}
              aria-label="Tahun sebelumnya"
              className="cursor-pointer rounded-lg px-3 py-1.5 hover:bg-gray"
            >
              &larr;
            </button>

            <span className="text-sm font-semibold">{year}</span>

            <button
              type="button"
              onClick={() => onChange(month, year + 1)}
              aria-label="Tahun berikutnya"
              className="cursor-pointer rounded-lg px-3 py-1.5 hover:bg-gray"
            >
              &rarr;
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {months.map((name, index) => {
              const isSelected = month === index;
              const isCurrent =
                current.month === index + 1 && current.year === year;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(index, year);
                    setIsOpen(false);
                  }}
                  className={`cursor-pointer rounded-lg border px-2 py-2 text-xs transition-colors ${
                    isSelected
                      ? "border-orange bg-orange text-white"
                      : isCurrent
                        ? "border-orange/40 text-orange hover:bg-orange/10"
                        : "border-transparent text-gray-600 hover:bg-orange/10 hover:text-orange"
                  }`}
                >
                  {name.slice(0, 3)}
                </button>
              );
            })}
          </div>

          <p className="mt-3 border-t border-gray-100 pt-2 text-[11px] text-[#6c6c6c]">
            Garis oranye = periode berjalan
          </p>
        </div>
      )}
    </div>
  );
}
