"use client";

import { BsStars } from "react-icons/bs";
import {
  PiPlusCircleLight,
  PiMicrophoneLight,
  PiWarningCircle,
} from "react-icons/pi";
import { RxArrowRight } from "react-icons/rx";

type Props = {
  message: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onOpenUpload: () => void;
  loading: boolean;
  error?: string;
  reply?: string;
};

export default function AiChatInput({
  message,
  onChange,
  onSubmit,
  onOpenUpload,
  loading,
  reply,
  error,
}: Props) {
  const hasStatus = !!error || !!reply;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex w-full max-w-2xl lg:max-w-4xl -translate-x-1/2 flex-col gap-2 px-4 sm:px-20 md:px-28">
      {/* status: loading / error / reply */}
      {hasStatus && (
        <div className="flex max-h-60 animate-[statusIn_.25s_ease-out] flex-col gap-3 overflow-y-auto rounded-3xl border border-black/10 bg-white/40 p-4 shadow-md backdrop-blur-md">
          <div className="mb-2 flex items-center gap-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full ">
              <BsStars className="text-sm icon-gradient-fill" />
            </span>
            <span className="text-sm  text-[#6c6c6c]">Respon AI</span>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3"
            >
              <PiWarningCircle className="mt-0.5 shrink-0 text-lg text-red-500" />
              <p className="text-sm leading-relaxed text-red-600">{error}</p>
            </div>
          )}

          {reply && (
            <div aria-live="polite" className="flex items-start gap-3">
              <p className="whitespace-pre-wrap pt-0.5 text-sm leading-relaxed text-black/80">
                {reply}
              </p>
            </div>
          )}
        </div>
      )}

      {/* input */}
      <div className="flex flex-col gap-6 rounded-3xl border border-black/10 bg-white/40 px-5 py-4 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3">
          <BsStars className="shrink-0 text-xl icon-gradient-fill" />

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
              aria-label={loading ? "Memproses" : "Kirim"}
              aria-busy={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && message.trim()) onSubmit();
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-orange to-yellow ${
                loading ? "cursor-wait" : "disabled:opacity-50"
              }`}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <RxArrowRight className="text-base text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
