"use client";

import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { PiCalendarBlankLight } from "react-icons/pi";

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

type Props = {
  value: number;
  onChange: (day: number) => void;
};

export default function PayDayPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative mt-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm duration-200 ${
          open ? "border-orange" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <PiCalendarBlankLight className="shrink-0 text-xl text-[#6c6c6c]" />
        <span className="flex-1 font-medium text-gray-900">
          Tanggal {value} setiap bulan
        </span>
        <IoIosArrowDown
          className={`shrink-0 text-[#6c6c6c] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 max-w-[calc(100vw-3rem)] rounded-2xl border border-black/10 bg-white p-3 shadow-xl">
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  onChange(day);
                  setOpen(false);
                }}
                aria-pressed={value === day}
                className={`h-9 cursor-pointer rounded-lg text-sm duration-200 ${
                  value === day
                    ? "bg-orange font-medium text-white"
                    : "text-gray-700 hover:bg-orange/10 hover:text-orange"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <p className="mt-3 border-t border-gray-100 pt-2 text-[11px] text-[#6c6c6c]">
            Maksimal tanggal 28 agar berlaku di semua bulan.
          </p>
        </div>
      )}
    </div>
  );
}
