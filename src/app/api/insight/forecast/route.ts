import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { currentSpent, projectedSpent, monthlyBudget } =
      await request.json();

    if (
      typeof currentSpent !== "number" ||
      typeof projectedSpent !== "number" ||
      typeof monthlyBudget !== "number"
    ) {
      return NextResponse.json(
        { error: "Data prediksi tidak valid." },
        { status: 400 },
      );
    }

    const completion = await groq.chat.completions.create({
     model: "qwen/qwen3.8-27b",
      messages: [
        {
          role: "system",
          content: `
Kamu adalah AI analis prediksi pengeluaran untuk aplikasi Spendly.
Analisis prediksi total pengeluaran sampai akhir bulan dibandingkan dengan anggaran bulanan.
Gunakan bahasa Indonesia yang natural dan singkat.
Jangan memberikan saran atau rekomendasi.
Maksimal 20 kata untuk analysis.
Balas hanya dengan JSON valid berisi title dan analysis.
          `,
        },
        {
          role: "user",
          content: JSON.stringify({
            currentSpent,
            projectedSpent,
            monthlyBudget,
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Respons AI kosong.");
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Forecast insight error:", error);

    return NextResponse.json(
      { error: "Gagal membuat prediksi pengeluaran." },
      { status: 500 },
    );
  }
}
