type Props = {
  onClick: () => void;
  saving: boolean;
  disabled: boolean; // true kalau belum ada yang diubah
};

export default function ButtonSave({ onClick, saving, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving || disabled}
      className="w-full text-sm px-3 py-2.5 rounded-lg bg-linear-to-r from-orange to-yellow text-white hover:-translate-y-0.5 hover:shadow-md duration-300 cursor-pointer"
    >
      {saving ? "Menyimpan..." : "Simpan perubahan"}
    </button>
  );
}
