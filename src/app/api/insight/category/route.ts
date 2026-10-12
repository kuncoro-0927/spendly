import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { topCategory, categorySpent, currentSpent } = await request.json();

    if (
      typeof topCategory !== "string" ||
      typeof categorySpent !== "number" ||
      typeof currentSpent !== "number"
    ) {
      return NextResponse.json(
        { error: "Data kategori tidak valid." },
        { status: 400 },
      );
    }

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        {
          role: "system",
          content: `
Kamu adalah AI analis kategori pengeluaran di aplikasi Spendly.
Analisis kategori dengan pengeluaran terbesar dan porsinya terhadap total pengeluaran.
Gunakan bahasa Indonesia yang natural dan singkat.
Jangan memberikan saran atau rekomendasi.
Maksimal 20 kata untuk analysis.
Balas hanya dengan JSON valid berisi title dan analysis.
          `,
        },
        {
          role: "user",
          content: JSON.stringify({
            topCategory,
            categorySpent,
            currentSpent,
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
    console.error("Category insight error:", error);

    return NextResponse.json(
      { error: "Gagal membuat insight kategori." },
      { status: 500 },
    );
  }
}
