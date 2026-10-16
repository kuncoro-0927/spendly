import { Icon } from "@iconify/react";

type Item = {
  id: string;
  description: string;
  category_name: string;
  category_icon: string;
  amount: number;
};

const FRONT: Item = {
  id: "1",
  description: "Ojek Online",
  category_name: "Transportasi",
  category_icon: "ph:car-light",
  amount: 35000,
};

const BACK: Item = {
  id: "2",
  description: "Nasi goreng",
  category_name: "Makanan",
  category_icon: "ph:hamburger-light",
  amount: 20000,
};

const formatAmount = (amount: number) => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} Jt`;
  }

  if (amount >= 1000) {
    return `${(amount / 1000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}K`;
  }

  return amount.toLocaleString("id-ID");
};

function SpendingRow({ item }: { item: Item }) {
  return (
    <div className="flex w-full min-w-0 items-start justify-between gap-3 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/10">
          <Icon
            icon={item.category_icon}
            width={20}
            height={20}
            className="text-orange"
          />
        </span>

        <div className="flex min-w-0 flex-col items-start gap-1">
          <span className="w-full truncate text-xs font-medium">
            {item.description}
          </span>

          <span className="whitespace-nowrap text-[10px] text-[#6c6c6c]">
            {item.category_name}
          </span>
        </div>
      </div>

      <span className="whitespace-nowrap font-semibold leading-tight">
        <span className="text-[8px] font-normal leading-tight text-[#6c6c6c]">
          IDR{" "}
        </span>
        <span className="text-xs text-orange">{formatAmount(item.amount)}</span>
      </span>
    </div>
  );
}

export default function LastSpendingLoginMock() {
  return (
    <div className="relative mt-4 pb-6" aria-hidden="true">
      {/* Kartu belakang: lebih sempit, abu-abu, memudar ke bawah */}
      <div
        className="absolute inset-x-4 top-12 rounded-2xl mx-6 border border-black/10 bg-white opacity-60 grayscale"
        style={{
          maskImage: "linear-gradient(to bottom, black 40%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent)",
        }}
      >
        <SpendingRow item={BACK} />
      </div>

      {/* Kartu depan: tajam, melayang di atas */}
      <div className="bg-white/10 border border-white/40 shadow-md rounded-2xl backdrop-blur-md p-1 mx-6">
        <div className="relative z-10 rounded-[12px] border bg-clip-padding  border-black/5 bg-white shadow-xl shadow-black/10">
          <SpendingRow item={FRONT} />
        </div>
      </div>
    </div>
  );
}
