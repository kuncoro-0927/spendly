"use client";

import { useEffect, useState } from "react";
import { BsStars } from "react-icons/bs";
import {
  PiCursorFill,
  PiMicrophoneLight,
  PiPlusCircleLight,
} from "react-icons/pi";
import { RxArrowRight } from "react-icons/rx";

const TEXT = "Saya tadi makan nasi goreng 20 ribu";

type Props = {
  typing?: boolean; // animasi mengetik (step 2)
  pointAtPlus?: boolean; // kursor menunjuk plus (step 3)
};

export default function ChatMock({ typing = false, pointAtPlus = false }: Props) {
  // Tanpa animasi, teks langsung tampil penuh
  const [count, setCount] = useState(typing ? 0 : TEXT.length);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!typing) return;

    // Hormati pengaturan "kurangi gerakan"
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(TEXT.length);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let index = 0;

    const tick = () => {
      if (index < TEXT.length) {
        index += 1;
        setCount(index);
        // Jeda acak 55 sampai 95 ms per huruf
        timer = setTimeout(tick, 55 + Math.random() * 40);
        return;
      }

      // Selesai mengetik: diam sebentar, tekan kirim, kosongkan, ulang
      timer = setTimeout(() => {
        setSending(true);

        timer = setTimeout(() => {
          setSending(false);
          index = 0;
          setCount(0);
          timer = setTimeout(tick, 700);
        }, 500);
      }, 800);
    };

    timer = setTimeout(tick, 500);

    return () => clearTimeout(timer);
  }, [typing]);


  const shown = typing ? TEXT.slice(0, count) : TEXT;
  return (
    <div
      className="mt-4 flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/40 px-5 py-4 shadow-md backdrop-blur-md"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <BsStars className="shrink-0 text-sm text-orange" />

      <span className="min-h-4 w-full text-xs leading-4 text-[#6c6c6c]">
  {shown}
  {typing && (
    <span className="ml-px inline-block h-3 w-px translate-y-0.5 bg-gray-900 animate-[caret-blink_1s_step-end_infinite] motion-reduce:animate-none" />
  )}
</span>
      </div>

      <div className="flex items-center justify-between">
        {pointAtPlus ? (
          <span className="relative flex size-5 items-center justify-center">
            {/* riak, muncul tiap kursor mengetuk */}
            <span className="absolute inset-0 rounded-full bg-orange/30 opacity-0 animate-[tap-ripple-loop_3.6s_ease-out_infinite] motion-reduce:animate-none" />

            <PiPlusCircleLight className="relative text-base text-orange animate-[plus-press-loop_3.6s_ease-in-out_infinite] motion-reduce:animate-none" />

            {/* kursor: datang, mengetuk, memudar, ulang */}
            <PiCursorFill className="pointer-events-none absolute left-2.5 top-2.5 text-base text-gray-900 drop-shadow animate-[cursor-loop_3.6s_ease-in-out_infinite] motion-reduce:animate-none" />
          </span>
        ) : (
          <PiPlusCircleLight className="text-sm text-[#6c6c6c]" />
        )}

        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray">
            <PiMicrophoneLight className="text-xs" />
          </span>

          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-orange transition-all duration-200 ${
              sending ? "scale-90" : "scale-100"
            } ${typing && count === 0 ? "opacity-50" : "opacity-100"}`}
          >
            <RxArrowRight className="text-xs text-white" />
          </span>
        </div>
      </div>
    </div>
  );
}