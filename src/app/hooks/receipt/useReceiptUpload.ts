import { useState } from "react";
import { ReceiptResult } from "@/lib/receipt/receipt-types";

export function useReceiptUpload() {
  const [showUpload, setShowUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [receiptResult, setReceiptResult] = useState<ReceiptResult | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);

  const openUpload = () => setShowUpload(true);

  const closeUpload = () => {
    if (!uploading) setShowUpload(false);
  };

  const closePreview = () => setShowPreview(false);

  const finishPreview = () => {
    setShowPreview(false);
    setReceiptResult(null);
  };

  const upload = async (file: File, onProgress: (value: number) => void) => {
    setUploading(true);

    let progress = 0;
    const interval = window.setInterval(() => {
      progress = Math.min(progress + Math.random() * 5 + 1, 90);
      onProgress(progress);
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai/receipt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

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
    } finally {
      window.clearInterval(interval);
      setUploading(false);
    }
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
  };
}
