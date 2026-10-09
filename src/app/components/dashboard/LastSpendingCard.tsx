import { PiHamburgerLight } from "react-icons/pi";

export default function LastSpendingCard() {
  return (
    <div className="border border-black/20 flex items-start gap-3 rounded-2xl p-4 w-full">
      <div className=" flex items-center gap-3">
        <span className="bg-orange/10 flex items-center justify-center rounded-lg h-10 w-10">
          <PiHamburgerLight  className="text-orange"/>
        </span>
        <div className="flex flex-col items-start gap-0.5 leading-none max-w-[100px]">
          <span className="text-sm font-semibold truncate w-full">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          </span>

          <span className="font-medium text-xs text-[#6c6c6c]">Makan</span>
        </div>
      </div>
      <span className="text-sm font-semibold whitespace-nowrap"> 12K</span>
    </div>
  );
}
