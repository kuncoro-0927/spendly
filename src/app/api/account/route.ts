import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User belum login." }, { status: 401 });
    }

    const admin = createAdminClient();

    // Hapus file foto profil (kalau ada)
    const { data: files } = await admin.storage.from("avatars").list(user.id);

    if (files?.length) {
      await admin.storage
        .from("avatars")
        .remove(files.map((file) => `${user.id}/${file.name}`));
    }

    // Semua tabel (budgets, transactions, categories, user_settings, dan
    // budget_categories lewat budgets) memakai on delete cascade ke auth.users,
    // jadi seluruh datanya ikut terhapus.
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return NextResponse.json({ message: "Akun dihapus." });
  } catch (error) {
    console.error("DELETE ACCOUNT:", error);

    return NextResponse.json(
      { error: "Gagal menghapus akun." },
      { status: 500 },
    );
  }
}
