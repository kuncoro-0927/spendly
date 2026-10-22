import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const SYSTEM_PROMPT = `Kamu adalah AI pembaca nota dan struk belanja.

Langkah pertama: tentukan apakah gambar adalah nota atau struk belanja, yaitu ada daftar barang atau jasa beserta harganya. Struk digital (screenshot pesanan atau e-receipt) juga dihitung nota.
Kalau bukan nota (kartun, foto orang atau pemandangan, dokumen lain, bukti transfer), isi is_receipt dengan false dan transactions dengan array kosong. Jangan mengarang barang atau harga yang tidak tertulis di gambar.

Balas hanya dengan JSON valid dengan format:
{
  "is_receipt": true,
  "store": "nama toko atau null",
  "transaction_date": "YYYY-MM-DD atau null",
  "transactions": [
    {
      "description": "nama barang",
      "amount": 0,
      "category_name": "nama kategori atau null"
    }
  ]
}

Aturan:
* Setiap barang adalah satu transaksi terpisah. Jangan menggabungkan beberapa barang meskipun kategorinya sama.
* Contoh: Chitato 10000, Aqua 5000, Roti 10000 menghasilkan 3 transaksi.
* description berisi nama barang yang tercetak pada nota, bukan nama kategori.
* Pilih kategori paling sesuai dari daftar kategori pengguna. Jangan membuat kategori baru.
* Kalau tidak ada kategori yang cocok, isi category_name dengan null.
* Jangan menebak nama barang atau nominal yang tidak terbaca.
* Abaikan subtotal, total akhir, pajak, dan kembalian sebagai item transaksi.
* Gunakan tanggal yang tercetak pada nota.
* Pastikan jumlah nominal seluruh item sesuai dengan total barang pada nota jika informasinya tersedia.
* Kalau nota hanya berisi satu barang, hasilkan satu transaksi.`;

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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Foto nota belum dipilih." },
        { status: 400 },
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file harus JPG, PNG, atau WEBP." },
        { status: 400 },
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran foto maksimal 5 MB." },
        { status: 400 },
      );
    }

    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, icon")
      .eq("user_id", user.id);

    if (categoryError) throw categoryError;

    if (!categories?.length) {
      return NextResponse.json(
        { error: "Kategori belum tersedia." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    const categoryNames = categories.map((category) => category.name);

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Kategori pengguna: ${JSON.stringify(categoryNames)}. Baca gambar ini.`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_completion_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI tidak menghasilkan hasil pembacaan.");
    }

    const parsed = JSON.parse(content);

    // Bukan nota: tolak sebelum modal pemeriksaan terbuka
    if (parsed.is_receipt === false) {
      return NextResponse.json(
        {
          error:
            "Gambar ini sepertinya bukan nota belanja. Coba unggah foto nota yang jelas.",
          code: "NOT_RECEIPT",
        },
        { status: 422 },
      );
    }

    const rawTransactions: unknown[] = Array.isArray(parsed.transactions)
      ? parsed.transactions
      : [];

    const transactions = rawTransactions
      .filter(
        (
          transaction,
        ): transaction is {
          description: string;
          amount: number;
          category_name?: unknown;
        } =>
          typeof transaction === "object" &&
          transaction !== null &&
          typeof (transaction as { description?: unknown }).description ===
            "string" &&
          (transaction as { description: string }).description.trim() !== "" &&
          typeof (transaction as { amount?: unknown }).amount === "number" &&
          Number.isFinite((transaction as { amount: number }).amount) &&
          (transaction as { amount: number }).amount > 0,
      )
      .map((transaction) => {
        const categoryName =
          typeof transaction.category_name === "string"
            ? transaction.category_name.trim().toLowerCase()
            : "";

        const matchedCategory = categories.find(
          (category) => category.name.trim().toLowerCase() === categoryName,
        );

        return {
          description: transaction.description.trim(),
          amount: transaction.amount,
          category_id: matchedCategory?.id ?? "",
        };
      });

    // Terdeteksi nota, tapi tidak ada barang yang terbaca (buram, terpotong)
    if (transactions.length === 0) {
      return NextResponse.json(
        {
          error:
            "Barang di nota tidak terbaca. Coba foto lebih dekat, terang, dan tidak buram.",
          code: "NO_ITEMS",
        },
        { status: 422 },
      );
    }

    const rawDate = parsed.transaction_date;

    const transactionDate =
      typeof rawDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(rawDate) &&
      !Number.isNaN(Date.parse(`${rawDate}T00:00:00Z`)) &&
      new Date(`${rawDate}T00:00:00Z`).toISOString().slice(0, 10) === rawDate
        ? rawDate
        : null;

    return NextResponse.json({
      store: typeof parsed.store === "string" ? parsed.store : null,
      transaction_date: transactionDate,
      transactions,
      categories,
    });
  } catch (error) {
    console.error("READ RECEIPT:", error);

    return NextResponse.json(
      { error: "Gagal membaca nota. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
