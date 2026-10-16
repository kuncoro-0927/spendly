import { NextResponse } from "next/server";
import { generateInsight, rupiahText } from "@/lib/ai/insight";

const TASK = `
Tugas: jelaskan kategori dengan pengeluaran terbesar dan porsinya terhadap total.
Contoh balasan:
{"title":"Makanan Terbesar","analysis":"Makanan menjadi pengeluaran terbesar dengan Rp1 juta, sekitar 40% dari total periode ini."}
`;

export async function POST(request: Request) {
  try {
    const { topCategory, categorySpent, currentSpent } = await request.json();

    if (
      typeof topCategory !== "string" ||
      typeof categorySpent !== "number" ||
      typeof currentSpent !== "number"
    ) {
      return NextResponse.json(
        { error: "Data pengeluaran tidak valid." },
        { status: 400 },
      );
    }

    if (
      currentSpent <= 0 ||
      categorySpent <= 0 ||
      topCategory === "Belum ada pengeluaran"
    ) {
      return NextResponse.json({
        title: "Belum Ada Data",
        analysis: "Belum ada pengeluaran tercatat di periode ini.",
      });
    }

    const share = Math.round((categorySpent / currentSpent) * 100);

    return NextResponse.json(
      await generateInsight(
        TASK,
        {
          kategori: topCategory,
          pengeluaran: rupiahText(categorySpent),
          porsi: `${share}%`,
        },
        {
          title: `${topCategory} Terbesar`,
          analysis: `${topCategory} menjadi pengeluaran terbesar dengan ${rupiahText(categorySpent)}, sekitar ${share}% dari total pengeluaran periode ini.`,
        },
      ),
    );
  } catch (error) {
    console.error("Category insight API error:", error);

    return NextResponse.json(
      { error: "Gagal membuat insight kategori." },
      { status: 500 },
    );
  }
}
