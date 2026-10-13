"use client";

import { useEffect, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { BsStars } from "react-icons/bs";
import {
  PiCalendarBlankLight,
  PiLightbulb,
  PiReceiptLight,
  PiWalletLight,
} from "react-icons/pi";
import { supabase } from "@/lib/supabase/client";
import { formatPeriodRange, getCurrentPeriod } from "@/lib/period/period";

type TutorialStep = {
  icon: ElementType;
  title: string;
  description: string;
  example?: string;
};

// Sesuaikan teksnya dengan fitur yang benar-benar ada
const STEPS: TutorialStep[] = [
  {
    icon: PiWalletLight,
    title: "Selamat datang di Gemi",
    description:
      "Catat pengeluaran, atur anggaran, dan lihat ke mana uangmu pergi. Semuanya di satu tempat.",
  },
  {
    icon: BsStars,
    title: "Catat lewat chat",
    description:
      "Ketik pengeluaranmu dengan bahasa sehari-hari di kolom bawah. AI akan menyusunnya jadi transaksi, dan kamu bisa memeriksanya sebelum disimpan.",
    example: "tadi makan nasi goreng 25rb",
  },
  {
    icon: PiReceiptLight,
    title: "Foto nota belanja",
    description:
      "Tekan tombol plus di kolom chat, lalu unggah foto nota. Setiap barang dibaca otomatis dan dimasukkan ke kategori yang cocok.",
  },
  {
    icon: PiLightbulb,
    title: "Atur budget dan lihat insight",
    description:
      "Tentukan batas pengeluaran tiap kategori di halaman Budget. Dashboard lalu menampilkan sisa anggaran dan insight dari kebiasaanmu.",
  },
];

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);
const LAST_STEP = STEPS.length; // indeks langkah pilih tanggal gajian
const TOTAL = STEPS.length + 1;

export default function OnboardingModal({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [day, setDay] = useState(1);
  const [today, setToday] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Tanggal diisi setelah mount supaya tidak beda antara server dan browser
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(new Date());
  }, []);

  const isLast = step === LAST_STEP;

  const rangeLabel = (() => {
    if (!today) return null;
    const { month, year } = getCurrentPeriod(day, today);
    return formatPeriodRange(month, year, day);
  })();

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    setError("");

    const { error: saveError } = await supabase
      .from("user_settings")
      .upsert(
        { user_id: userId, period_start_day: day },
        { onConflict: "user_id" },
      );

    if (saveError) {
      console.error("SAVE PERIOD START DAY:", saveError);
      setError("Gagal menyimpan. Coba lagi.");
      setSaving(false);
      return;
    }

    // Layout server mengecek ulang user_settings, jadi modal ini hilang
    router.refresh();
  };

  const current = !isLast ? STEPS[step] : null;
  const Icon = current?.icon ?? PiCalendarBlankLight;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        {/* Header: nomor langkah dan tombol lewati */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6c6c6c]">
            {step + 1} dari {TOTAL}
          </span>

          {!isLast && (
            <button
              type="button"
              onClick={() => setStep(LAST_STEP)}
              className="cursor-pointer text-xs text-[#6c6c6c] duration-300 hover:text-black"
            >
              Lewati
            </button>
          )}
        </div>

        {/* Isi langkah */}
        <div className="mt-6 min-h-[340px]">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-orange/15">
            <Icon className="text-3xl text-orange" />
          </div>

          {current ? (
            <>
              <h2
                id="onboarding-title"
                className="mt-5 text-xl font-semibold text-gray-900"
              >
                {current.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {current.description}
              </p>

              {current.example && (
                <div className="mt-4 rounded-xl border border-black/10 bg-gray px-4 py-3 text-sm text-[#6c6c6c]">
                  Contoh: &ldquo;{current.example}&rdquo;
                </div>
              )}
            </>
          ) : (
            <>
              <h2
                id="onboarding-title"
                className="mt-5 text-xl font-semibold text-gray-900"
              >
                Kapan biasanya kamu gajian?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Tanggal ini dipakai untuk menghitung periode keuanganmu. Bisa
                diubah nanti di Pengaturan.
              </p>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {DAYS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDay(value)}
                    aria-pressed={day === value}
                    className={`aspect-square cursor-pointer rounded-lg text-sm duration-200 ${
                      day === value
                        ? "bg-orange font-medium text-white"
                        : "border border-gray-200 text-gray-700 hover:border-orange"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs text-[#6c6c6c]">
                Pilih 1 kalau gajianmu di awal bulan atau tidak tentu.
              </p>

              <div className="mt-3 min-h-[52px] rounded-xl bg-gray p-3 text-sm">
                {rangeLabel && (
                  <>
                    <span className="text-xs text-[#6c6c6c]">
                      Periode keuanganmu saat ini
                    </span>
                    <p className="mt-0.5 font-medium text-gray-900">
                      {rangeLabel}
                    </p>
                  </>
                )}
              </div>

              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </>
          )}
        </div>

        {/* Indikator langkah */}
        <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: TOTAL }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === step ? "w-6 bg-orange" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Tombol */}
        <div className="mt-5 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((prev) => prev - 1)}
              disabled={saving}
              className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              Kembali
            </button>
          )}

          <button
            type="button"
            onClick={isLast ? handleSave : () => setStep((prev) => prev + 1)}
            disabled={saving}
            className="flex-1 cursor-pointer rounded-xl bg-orange py-3 text-sm font-medium text-white duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            {isLast ? (saving ? "Menyimpan..." : "Mulai pakai Gemi") : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}
