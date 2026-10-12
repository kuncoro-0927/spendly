"use client";

import { BsStars } from "react-icons/bs";
import { PiPlusCircleLight, PiMicrophoneLight } from "react-icons/pi";
import { RxArrowRight } from "react-icons/rx";

type Props = {
  message: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onOpenUpload: () => void;
  loading: boolean;
  error?: string;
};

export default function AiChatInput({
  message,
  onChange,
  onSubmit,
  onOpenUpload,
  loading,
  error,
}: Props) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4">
      <div className="flex flex-col gap-6 rounded-3xl border border-black/10 bg-white/40 px-5 py-4 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3">
          <BsStars className="shrink-0 text-xl text-orange" />

          <input
            type="text"
            value={message}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            placeholder="Contoh: tadi makan nasi goreng 25rb"
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenUpload}
            className="cursor-pointer text-xl text-[#6c6c6c] duration-300 hover:text-black"
            aria-label="Upload nota"
          >
            <PiPlusCircleLight />
          </button>

          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray">
              <PiMicrophoneLight className="text-base" />
            </span>

            <button
              type="button"
              onClick={onSubmit}
              disabled={loading || !message.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-orange disabled:opacity-50"
              aria-label="Kirim"
            >
              <RxArrowRight className="text-base text-white" />
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-[#6c6c6c]">AI sedang memproses...</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
