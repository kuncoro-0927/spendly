"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { LuTrash2 } from "react-icons/lu";

const DIGITS = "300000"; // tampil sebagai 300.000

const formatInput = (digits: string) =>
  digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";

export default function BudgetMock() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Hormati pengaturan "kurangi gerakan": langsung tampil penuh
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(DIGITS.length);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let index = 0;

    const tick = () => {
      if (index < DIGITS.length) {
        index += 1;
        setCount(index);
        // Jeda acak 150 sampai 250 ms per angka
        timer = setTimeout(tick, 150 + Math.random() * 100);
        return;
      }

      // Selesai: diam sebentar, kosongkan, lalu ulang
      timer = setTimeout(() => {
        index = 0;
        setCount(0);
        timer = setTimeout(tick, 700);
      }, 1400);
    };

    timer = setTimeout(tick, 600);

    return () => clearTimeout(timer);
  }, []);

  const value = formatInput(DIGITS.slice(0, count));

  return (
    <div
      className="mt-4 flex items-center gap-x-4 gap-y-3 rounded-xl border border-black/10 shadow-xs bg-white p-3"
      aria-hidden="true"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/15">
        <Icon
          icon="ph:car-light"
          width={20}
          height={20}
          className="text-orange"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-900">Transportasi</p>
        <p className="mt-0.5 text-[10px] text-[#6c6c6c]">Batas pengeluaran</p>
      </div>



      {/* Kolom nominal, tampil seperti sedang fokus */}
      <div className="relative order-last w-full max-w-[100px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
          IDR
        </span>

        <div className="flex min-h-[35px] w-full items-center rounded-lg border border-orange py-2 pl-9 pr-3 text-xs">
          {value ? (
            <span className="text-gray-900">{value}</span>
          ) : (
            <span className="text-gray-400">0</span>
          )}

          <span className="ml-px inline-block h-3 w-px bg-gray-900 animate-[caret-blink_1s_step-end_infinite] motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}