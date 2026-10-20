import { Icon } from "@iconify/react";
import { PiPencilSimpleLight, PiTrashLight } from "react-icons/pi";
import { formatShortRupiah, resolveIcon } from "@/lib/transactions/display";
import type {
  TransactionCategory,
  TransactionItem,
} from "@/app/hooks/transactions/useTransactions";

type Props = {
  transaction: TransactionItem;
  category?: TransactionCategory;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ItemCard({
  transaction,
  category,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-black/20 p-2 duration-300 hover:border-orange/70 hover:shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-orange/15 to-yellow/15">
          <Icon
            icon={resolveIcon(category?.icon)}
            width={20}
            height={20}
            className="icon-gradient-fill"
          />
        </span>

        <div className="flex min-w-0 flex-col items-start gap-0.5">
          <div className="flex w-full min-w-0 items-center gap-1.5">
            <span className="truncate text-xs font-semibold">
              {transaction.description}
            </span>

            {transaction.input_source === "ai" && (
              <span className="shrink-0 rounded-full bg-orange/15 px-1.5 py-px text-[10px] text-orange">
                AI
              </span>
            )}
          </div>

          <span className="whitespace-nowrap text-xs text-[#6c6c6c]">
            {category?.name ?? "Lainnya"}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-8">
        <span className="whitespace-nowrap font-semibold leading-tight">
          <span className="text-[10px] font-normal leading-tight text-[#6c6c6c]">
            IDR{" "}
          </span>
          <span className="bg-linear-to-r from-orange to-yellow bg-clip-text text-base text-transparent">
            {formatShortRupiah(transaction.amount)}
          </span>
        </span>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Ubah transaksi"
            className="cursor-pointer rounded-md border border-blue-300 bg-blue-100 px-2 py-1 text-xs text-blue-400 sm:px-3 hover:-translate-y-0.5 hover:shadow-md duration-300"
          >
            <PiPencilSimpleLight className="text-sm sm:hidden" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label="Hapus transaksi"
            className="cursor-pointer rounded-md border border-red-300 bg-red-100 px-2 py-1 text-xs text-red-400 sm:px-3 hover:-translate-y-0.5 hover:shadow-md duration-300"
          >
            <PiTrashLight className="text-sm sm:hidden" />
            <span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
}
