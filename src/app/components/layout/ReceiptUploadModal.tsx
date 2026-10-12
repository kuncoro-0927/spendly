"use client";

import BasketballUpload, { type UploadHandler } from "./Upload";

type Props = {
  open: boolean;
  onClose: () => void;
  onUpload: UploadHandler;
};

export default function ReceiptUploadModal({ open, onClose, onUpload }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="relative my-0 w-full max-w-[448px] rounded-2xl bg-white p-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute -right-10 top-0 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow"
        >
          ✕
        </button>

        <BasketballUpload
          multiple={false}
          accept="image/jpeg,image/png,image/webp"
          onUpload={onUpload}
          className="max-w-none"
        />
      </div>
    </div>
  );
}
