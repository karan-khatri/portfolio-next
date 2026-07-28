// Standalone skeleton for a public detail page (project/post/standalone page).
// Deliberately doesn't render PublicShell/SiteHeader — those need navItems and
// site settings, which are fetched by the actual page component and aren't
// available yet while this shows, so it only mocks the article's own content
// area (matching its container width/padding to minimize layout shift).
export function PublicDetailSkeleton() {
  return (
    <div className="animate-pulse pt-20" aria-busy="true" aria-label="Loading">
      <article className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="h-4 w-24 rounded bg-foreground/10" />
        <div className="mt-8 aspect-video w-full rounded-xl bg-foreground/5" />
        <div className="mt-8 h-9 w-2/3 rounded bg-foreground/10" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full rounded bg-foreground/5" />
          <div className="h-4 w-full rounded bg-foreground/5" />
          <div className="h-4 w-3/4 rounded bg-foreground/5" />
        </div>
      </article>
    </div>
  );
}
