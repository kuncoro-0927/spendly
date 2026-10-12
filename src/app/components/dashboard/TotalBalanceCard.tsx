"use client";

import { useSearchParams } from "next/navigation";
import { useDashboard } from "@/app/hooks/dashboard/useDashboard";

export default function TotalBalanceCard() {
  const searchParams = useSearchParams();

  const now = new Date();
  const month = Number(searchParams.get("month")) || now.getMonth() + 1;
  const year = Number(searchParams.get("year")) || now.getFullYear();

  const { summary } = useDashboard(month, year);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="flex flex-col justify-between rounded-xl bg-linear-to-tr from-orange to-yellow p-5">
      <span className="text-xl font-medium text-white">Hi, John!</span>

      <div className="mt-auto flex items-end justify-between gap-1">
        <div className="flex flex-col">
          <span className="text-sm text-white">Sisa anggaran</span>
          <span className="text-2xl font-semibold text-white">
            {formatRupiah(summary.remaining)}
          </span>
        </div>

        <div className="rounded-full bg-white/20 px-2 py-1.5 text-xs text-white backdrop-blur-sm">
          {new Intl.DateTimeFormat("id-ID", {
            month: "short",
            year: "numeric",
          }).format(new Date(year, month - 1, 1))}
        </div>
      </div>
    </div>
  );
}
