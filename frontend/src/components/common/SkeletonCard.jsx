export default function SkeletonCard() {
  return (
    <div className="flex-shrink-0" style={{ width: '180px' }}>
      <div className="rounded overflow-hidden bg-gray-800 aspect-[2/3] skeleton" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="mb-8 px-4 md:px-12">
      <div className="h-6 w-48 skeleton rounded mb-4" />
      <div className="flex gap-2">
        {Array(7).fill(null).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonBanner() {
  return (
    <div className="relative w-full h-[85vh] skeleton">
      <div className="absolute bottom-32 left-4 md:left-16 space-y-4 max-w-xl">
        <div className="h-16 w-80 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
        <div className="flex gap-3 mt-4">
          <div className="h-12 w-32 skeleton rounded" />
          <div className="h-12 w-36 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}
