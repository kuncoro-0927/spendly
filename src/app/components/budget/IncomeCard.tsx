import Skeleton from "@/app/components/ui/Skeleton";

type IncomeCardProps = {
  income: string;
  onChange: (value: string) => void;
  loading?: boolean;
};

const formatRupiahInput = (value: string) => {
  const number = value.replace(/\D/g, "");

  if (!number) return "";

  return new Intl.NumberFormat("id-ID").format(Number(number));
};

export function IncomeCard({
  income,
  onChange,
  loading = false,
}: IncomeCardProps) {
  return loading ? (
    <section className="animate-pulse rounded-2xl bg-gray-100 p-6">
      <div className="mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <Skeleton className="h-12 w-full rounded-xl" />
    </section>
  ) : (
    <section className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Pendapatan Bulanan</h2>

        <p className="mt-1 text-sm text-gray-500">
          Masukkan total pendapatan yang kamu miliki bulan ini.
        </p>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          IDR
        </span>

        <input
          type="text"
          inputMode="numeric"
          value={formatRupiahInput(income)}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          placeholder="0"
          className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:border-yellow [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </section>
  );
}
