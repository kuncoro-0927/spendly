import { CiSettings } from "react-icons/ci";
import { PiInfoLight, PiCameraLight } from "react-icons/pi";
import Image from "next/image";
import Skeleton from "@/app/components/ui/Skeleton";
import type { SettingsErrors } from "@/app/hooks/settings/useSettings";

type Props = {
  loading: boolean;
  avatarSrc: string | null;
  errors: SettingsErrors;
  onAvatarChange: (file: File | null) => void;
};

export default function SettingsHeader({
  loading,
  avatarSrc,
  errors,
  onAvatarChange,
}: Props) {
  return (
    <div className="mb-8 flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-r from-orange/15 to-yellow/15">
          <CiSettings className="icon-gradient-fill text-2xl" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pengaturan</h1>

          <p className="text-sm text-[#6c6c6c]">
            Kelola profil, preferensi, dan keamanan akunmu.
          </p>
        </div>
      </div>

      <div className="flex w-fit items-center gap-2 rounded-lg bg-blue-100/70 px-3 py-1.5">
        <PiInfoLight className="shrink-0 text-blue-500" />
        <span className="text-sm text-blue-500">
          Perubahan pada profil ini berlaku di seluruh aplikasi.
        </span>
      </div>

      <div className="flex items-center gap-3">
        {loading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="size-[70px] shrink-0 rounded-full" />

            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-28 shrink-0 rounded-lg" />
              <Skeleton className="h-4 w-44 shrink-0 rounded-lg" />
              <Skeleton className="h-6 mt-1 w-24 shrink-0 rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            <Image
              src={avatarSrc ?? "/images/profile.svg"}
              width={70}
              height={70}
              alt="Foto profil"
              className="size-[70px] shrink-0 rounded-full object-cover"
            />
            <div className="flex w-fit flex-col">
              <span className="text-sm font-medium">Foto Profil</span>
              <span className="text-xs text-[#6c6c6c]">
                JPG, PNG, atau WebP. Maks. 2 MB
              </span>

              <label
                aria-disabled={loading}
                className={`mt-2 flex w-fit items-center gap-2 rounded-lg bg-linear-to-r from-orange to-yellow px-3 py-1.5 text-sm text-white duration-300 ${
                  loading
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <PiCameraLight className="text-lg" />
                Pilih gambar
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={loading}
                  className="sr-only"
                  onChange={(e) => {
                    onAvatarChange(e.target.files?.[0] ?? null);
                    e.target.value = ""; // supaya file yang sama bisa dipilih ulang
                  }}
                />
              </label>

              {errors.avatar && (
                <p className="mt-1 text-xs text-red-500">{errors.avatar}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
