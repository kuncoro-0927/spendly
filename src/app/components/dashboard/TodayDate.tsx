"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export default function TodayDate() {
  const [today, setToday] = useState("");

  useEffect(() => {
    const update = () => setToday(formatter.format(new Date()));

    update();
    const id = setInterval(update, 60_000); // cek tiap menit, jadi ganti hari otomatis

    return () => clearInterval(id);
  }, []);

  // &nbsp; menjaga tinggi h1 supaya tidak loncat sebelum tanggal terisi
  return <>{today || "\u00A0"}</>;
}
