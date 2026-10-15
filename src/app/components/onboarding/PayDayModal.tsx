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
import PayDayPicker from "./PayDayPicker";
import SpendingMock from "./SpendingMock";
import ChatMock from "./ChatMock";
import BudgetMock from "./BudgetMock";
type TutorialStep = {
  icon: ElementType;
  title: string;
  description: string;
demo?: "chat" | "upload" | "spending" | "budget";

};

// Sesuaikan teksnya dengan fitur yang benar-benar ada
const STEPS: TutorialStep[] = [
  {
    icon: PiWalletLight,
    title: "Selamat datang di Gemi",
    description:
      "Catat pengeluaran, atur anggaran, dan lihat ke mana uangmu pergi. Semuanya di satu tempat.",
        demo: "spending",
  },
  {
    icon: BsStars,
    title: "Catat lewat chat",
    description:
      "Ketik pengeluaranmu, biarkan AI menyusunnya jadi transaksi, lalu periksa sebelum disimpan.",
    demo: "chat",
  },
  {
    icon: PiReceiptLight,
    title: "Foto nota belanja",
    description:
      "Tekan tombol plus di kolom chat, lalu unggah foto nota. Setiap barang dibaca otomatis dan dimasukkan ke kategori yang cocok.",
    demo: "upload",
  },
  {
    icon: PiLightbulb,
    title: "Atur budget dan lihat insight",
    description:
      "Tentukan batas pengeluaran tiap kategori di halaman Budget. Dashboard lalu menampilkan sisa anggaran dan insight dari kebiasaanmu.",
      demo: "budget",
  },
  
];

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
<div className="my-auto mx-4 w-full max-w-[400px] rounded-4xl bg-white p-1 shadow-xl">
<div className="rounded-[28px] border border-orange/30 bg-linear-to-b from-orange/20 via-yellow/10 via-30% to-transparent to-50% bg-clip-padding p-5">
        {/* Header: nomor langkah dan tombol lewati */}
        <div className="flex hidden items-center  justify-between">
          <span className="text-xs text-[#6c6c6c]">
            {step + 1} dari {TOTAL}
          </span>

          {!isLast && (
            <button
              type="button"
              onClick={() => setStep(LAST_STEP)}
              className="cursor-pointer  text-xs text-[#6c6c6c] duration-300 hover:text-black"
            >
              Lewati
            </button>
          )}
        </div>

        {/* Isi langkah */}
        <div className="mb-10 mt-6 flex h-[300px] flex-col">
          <div className="mx-auto mb-14 flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-md bg-orange/15">
            <Icon className="text-3xl text-orange" />
          </div>

         
{current ? (
  <div className="mt-auto">
    <h2
      id="onboarding-title"
      className="text-xl font-semibold text-gray-900"
    >
      {current.title}
    </h2>
    <p className="mt-2 text-sm leading-relaxed text-gray-500">
      {current.description}
    </p>

{current.demo === "spending" && <SpendingMock />}
{current.demo === "chat" && <ChatMock key={step} typing />}
{current.demo === "upload" && <ChatMock key={step} pointAtPlus />}
{current.demo === "budget" && <BudgetMock key={step} />}
  </div>
          ) : (
            <>
              <h2
                id="onboarding-title"
                className="text-xl font-semibold text-gray-900"
              >
                Kapan biasanya kamu gajian?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Tanggal ini dipakai untuk menghitung periode keuanganmu. Bisa
                diubah nanti di Pengaturan.
              </p>

              <PayDayPicker value={day} onChange={setDay} />

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
                index === step ? "w-6 bg-linear-to-r from-orange to-yellow" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>

         {/* Tombol */}
        <div className="mt-6 flex gap-3">
          {/* {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((prev) => prev - 1)}
              disabled={saving}
              className="px-4 py-2 w-full cursor-pointer rounded-xl border border-gray-200 text-xs font-medium text-gray-600 duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              Lewati
            </button>
          )} */}

           {!isLast && (
            <button
              type="button"
              onClick={() => setStep(LAST_STEP)}
              className="px-4 py-2 w-full cursor-pointer rounded-xl border border-gray-200 text-sm font-medium text-gray-600 duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              Lewati
            </button>
          )}

          <button
            type="button"
            onClick={isLast ? handleSave : () => setStep((prev) => prev + 1)}
            disabled={saving}
            className=" px-4 py-2 w-full cursor-pointer rounded-xl bg-linear-to-r from-orange to-yellow w-fit text-sm font-medium text-white duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            {isLast ? (saving ? "Menyimpan..." : "Mulai pakai Gemi") : "Lanjut"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
