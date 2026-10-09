import { PiLightbulb } from "react-icons/pi";

export default function InsightCard() {
  return (
    <div className="bg-gray p-6 rounded-xl">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-sm bg-white">
          <PiLightbulb />
        </span>
        <span className="text-sm">Insight</span>
      </div>

      <p className="text-sm text-[#6c6c6c] mt-3">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam optio
        consequuntur possimus error vitae,
      </p>

      <div className="flex items-center gap-2 mt-8">
        <div className="flex border-2 w-full rounded-lg border-black"></div>
        <div className="flex border-2 w-full rounded-lg border-gray-300"></div>
        <div className="flex border-2 w-full rounded-lg border-gray-300"></div>
      </div>
    </div>
  );
}
