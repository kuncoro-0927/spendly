"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string | null;
  name?: string;
  size?: number;
  className?: string;
};

const FALLBACK = "/images/profile.svg";

export default function Avatar({
  src,
  name = "",
  size = 40,
  className = "",
}: Props) {
  // Mengingat URL yang gagal dimuat. Kalau src berganti, otomatis dicoba lagi.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const useFallback = !src || failedSrc === src;

  return (
    <Image
      src={useFallback ? FALLBACK : src}
      width={size}
      height={size}
      alt={name ? `Foto ${name}` : "Foto profil"}
      onError={() => {
        if (src) setFailedSrc(src);
      }}
      // Ukuran lewat style, karena class Tailwind tidak bisa dibuat dari angka dinamis
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
