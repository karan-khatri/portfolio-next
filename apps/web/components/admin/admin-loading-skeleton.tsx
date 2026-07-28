export function AdminLoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded-md bg-foreground/10" />
        <div className="h-9 w-48 rounded-md bg-foreground/10" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-16 rounded-lg bg-foreground/5" />
        ))}
      </div>
    </div>
  );
}
