"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { iconMap } from "@/app/hooks/receipt/icon-map";

type AddCategoryModalProps = {
  open: boolean;
  name: string;
  icon: string;
  adding: boolean;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onSubmit: () => void;
};

export function AddCategoryModal({
  open,
  name,
  icon,
  adding,
  onClose,
  onNameChange,
  onIconChange,
  onSubmit,
}: AddCategoryModalProps) {
  const [search, setSearch] = useState("");

  if (!open) return null;

  const getIconLabel = (iconName?: string) => {
    if (!iconName) return "";

    const name = iconName.includes(":") ? iconName.split(":")[1] : iconName;

    return name.replaceAll("-", " ");
  };

  const filteredIcons = [...new Set(iconMap)].filter(
    (iconName) =>
      typeof iconName === "string" &&
      getIconLabel(iconName)
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-black/40 p-5 scrollbar-hide">
      {" "}
      <div className="my-auto flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white p-6">
        {/* Header */}{" "}
        <div className="mb-6 flex shrink-0 items-center justify-between">
          {" "}
          <div>
            {" "}
            <h2 className="text-lg font-semibold text-gray-900">
              Tambah Kategori{" "}
            </h2>{" "}
            <p className="mt-1 text-sm text-gray-500">
              Buat kategori pengeluaran sendiri.{" "}
            </p>{" "}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={adding}
            className="text-gray-400 transition hover:text-gray-700 disabled:opacity-50"
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>
        {/* Konten yang bisa di-scroll */}
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
          {/* Nama kategori */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nama kategori
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Contoh: Investasi"
              maxLength={50}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange"
            />
          </div>

          {/* Pilihan ikon */}
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Pilih ikon
            </label>

            <span className="text-xs text-gray-400">
              {filteredIcons.length} ikon
            </span>
          </div>

          {/* Ikon terpilih atau petunjuk */}
          {icon ? (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-orange/30 bg-orange/5 p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-orange">
                <Icon icon={icon} width={24} height={24} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-gray-500">Ikon terpilih</p>
                <p className="truncate text-sm font-medium capitalize text-gray-800">
                  {getIconLabel(icon)}
                </p>
              </div>
            </div>
          ) : (
            <p className="mb-3 text-sm text-gray-500">Pilih icon yg tersedia</p>
          )}

          {/* Pencarian */}
          <div className="relative mb-3">
            <Icon
              icon="lucide:search"
              width={18}
              height={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ikon..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange"
            />
          </div>

          {/* Grid ikon */}
          <div className="grid grid-cols-5 gap-2 pr-1">
            {filteredIcons.map((iconName) => {
              const selected = icon === iconName;

              return (
                <button
                  key={iconName}
                  type="button"
                  title={getIconLabel(iconName)}
                  aria-label={getIconLabel(iconName)}
                  aria-pressed={selected}
                  onClick={() => onIconChange(iconName)}
                  className={`flex aspect-square items-center justify-center rounded-xl border transition ${
                    selected
                      ? "border-orange bg-orange/5 text-orange"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon icon={iconName} width={23} height={23} />
                </button>
              );
            })}

            {filteredIcons.length === 0 && (
              <p className="col-span-5 py-6 text-center text-sm text-gray-400">
                Ikon tidak ditemukan.
              </p>
            )}
          </div>
        </div>
        {/* Tombol tetap terlihat di bawah */}
        <div className="mt-4 flex shrink-0 gap-3 border-t border-gray-100 bg-white pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={adding}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={adding || !name.trim() || !icon}
            className="flex-1 cursor-pointer rounded-xl bg-orange py-3 text-sm font-medium text-white duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            {adding ? "Menambahkan..." : "Tambah"}
          </button>
        </div>
      </div>
    </div>
  );
}
