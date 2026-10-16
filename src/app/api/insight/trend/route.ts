import { NextResponse } from "next/server";
import { generateInsight, rupiahText } from "@/lib/ai/insight";

const TASK = `
Tugas: jelaskan perubahan pengeluaran periode ini dibanding periode lalu.
Contoh data: {"periodeIni":"Rp 2,5 juta","periodeLalu":"Rp 2 juta","perubahan":"naik 25%"}
Contoh balasan: {"title":"Pengeluaran Naik","analysis":"Pengeluaranmu naik 25% dibanding periode lalu, dari Rp 2 juta menjadi Rp 2,5 juta."}
`;

export async function POST(request: Request) {
  try {
    const { currentSpent, previousSpent, spendingChange } =
      await request.json();

    if (
      typeof currentSpent !== "number" ||
      typeof previousSpent !== "number" ||
      typeof spendingChange !== "number"
    ) {
      return NextResponse.json(
        { error: "Data pengeluaran tidak valid." },
        { status: 400 },
      );
    }

    // Kasus kosong dijawab langsung, tanpa memanggil AI
    if (currentSpent === 0 && previousSpent === 0) {
      return NextResponse.json({
        title: "Belum Ada Data",
        analysis:
          "Belum ada pengeluaran tercatat di periode ini maupun sebelumnya.",
      });
    }

    if (previousSpent === 0) {
      return NextResponse.json({
        title: "Belum Ada Pembanding",
        analysis: `Pengeluaranmu ${rupiahText(currentSpent)}, dan periode lalu belum punya data.`,
      });
    }

    const percent = Math.abs(Math.round(spendingChange));
    const direction =
      percent < 3 ? "stabil" : spendingChange > 0 ? "naik" : "turun";

    const perubahan =
      direction === "stabil" ? "hampir sama" : `${direction} ${percent}%`;

    const fallbackTitle = {
      stabil: "Pengeluaran Stabil",
      naik: "Pengeluaran Naik",
      turun: "Pengeluaran Turun",
    }[direction];

    const result = await generateInsight(
      TASK,
      {
        periodeIni: rupiahText(currentSpent),
        periodeLalu: rupiahText(previousSpent),
        perubahan,
      },
      {
        title: fallbackTitle,
        analysis: `Pengeluaranmu ${perubahan} dibanding periode lalu.`,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Trend API error:", error);

    return NextResponse.json(
      { error: "Gagal membuat insight tren pengeluaran." },
      { status: 500 },
    );
  }
}
