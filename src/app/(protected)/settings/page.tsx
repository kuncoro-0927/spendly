"use client";

import { useSettings } from "@/app/hooks/settings/useSettings";
import Skeleton from "@/app/components/ui/Skeleton";
import InputProfile from "@/app/components/settings/InputProfile";
import InputPreference from "@/app/components/settings/InputPreference";
import InputAccount from "@/app/components/settings/InputAccount";
import SettingsHeader from "@/app/components/settings/SettingsHeader";
import ButtonSave from "@/app/components/settings/ButtonSave";
export default function SettingsPage() {
  const s = useSettings();

  return (
    <div className="flex flex-col bg-white p-6 sm:px-20 md:px-28 xl:px-6 pb-52 lg:rounded-xl xl:pb-6 shadow-md">
      <SettingsHeader
        avatarSrc={s.avatarSrc}
        onAvatarChange={s.changeAvatar}
        errors={s.errors}
        loading={s.loading}
      />

      <InputProfile
        name={s.name}
        email={s.email}
        pendingEmail={s.pendingEmail}
        errors={s.errors}
        onNameChange={s.setName}
        onEmailChange={s.setEmail}
        loading={s.loading}
      />

      <InputPreference day={s.day} loading={s.loading} onChange={s.setDay} />

      <InputAccount
        hasPassword={s.hasPassword}
        password={s.password}
        confirm={s.confirm}
        errors={s.errors}
        onPasswordChange={s.setPassword}
        onConfirmChange={s.setConfirm}
        onLogout={s.logout}
        onDeleteAccount={s.deleteAccount}
      />

      {s.message && (
        <p
          role="status"
          className={`text-sm ${
            s.message.type === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {s.message.text}
        </p>
      )}

      <ButtonSave onClick={s.save} saving={s.saving} disabled={!s.dirty} />
    </div>
  );
}
