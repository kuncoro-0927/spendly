"use client";

import BasketballUpload, { type UploadHandler } from "./Upload";
import { PiWarningLight } from "react-icons/pi";
type Props = {
  open: boolean;
  onClose: () => void;
  onUpload: UploadHandler;
  error?: string;
};

export default function ReceiptUploadModal({
  open,
  onClose,
  onUpload,
  error,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex overflow-y-auto bg-black/40 p-4">
      <div className="relative my-auto w-full max-w-[448px] mx-auto">
        {/* Mobile: di atas kartu, rata kanan. Desktop: di luar kanan kartu */}
        <div className="mb-2 flex justify-end sm:mb-0 sm:block">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="z-40 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-sm shadow sm:absolute sm:-right-10 sm:top-0"
          >
            ✕
          </button>
        </div>

        <div className="rounded-2xl bg-white p-3">
          <BasketballUpload
            multiple={false}
            accept="image/jpeg,image/png,image/webp"
            onUpload={onUpload}
            className="max-w-none"
          />
          {error && (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
            >
              <PiWarningLight className="mt-0.5 shrink-0 text-base" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
