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

    // Hapus file foto profil (kalau ada). Berhenti di sini kalau gagal,
    // karena user yang masih punya file di Storage tidak bisa dihapus.
    const { data: files, error: listError } = await admin.storage
      .from("avatars")
      .list(user.id);

    if (listError) throw new Error(`Storage list: ${listError.message}`);

    if (files?.length) {
      const { error: removeError } = await admin.storage
        .from("avatars")
        .remove(files.map((file) => `${user.id}/${file.name}`));

      if (removeError) {
        throw new Error(`Storage remove: ${removeError.message}`);
      }
    }

    // Semua tabel (budgets, transactions, categories, user_settings, dan
    // budget_categories lewat budgets) memakai on delete cascade ke auth.users,
    // jadi seluruh datanya ikut terhapus.
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw new Error(`Delete user: ${deleteError.message}`);
    }

    return NextResponse.json({ message: "Akun dihapus." });
  } catch (error) {
    console.error("DELETE ACCOUNT:", error);

    return NextResponse.json(
      { error: "Gagal menghapus akun." },
      { status: 500 },
    );
  }
}
