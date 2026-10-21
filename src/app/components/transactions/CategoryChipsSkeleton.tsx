import Skeleton from "@/app/components/ui/Skeleton";

const WIDTHS = ["w-14", "w-20", "w-24", "w-16", "w-20", "w-16"];

export default function CategoryChipsSkeleton() {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide"
      role="status"
      aria-label="Memuat kategori"
    >
      {WIDTHS.map((width, index) => (
        <Skeleton
          key={index}
          className={`h-[30px] shrink-0 rounded-full ${width}`}
        />
      ))}
    </div>
  );
}
