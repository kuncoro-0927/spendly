import {
  PiHouseLight,
  PiHamburgerLight,
  PiCarLight,
  PiSoccerBallLight,
  PiShoppingBagLight,
} from "react-icons/pi";
import { CiMedicalCross } from "react-icons/ci";

const iconMap: Record<string, React.ElementType> = {
  house: PiHouseLight,
  hamburger: PiHamburgerLight,
  car: PiCarLight,
  soccer: PiSoccerBallLight,
  "shopping-bag": PiShoppingBagLight,
  medical: CiMedicalCross,
};

type AddCategoryModalProps = {
  open: boolean;
  name: string;
  icon: string;
  adding: boolean;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onSubmit: () => void;
};

export function AddCategoryModal({
  open,
  name,
  icon,
  adding,
  onClose,
  onNameChange,
  onIconChange,
  onSubmit,
}: AddCategoryModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-md bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tambah Kategori
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Buat kategori pengeluaran sendiri.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama kategori
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Contoh: Investasi"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icon
          </label>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(iconMap).map(([iconName, Icon]) => (
              <button
                key={iconName}
                type="button"
                onClick={() => onIconChange(iconName)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition ${
                  icon === iconName
                    ? "border-orange bg-orange/5 text-orange"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} />

                <span className="text-xs capitalize">{iconName}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={adding}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
          >
            {adding ? "Menambahkan..." : "Tambah"}
          </button>
        </div>
      </div>
    </div>
  );
}
