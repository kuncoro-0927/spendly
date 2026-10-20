const LEGACY_ICONS: Record<string, string> = {
  house: "ph:house-light",
  hamburger: "ph:hamburger-light",
  car: "ph:car-light",
  soccer: "ph:football-light",
  "shopping-bag": "ph:shopping-bag-light",
  medical: "ph:first-aid-kit-light",
};

export const resolveIcon = (icon?: string | null) => {
  if (!icon) return "ph:house-light";
  if (icon.includes(":")) return icon;
  return LEGACY_ICONS[icon] ?? "ph:house-light";
};

export const formatShortRupiah = (value: number = 0) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}Jt`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}K`;
  }

  return value.toLocaleString("id-ID");
};

export const formatRupiahInput = (digits: string) => {
  const number = digits.replace(/\D/g, "");
  return number ? new Intl.NumberFormat("id-ID").format(Number(number)) : "";
};

// "Rp 3,4 jt", "Rp 850 rb", atau "Rp 500". Selalu positif, arahnya dijelaskan oleh kata "naik" atau "turun".
export const formatRupiahText = (value: number) => {
  const abs = Math.abs(value);

  if (abs >= 1_000_000) {
    return `Rp ${(abs / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} jt`;
  }

  if (abs >= 1_000) {
    return `Rp ${(abs / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} rb`;
  }

  return `Rp ${abs.toLocaleString("id-ID")}`;
};
