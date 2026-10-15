"use client";

import { Icon } from "@iconify/react";
import { PiTrashLight } from "react-icons/pi";
import { IoIosArrowDown } from "react-icons/io";
import { Category, ReceiptTransaction } from "@/lib/receipt/receipt-types";
import {
  formatRupiah,
  formatRupiahInput,
  formatDate,
} from "@/lib/receipt/format";

const legacyIconMap: Record<string, string> = {
  house: "ph:house-light",
  hamburger: "ph:hamburger-light",
  car: "ph:car-light",
  soccer: "ph:football-light",
  "shopping-bag": "ph:shopping-bag-light",
  medical: "ph:first-aid-kit-light",
};

type Props = {
  index: number;
  transaction: ReceiptTransaction;
  categories: Category[];
  expanded: boolean;
  date?: string;
  onToggle: () => void;
  onChange: (field: keyof ReceiptTransaction, value: string | number) => void;
  onDelete: () => void;
};

export default function ReceiptItemCard({
  index,
  transaction,
  categories,
  expanded,
  date,
  onToggle,
  onChange,
  onDelete,
}: Props) {
  const category = categories.find(
    (item) => item.id === transaction.category_id,
  );

  const categoryIcon = category?.icon ?? "";

  const iconName = categoryIcon.includes(":")
    ? categoryIcon
    : legacyIconMap[categoryIcon] || "ph:house-light";

  return (
    <div
      className={`overflow-hidden rounded-xl border duration-300 hover:border-orange hover:shadow-sm ${
        expanded ? "border-orange shadow-sm" : "border-black/10"
      }`}
    >
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="text-xs text-[#6c6c6c]">
          Barang {index + 1}
          {date && ` · ${formatDate(date)}`}
        </span>

        <button
          type="button"
          onClick={onDelete}
          className="cursor-pointer text-xs text-red-500 duration-300 hover:text-red-700"
          aria-label={`Hapus barang ${index + 1}`}
        >
          <PiTrashLight className="text-xl" />
        </button>
      </div>

      {/* Header card */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between gap-2 p-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-orange/15 to-yellow/15">
            <Icon
              icon={iconName}
              width={23}
              height={23}
              className="icon-gradient-fill"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {transaction.description}
            </p>
            <p className="text-xs text-[#6c6c6c]">
              {category?.name || "Lainnya"} | {formatRupiah(transaction.amount)}
            </p>
          </div>
        </div>

        <IoIosArrowDown
          className={`shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Isi accordion */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 px-3 pb-3 pt-4">
            <label className="block text-xs text-[#6c6c6c]">
              Nama barang
              <input
                value={transaction.description}
                onChange={(e) => onChange("description", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 p-3 text-sm text-black outline-none focus:border-orange"
              />
            </label>

            <label className="block text-xs text-[#6c6c6c]">
              Nominal
              <input
                type="text"
                inputMode="numeric"
                value={formatRupiahInput(transaction.amount)}
                onChange={(e) => {
                  const newValue = e.target.value.replace(/\D/g, "");
                  onChange("amount", newValue ? Number(newValue) : 0);
                }}
                className="mt-1.5 w-full rounded-lg border border-gray-200 p-3 text-sm text-black outline-none focus:border-orange"
              />
            </label>

            <div className="relative">
              <label className="block text-xs text-[#6c6c6c]">Kategori</label>

              <select
                value={transaction.category_id}
                onChange={(e) => onChange("category_id", e.target.value)}
                className="mt-1.5 w-full appearance-none rounded-lg border border-gray-200 bg-white p-3 pr-10 text-sm text-black outline-none transition focus:border-orange"
              >
                <option value="">Pilih kategori</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <IoIosArrowDown className="pointer-events-none absolute right-3 top-[38px] text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
