type IncomeCardProps = {
  income: string;
  onChange: (value: string) => void;
};

const formatRupiahInput = (value: string) => {
  const number = value.replace(/\D/g, "");

  if (!number) return "";

  return new Intl.NumberFormat("id-ID").format(Number(number));
};

export function IncomeCard({ income, onChange }: IncomeCardProps) {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Pendapatan Bulanan</h2>

        <p className="text-sm text-gray-500 mt-1">
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
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            onChange(value);
          }}
          placeholder="0"
          className="w-full border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-yellow [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </section>
  );
}
