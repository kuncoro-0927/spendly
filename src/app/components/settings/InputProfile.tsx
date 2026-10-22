"use client";

import type { SettingsErrors } from "@/app/hooks/settings/useSettings";
import Skeleton from "../ui/Skeleton";
type Props = {
  name: string;
  loading: boolean;
  email: string;
  pendingEmail: string | null;
  errors: SettingsErrors;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
};

export default function InputProfile({
  name,
  loading,
  email,
  pendingEmail,
  errors,
  onNameChange,
  onEmailChange,
}: Props) {
  return (
    <section className="mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="font-medium">Profil</span>
          <span className="text-sm text-[#6c6c6c]">
            Lorem ipsum dolor sit amet consectetur.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className=" w-full">
            <label className="mb-1 block text-sm  text-[#6c6c6c]">Nama</label>

            {loading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-full shrink-0 rounded-lg" />
              </div>
            ) : (
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Contoh: John Doe"
                maxLength={50}
                className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-orange"
              />
            )}

            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm text-[#6c6c6c]">
              Alamat Email
            </label>

            <div className="relative w-full">
              {loading ? (
                <Skeleton className="h-9 w-full rounded-lg" />
              ) : (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="Contoh: johndoe@gmail.com"
                  maxLength={50}
                  className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-orange"
                />
              )}

              {errors.email && (
                <p className="absolute left-0 top-full z-10 mt-1 w-full text-xs text-red-500">{errors.email}</p>
              )}

              {pendingEmail && (
                <p className="absolute left-0 top-full z-10 mt-1 w-full text-xs text-green-600">
                  Menunggu konfirmasi untuk {pendingEmail}. Cek kotak masuk
                  emailmu.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
