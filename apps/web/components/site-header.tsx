import type { SectionNavItem } from "@/components/sections/section-renderer";

export function SiteHeader({
  title,
  navItems,
  resumeUrl,
}: {
  title: string;
  navItems: SectionNavItem[];
  resumeUrl?: string | null;
}) {
  return (
    <header className="fixed top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-12">
        <a
          href="#top"
          className="font-heading text-lg font-bold tracking-tight text-primary"
        >
          {title}
        </a>
        <nav className="hidden gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>
        {resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-md bg-primary px-4 py-2 font-heading text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_15px_var(--ring)] md:inline-flex"
          >
            Resume
          </a>
        ) : null}
      </div>
    </header>
  );
}
