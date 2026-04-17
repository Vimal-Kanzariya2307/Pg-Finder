export default function SkeletonCard() {
  return (
    <div className="card rounded-2xl overflow-hidden">
      <div className="shimmer-skeleton" style={{ aspectRatio: '16/10' }} />
      <div className="p-4 space-y-3">
        <div className="shimmer-skeleton h-5 w-3/4 rounded-lg" />
        <div className="shimmer-skeleton h-3.5 w-1/2 rounded-lg" />
        <div className="flex gap-2">
          {[1,2,3].map(i => <div key={i} className="shimmer-skeleton h-6 w-16 rounded-md" />)}
        </div>
        <div className="shimmer-skeleton h-px w-full rounded" />
        <div className="flex justify-between">
          <div className="shimmer-skeleton h-3.5 w-20 rounded" />
          <div className="shimmer-skeleton h-3.5 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
