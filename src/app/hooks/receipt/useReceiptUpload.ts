import { useState } from "react";
import { ReceiptResult } from "@/lib/receipt/receipt-types";

export function useReceiptUpload() {
  const [showUpload, setShowUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [receiptResult, setReceiptResult] = useState<ReceiptResult | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const openUpload = () => {
    setUploadError("");
    setShowUpload(true);
  };

  const closeUpload = () => {
    if (uploading) return;
    setUploadError("");
    setShowUpload(false);
  };

  const upload = async (file: File, onProgress: (value: number) => void) => {
    setUploadError("");
    setUploading(true);

    let progress = 0;
    const interval = window.setInterval(() => {
      progress = Math.min(progress + Math.random() * 5 + 1, 90);
      onProgress(progress);
    }, 300);

    try {
      const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

      if (!ALLOWED.includes(file.type)) {
        throw new Error("Format harus JPG, PNG, atau WebP.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran gambar maksimal 5 MB.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai/receipt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Gagal membaca nota.");
      }

      if (!Array.isArray(data.transactions)) {
        throw new Error("Format hasil AI tidak valid.");
      }

      window.clearInterval(interval);
      onProgress(100);

      // Beri waktu agar progress 100% sempat terlihat
      await new Promise((resolve) => setTimeout(resolve, 400));

      setReceiptResult(data);
      setShowUpload(false);
      setShowPreview(true);
    } catch (err) {
      // Pesan ini yang ditampilkan modal, lalu dilempar lagi supaya
      // komponen Upload tetap tahu bahwa unggahannya gagal
      setUploadError(
        err instanceof Error ? err.message : "Gagal membaca nota.",
      );
      throw err;
    } finally {
      window.clearInterval(interval);
      setUploading(false);
    }
  };

  const closePreview = () => setShowPreview(false);

  const finishPreview = () => {
    setShowPreview(false);
    setReceiptResult(null);
  };

  return {
    showUpload,
    showPreview,
    receiptResult,
    openUpload,
    closeUpload,
    closePreview,
    finishPreview,
    upload,
    uploadError,
  };
}
