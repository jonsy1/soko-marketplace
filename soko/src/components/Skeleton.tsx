export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-card ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <SkeletonBox className="aspect-square rounded-none" />
      <div className="p-3 space-y-2">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-4 w-1/2" />
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-7 w-full mt-2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-4 w-1/3" />
          <SkeletonBox className="h-3 w-2/3" />
        </div>
        <SkeletonBox className="h-4 w-16" />
      </div>
    </div>
  );
}