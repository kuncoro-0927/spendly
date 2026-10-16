"use client";

import { PiLock, PiUser } from "react-icons/pi";
import { IoMailOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { useAuthForm } from "../hooks/auth/useAuthForm";
import GridBackground from "../components/auth/GridBackground";
import BudgetLoginMock from "../components/auth/BudgetMock";
import BudgetCategoryMock from "../components/auth/TotalBalanceMock";
import LastSpendingLoginMock from "../components/auth/LastSpendingMock";

const inputClass =
  "mt-2 w-full border border-black/20 rounded-lg text-xs bg-transparent py-2.5 pl-10 pr-3 outline-none";
const labelClass =
  "text-xs text-left bg-linear-to-r from-orange to-yellow bg-clip-text text-transparent font-medium";

export default function LoginPage() {
  const {
    mode,
    switchMode,
    values,
    setValue,
    loading,
    error,
    success,
    handleSubmit,
  } = useAuthForm();

  const isLogin = mode === "login";

  return (
    <main className="min-h-screen flex flex-col-reverse lg:flex-row items-center gap-10 xl:gap-5 justify-center p-6 xl:mx-20 2xl:mx-40">
      <div className="text-center  flex flex-col items-center justify-center w-full xl:max-w-1/2">
        <span className="font-medium text-xl">
          {isLogin ? "Selamat datang di Gemi AI" : "Buat akun Gemi"}
        </span>
        <p className="text-[#6c6c6c] text-sm">
          {isLogin
            ? "Masuk untuk lanjut mengatur keuanganmu."
            : "Mulai kelola keuanganmu dengan lebih mudah."}
        </p>

        {/* tab */}
        <div className="flex border border-black/20 p-1 rounded-xl items-center text-sm gap-1 mt-4 w-full max-w-[70%] justify-center mx-auto">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`rounded-lg w-full px-4 py-2 duration-300 cursor-pointer ${
                mode === m
                  ? "bg-linear-to-r from-orange/15 to-yellow/15 bg-clip-padding"
                  : "text-[#6c6c6c] hover:bg-orange/10 hover:text-orange"
              }`}
            >
              <span
                className={
                  mode === m
                    ? "bg-linear-to-r from-orange to-yellow bg-clip-text text-transparent"
                    : ""
                }
              >
                {m === "login" ? "Masuk" : "Daftar"}
              </span>
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`w-full mx-auto mt-6 duration-300 ${
            isLogin ? "xl:max-w-[80%]" : "xl:max-w-[80%]"
          }`}
        >
          <div
            className={`grid gap-3 ${isLogin ? "grid-cols-1" : "xl:grid-cols-2"}`}
          >
            {!isLogin && (
              <div className="relative flex flex-col items-start">
                <label className={labelClass}>Nama lengkap</label>
                <input
                  type="text"
                  value={values.name}
                  onChange={(e) => setValue("name", e.target.value)}
                  placeholder="Masukkan Nama Lengkap"
                  autoComplete="name"
                  required
                  className={inputClass}
                />
                <PiUser className="absolute left-3 bottom-[11px] text-base text-[#6c6c6c]" />
              </div>
            )}

            <div className="relative flex flex-col items-start">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={values.email}
                onChange={(e) => setValue("email", e.target.value)}
                placeholder="Masukkan Email Kamu"
                autoComplete="email"
                required
                className={inputClass}
              />
              <IoMailOutline className="absolute left-3 bottom-[11px] text-base text-[#6c6c6c]" />
            </div>

            <div className="relative flex flex-col items-start">
              <label className={labelClass}>Password</label>
              <input
                type="password"
                value={values.password}
                onChange={(e) => setValue("password", e.target.value)}
                placeholder="Masukkan Password Kamu"
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={isLogin ? undefined : 8}
                required
                className={inputClass}
              />
              <PiLock className="absolute left-3 bottom-[11px] text-base text-[#6c6c6c]" />
            </div>

            {!isLogin && (
              <div className="relative flex flex-col items-start">
                <label className={labelClass}>Konfirmasi password</label>
                <input
                  type="password"
                  value={values.confirmPassword}
                  onChange={(e) => setValue("confirmPassword", e.target.value)}
                  placeholder="Ulangi Password Kamu"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className={inputClass}
                />
                <PiLock className="absolute left-3 bottom-[11px] text-base text-[#6c6c6c]" />
              </div>
            )}

            {error && (
              <p className="col-span-full text-sm text-red-500 text-left">
                {error}
              </p>
            )}
            {success && (
              <p className="col-span-full text-sm text-green-600 text-left">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="col-span-full bg-linear-to-r from-orange to-yellow text-white py-2.5 rounded-lg text-sm mt-4 hover:-translate-y-0.5 hover:shadow-md cursor-pointer duration-300 disabled:opacity-60"
            >
              {loading ? "..." : isLogin ? "Masuk" : "Daftar"}
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 max-w-[80%] w-full mx-auto mt-4">
          <div className="flex border-[0.5px] border-black/10 w-full"></div>
          <span className="shrink-0 text-sm text-[#6c6c6c]">Atau</span>
          <div className="flex border-[0.5px] border-black/10 w-full"></div>
        </div>

        <button
          type="button"
          className="flex items-center gap-3 max-w-[80%] mx-auto mt-4 border border-black/20 rounded-lg w-full justify-center text-center py-2.5 hover:-translate-y-0.5 hover:shadow-md duration-300 cursor-pointer"
        >
          <FcGoogle />
          <span className="text-sm text-[#6c6c6c]">
            Lanjutkan dengan Google
          </span>
        </button>
      </div>

      {/* panel kanan: sama persis seperti sekarang */}
      <div className="relative flex flex-col shadow-md w-full h-[600px] xl:max-w-1/2 overflow-hidden rounded-3xl bg-gradient-to-t from-orange to-yellow">
        <GridBackground />

        {/* area mock: flex-1 biar ngisi ruang kosong */}
        <div className="relative  flex-1 flex items-center  justify-center mt-10">
          {/* box cluster: lebar = dari kiri card 3 sampai kanan card 2 */}
          <div className="relative w-[468px] h-[420px]">
            <div className="absolute top-0 left-12 w-full z-10 bg-white/10 border border-white/40 rounded-2xl shadow-md backdrop-blur-md p-1 max-w-[300px]">
              <BudgetLoginMock />
            </div>

            <div className="absolute top-12 left-42 w-full z-10 bg-white/10 border border-white/40 rounded-2xl shadow-md backdrop-blur-md p-1 max-w-[300px]">
              <BudgetCategoryMock />
            </div>

            <div className="absolute top-44 left-0 w-full z-10 border border-white/4 p-1 max-w-[300px]">
              <LastSpendingLoginMock />
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center px-10  -translate-y-16 ">
          <h2 className="w-fit mx-auto text-2xl font-semibold bg-linear-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            Mulai Kebiasaan Finansial Baik <br />
            dari Sekarang.
          </h2>
          <p className="w-fit mx-auto font-medium mt-2 text-sm bg-linear-to-r from-white/90 to-white/70 bg-clip-text text-transparent">
            Gemi diambil dari filosofi Jawa <i>"Gemi Nastiti Ngati-ati"</i>,
            yaitu hemat, teliti, dan hati-hati. Kelola saldo dan budget dalam
            satu dashboard.
          </p>
        </div>
      </div>
    </main>
  );
}
