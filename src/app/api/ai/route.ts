import { NextResponse } from "next/server";
import { groq } from "@/lib/ai/groq";
import { createClient } from "@/lib/supabase/server";
import { buildTransactionPrompt } from "@/lib/ai/prompt";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Pesan tidak valid.",
        },
        { status: 400 },
      );
    }

    // 1. Cek user
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "User belum login.",
        },
        { status: 401 },
      );
    }

    // 2. Ambil kategori milik user
    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: true,
      });

    if (categoryError) {
      console.error("GET CATEGORIES:", categoryError);

      return NextResponse.json(
        {
          error: "Gagal mengambil kategori.",
        },
        { status: 500 },
      );
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        {
          error: "User belum memiliki kategori.",
        },
        { status: 400 },
      );
    }

    // 3. Tanggal hari ini
    const today = new Date().toISOString().split("T")[0];

    // 4. Kirim ke Groq
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: buildTransactionPrompt({
            categories,
            today,
            message,
          }),
        },
        {
          role: "user",
          content: message,
        },
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "expense_transactions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              transactions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: {
                      type: "string",
                    },
                    amount: {
                      type: "number",
                    },
                    category_id: {
                      type: "string",
                    },
                    transaction_date: {
                      type: "string",
                    },
                  },
                  required: [
                    "description",
                    "amount",
                    "category_id",
                    "transaction_date",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["transactions"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        {
          error: "AI tidak memberikan hasil.",
        },
        { status: 500 },
      );
    }

    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat memproses AI.",
      },
      { status: 500 },
    );
  }
}
