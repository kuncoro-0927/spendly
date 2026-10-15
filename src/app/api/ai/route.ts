import { NextResponse } from "next/server";
import { groq } from "@/lib/ai/groq";
import { createClient } from "@/lib/supabase/server";
import { buildTransactionPrompt } from "@/lib/ai/prompt";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Pesan tidak valid." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User belum login." }, { status: 401 });
    }

    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, icon")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (categoryError) {
      console.error("GET CATEGORIES:", categoryError);

      return NextResponse.json(
        { error: "Gagal mengambil kategori." },
        { status: 500 },
      );
    }

    if (!categories?.length) {
      return NextResponse.json(
        { error: "User belum memiliki kategori." },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: `${buildTransactionPrompt({
            categories,
            today,
            message,
          })}

ATURAN RESPONS TAMBAHAN:
1. Tentukan status berdasarkan pesan pengguna.
2. transaction: pesan berisi satu atau lebih
   pengeluaran yang cukup jelas untuk dibuat menjadi transaksi.
3. clarification: pesan berkaitan dengan pengeluaran,
   tetapi informasi penting seperti nominal belum tersedia
   atau masih ambigu. Tanyakan informasi yang kurang melalui reply.
4. out_of_scope: pesan berupa sapaan, pertanyaan umum,
   atau hal lain yang tidak berkaitan dengan pencatatan
   maupun pengelolaan keuangan.
5. Untuk out_of_scope, arahkan pengguna secara singkat
   agar mencatat pengeluaran atau bertanya tentang keuangan.
6. Jangan mengarang nominal, tanggal, barang, atau transaksi.
7. Jangan menganggap pesan sebagai transaksi hanya karena
   mengandung angka.
8. Jika status bukan transaction, transactions harus berupa array kosong.
9. Jika status transaction, reply harus berupa string kosong.
10. Balasan harus menggunakan bahasa Indonesia yang natural.`,
        },
        {
          role: "user",
          content: message.trim(),
        },
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "expense_assistant_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["transaction", "clarification", "out_of_scope"],
              },
              reply: {
                type: "string",
              },
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
            required: ["status", "reply", "transactions"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AI tidak memberikan hasil." },
        { status: 500 },
      );
    }

    const result = JSON.parse(content);

    const validIds = new Set(categories.map((category) => category.id));

    // Input di luar konteks atau perlu klarifikasi:
    // jangan teruskan sebagai transaksi.
    if (result.status === "out_of_scope" || result.status === "clarification") {
      return NextResponse.json({
        status: result.status,
        reply: result.reply,
        transactions: [],
        categories,
      });
    }

    if (
      result.status !== "transaction" ||
      !Array.isArray(result.transactions) ||
      result.transactions.length === 0
    ) {
      return NextResponse.json({
        status: "clarification",
        reply:
          "Aku belum bisa mengenali pengeluaranmu. " +
          "Coba tulis barang yang dibeli dan nominalnya.",
        transactions: [],
        categories,
      });
    }

    // Validasi hasil AI sebelum dikirim ke frontend.
    const transactions = result.transactions.map(
      (transaction: {
        description: string;
        amount: number;
        category_id: string;
        transaction_date: string;
      }) => ({
        ...transaction,
        category_id: validIds.has(transaction.category_id)
          ? transaction.category_id
          : "",
      }),
    );

    const invalidTransaction = transactions.some(
      (transaction: {
        description: string;
        amount: number;
        category_id: string;
        transaction_date: string;
      }) =>
        !transaction.description.trim() ||
        !Number.isFinite(transaction.amount) ||
        transaction.amount <= 0 ||
        !transaction.category_id ||
        !/^\d{4}-\d{2}-\d{2}$/.test(transaction.transaction_date),
    );

    if (invalidTransaction) {
      return NextResponse.json({
        status: "clarification",
        reply:
          "Aku belum bisa memastikan detail transaksinya. " +
          "Coba tulis ulang barang dan nominal pengeluaranmu.",
        transactions: [],
        categories,
      });
    }

    return NextResponse.json({
      status: "transaction",
      reply: "",
      transactions,
      categories,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses AI." },
      { status: 500 },
    );
  }
}
