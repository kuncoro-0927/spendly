"use client";

import { PiWarningLight } from "react-icons/pi";
import {
  formatRupiahInput,
  formatRupiahText,
} from "@/lib/transactions/display";
import type { BudgetWarning } from "@/app/hooks/budget/useBudgetCheck";
import type { WarningState } from "@/lib/budget/limits";

type Props = {
  warnings: BudgetWarning[];
  states: Record<string, WarningState>;
  onRaise: (key: string, amount: number | null) => void;
};

export default function BudgetWarnings({ warnings, states, onRaise }: Props) {
  if (warnings.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-3">
      {warnings.map((w) => {
        const s = states[w.key];
        if (!s) return null;

        const invalid = s.tooLow || s.tooHigh;

        return (
          <div
            key={w.key}
            className="rounded-xl border border-orange/30 bg-orange/5 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <PiWarningLight className="mt-0.5 shrink-0 text-base text-orange" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {w.category_name} melebihi batas
                  </p>
                  <p className="mt-0.5 text-xs text-[#6c6c6c]">
                    Terpakai {formatRupiahText(w.spent)} + transaksi ini{" "}
                    {formatRupiahText(w.added)} = {formatRupiahText(s.needed)}
                  </p>
                </div>
              </div>

              <span className="shrink-0 whitespace-nowrap rounded-full bg-orange/15 px-2 py-0.5 text-xs font-medium text-orange">
                +{formatRupiahText(w.over)}
              </span>
            </div>

            {s.impossible ? (
              <p className="mt-3 rounded-lg bg-white p-2.5 text-xs text-gray-700">
                Pemasukan periode ini sudah habis dialokasikan, jadi batas{" "}
                {w.category_name} tidak bisa dinaikkan lagi. Ubah kategori
                transaksi ini, atau tutup lalu kurangi batas kategori lain di
                halaman Budget.
              </p>
            ) : (
              <>
                <label className="mt-3 block text-xs text-[#6c6c6c]">
                  Naikkan batas {w.category_name} dari{" "}
                  {formatRupiahText(w.limit)} menjadi
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      IDR
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatRupiahInput(String(s.value || ""))}
                      onChange={(e) =>
                        onRaise(
                          w.key,
                          Number(e.target.value.replace(/\D/g, "")) || 0,
                        )
                      }
                      placeholder="0"
                      className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-black outline-none focus:border-orange ${
                        invalid ? "border-orange" : "border-gray-200"
                      }`}
                    />
                  </div>
                </label>

                {s.tooLow ? (
                  <p className="mt-1.5 text-[11px] text-orange">
                    Minimal {formatRupiahText(s.needed)} agar transaksi ini
                    muat.
                  </p>
                ) : s.tooHigh && s.max !== null ? (
                  <p className="mt-1.5 text-[11px] text-orange">
                    Maksimal {formatRupiahText(s.max)}, sesuai sisa pemasukan
                    periode ini.
                  </p>
                ) : s.max !== null ? (
                  <p className="mt-1.5 text-[11px] text-[#6c6c6c]">
                    Maksimal {formatRupiahText(s.max)}, sesuai sisa pemasukan
                    periode ini.
                  </p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-[#6c6c6c]">
                    Pemasukan periode ini belum diisi, jadi total batas belum
                    dicek.
                  </p>
                )}
              </>
            )}

            <p className="mt-2 border-t border-black/5 pt-2 text-[11px] text-[#6c6c6c]">
              Tidak mau menaikkan? Ubah kategori atau jumlah transaksinya di
              atas.
            </p>
          </div>
        );
      })}
    </div>
  );
}
