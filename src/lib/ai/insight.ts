import { groq } from "@/lib/ai/groq";

const MODEL = process.env.GROQ_INSIGHT_MODEL ?? "qwen/qwen3.8-27b";

export type Insight = { title: string; analysis: string };

// "Rp 1,5 juta" untuk angka besar, "Rp 25.000" untuk sisanya
export function rupiahText(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} juta`;
  }

  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

const COMMON_RULES = `
Kamu menulis insight singkat untuk aplikasi budgeting Gemi.
Aturan:
- Bahasa Indonesia yang natural dan sopan, memakai kata "kamu".
- Pakai hanya fakta pada data. Jangan menghitung ulang dan jangan menambah angka baru.
- Tulis angka persis seperti di data (sudah diformat).
- title: 2 sampai 4 kata. analysis: satu kalimat, maksimal 20 kata.
- Beri penilaian singkat (misalnya aman atau perlu diwaspadai), tapi jangan memberi saran atau perintah.
- Pakai "periode ini", jangan "bulan ini".
- Balas hanya JSON: {"title": "...", "analysis": "..."}
`;

export async function generateInsight(
  task: string,
  facts: Record<string, string | number>,
  fallback: Insight,
): Promise<Insight> {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: `${COMMON_RULES}\n${task}` },
        { role: "user", content: JSON.stringify(facts) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Ambil objek JSON pertama, kalau-kalau model menambah teks di sekitarnya
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return fallback;

    const parsed = JSON.parse(match[0]);

    if (
      typeof parsed.title !== "string" ||
      typeof parsed.analysis !== "string" ||
      !parsed.title.trim() ||
      !parsed.analysis.trim()
    ) {
      return fallback;
    }

    return { title: parsed.title.trim(), analysis: parsed.analysis.trim() };
  } catch (error) {
    console.error("GENERATE INSIGHT:", error);
    return fallback;
  }
}
