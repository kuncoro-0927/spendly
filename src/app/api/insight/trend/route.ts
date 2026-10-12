import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        {
          role: "system",
          content: `
Kamu adalah AI analis keuangan pribadi untuk aplikasi Spendly.
Analisis perubahan pengeluaran bulan ini dibanding bulan sebelumnya.
Gunakan bahasa Indonesia yang natural, singkat, dan mudah dipahami.
Jangan memberikan saran atau rekomendasi.
Maksimal 20 kata untuk analysis.
Balas hanya dengan JSON valid berisi title dan analysis.
          `,
        },
        {
          role: "user",
          content: JSON.stringify({
            currentSpent,
            previousSpent,
            spendingChange,
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
    console.error("Trend API error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat insight tren pengeluaran.",
      },
      { status: 500 },
    );
  }
}
