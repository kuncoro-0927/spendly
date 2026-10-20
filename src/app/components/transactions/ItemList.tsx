import ItemCard from "./ItemCard";
import { formatShortRupiah } from "@/lib/transactions/display";
import type {
  TransactionCategory,
  TransactionGroup,
  TransactionItem,
} from "@/app/hooks/transactions/useTransactions";

type Props = {
  groups: TransactionGroup[];
  categoryById: Record<string, TransactionCategory>;
  onEdit: (item: TransactionItem) => void;
  onDelete: (item: TransactionItem) => void;
};

export default function ItemList({
  groups,
  categoryById,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.date} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6c6c6c]">{group.label}</span>
            <span className="text-xs text-[#6c6c6c]">
              IDR {formatShortRupiah(group.total)}
            </span>
          </div>

          {group.items.map((item) => (
            <ItemCard
              key={item.id}
              transaction={item}
              category={categoryById[item.category_id]}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
