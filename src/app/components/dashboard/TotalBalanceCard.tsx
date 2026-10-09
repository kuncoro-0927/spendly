export default function TotalBalanceCard() {
  return (
    <div className="p-5 flex flex-col justify-between bg-linear-to-tr from-orange to-yellow  rounded-xl">
      <span className="text-white font-medium text-xl">Hi, John!</span>

      <div className="mt-auto flex items-end gap-1 justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-white">lorem ipsum dolor</span>
          <span className="text-2xl font-semibold text-white">
            IDR 3.000.000
          </span>
        </div>

        <div className="px-2 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs text-white">
          + 0.4% today
        </div>
      </div>
    </div>
  );
}
