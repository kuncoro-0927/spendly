import { LuSave } from "react-icons/lu";

type SaveBudgetButtonProps = {
  saving: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export function SaveBudgetButton({
  saving,
  onClick,
  disabled,
}: SaveBudgetButtonProps) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={saving || disabled}
        className="w-full justify-center flex text-sm items-center gap-2 px-4 py-2.5 rounded-lg bg-linear-to-r from-orange to-yellow hover:-translate-y-0.5 hover:shadow-md duration-300 cursor-pointer text-white  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Menyimpan..." : "Simpan Budget"}
      </button>
    </div>
  );
}
