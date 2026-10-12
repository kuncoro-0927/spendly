import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const {
      currentSpent,
      previousSpent,
      spendingChange,
      topCategory,
      riskyCategories,
      projectedSpent,
    } = body;

    if (
      typeof currentSpent !== "number" ||
      !Number.isFinite(currentSpent) ||
      currentSpent < 0 ||
      typeof previousSpent !== "number" ||
      !Number.isFinite(previousSpent) ||
      previousSpent < 0 ||
      !Array.isArray(riskyCategories)
    ) {
      return NextResponse.json(
        { error: "Data insight tidak valid." },
        { status: 400 },
      );
    }

    const safeTopCategory =
      topCategory &&
      typeof topCategory.categoryName === "string" &&
      typeof topCategory.spent === "number" &&
      Number.isFinite(topCategory.spent)
        ? {
            categoryName: topCategory.categoryName.slice(0, 100),
            spent: topCategory.spent,
          }
        : null;

    const safeRiskyCategories = riskyCategories
      .filter(
        (category: {
          categoryName?: unknown;
          spent?: unknown;
          budget?: unknown;
          projected?: unknown;
        }) =>
          typeof category.categoryName === "string" &&
          typeof category.spent === "number" &&
          Number.isFinite(category.spent) &&
          typeof category.budget === "number" &&
          Number.isFinite(category.budget) &&
          typeof category.projected === "number" &&
          Number.isFinite(category.projected),
      )
      .slice(0, 10)
      .map(
        (category: {
          categoryName: string;
          spent: number;
          budget: number;
          projected: number;
        }) => ({
          categoryName: category.categoryName.slice(0, 100),
          spent: category.spent,
          budget: category.budget,
          projected: category.projected,
        }),
      );

    const safeData = {
      currentSpent,
      previousSpent,
      spendingChange:
        typeof spendingChange === "number" && Number.isFinite(spendingChange)
          ? spendingChange
          : null,
      topCategory: safeTopCategory,
      riskyCategories: safeRiskyCategories,
      projectedSpent:
        typeof projectedSpent === "number" && Number.isFinite(projectedSpent)
          ? projectedSpent
          : null,
    };

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        {
          role: "system",
          content: `
   Kamu adalah asisten keuangan pribadi. Analisis kondisi keuangan pengguna berdasarkan data yang diberikan.

* Gunakan bahasa Indonesia yang sederhana dan natural.
* Maksimal 20 kata untuk bagian analysis.
* Fokus pada kondisi pengeluaran, perbandingan anggaran, atau perubahan pengeluaran.
* Hindari saran, rekomendasi, dan pengulangan.
* Jangan mengarang data.
* Balas dalam format JSON dengan properti title dan analysis saja.

  `,
        },
        {
          role: "user",
          content: JSON.stringify(safeData),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_completion_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI tidak menghasilkan insight.");
    }

    const parsed = JSON.parse(content);

    if (
      typeof parsed.title !== "string" ||
      typeof parsed.analysis !== "string"
    ) {
      throw new Error("Format hasil insight tidak valid.");
    }

    return NextResponse.json({
      insight: {
        title: parsed.title.slice(0, 120),
        analysis: parsed.analysis.slice(0, 500),
      },
    });
  } catch (error) {
    console.error("GENERATE INSIGHT:", error);

    return NextResponse.json(
      { error: "Gagal membuat insight. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
