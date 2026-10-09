import { LuSave } from "react-icons/lu";

type SaveBudgetButtonProps = {
  saving: boolean;
  onClick: () => void;
};

export function SaveBudgetButton({ saving, onClick }: SaveBudgetButtonProps) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="flex text-sm items-center gap-2 px-4 py-2.5 rounded-xl bg-orange hover:-translate-y-0.5 hover:shadow-md duration-300 cursor-pointer text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Menyimpan..." : "Simpan Budget"}
      </button>
    </div>
  );
}
