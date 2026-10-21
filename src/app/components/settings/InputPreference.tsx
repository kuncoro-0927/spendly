"use client";

import PayDayPicker from "../onboarding/PayDayPicker";
import Skeleton from "../ui/Skeleton";
type Props = {
  day: number;
  loading: boolean;
  onChange: (day: number) => void;
};
export default function InputPreference({ day, loading, onChange }: Props) {
  return (
    <section className="mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="font-medium">Preferensi Keuangan</span>
          <span className="text-sm text-[#6c6c6c]">
            Lorem ipsum dolor sit amet consectetur.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="w-full relative">
            {/* <label className="mb-1 block text-sm  text-[#6c6c6c]">
              Tanggal mulai periode anggaran
            </label>

            <input
              type="text"
              value="10 Oktober 2026"
              maxLength={50}
              className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-orange"
            />

            <PiCalendarBlankLight className="absolute text-xl bottom-2 text-[#6c6c6c] right-3" /> */}
            {loading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-full shrink-0 rounded-lg" />
              </div>
            ) : (
              <PayDayPicker value={day} onChange={onChange} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
