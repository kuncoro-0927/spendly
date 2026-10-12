"use client";

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { PiCalendarBlankLight } from "react-icons/pi";

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
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
};

export default function MonthPicker({ month, year, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm hover:border-gray-300"
      >
        <PiCalendarBlankLight className="text-lg text-[#6c6c6c]" />
        <span className="font-medium">
          {months[month]} {year}
        </span>
        <IoIosArrowDown
          className={`text-[#6c6c6c] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onChange(month, year - 1)}
              className="rounded-lg px-3 py-1.5 hover:bg-gray-100"
            >
              &larr;
            </button>

            <span className="text-sm font-semibold">{year}</span>

            <button
              type="button"
              onClick={() => onChange(month, year + 1)}
              className="rounded-lg px-3 py-1.5 hover:bg-gray-100"
            >
              &rarr;
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {months.map((name, index) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(index, year);
                  setIsOpen(false);
                }}
                className={`rounded-lg px-2 py-2 text-xs transition-colors ${
                  month === index
                    ? "bg-orange text-white"
                    : "text-gray-600 hover:bg-orange/10 hover:text-orange"
                }`}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
