type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className = "" }: SkeletonProps) {
  // Radius bawaan hanya dipakai kalau className tidak menentukan radius sendiri
  const hasRadius = /(^|\s)rounded/.test(className);

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gray-200 ${
        hasRadius ? "" : "rounded-lg"
      } ${className}`}
    />
  );
}
