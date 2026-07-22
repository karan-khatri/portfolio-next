import type { SectionNavItem } from "@/components/sections/section-renderer";
import { ThemeToggle } from "@/components/theme-toggle";

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
          {navItems.map((item) =>
            item.children && item.children.length > 0 ? (
              <div key={item.id} className="group relative">
                <a
                  href={item.href}
                  className="font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
                <div className="invisible absolute top-full left-0 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="glass-panel flex min-w-40 flex-col gap-1 rounded-lg p-2">
                    {item.children.map((child) => (
                      <a
                        key={child.id}
                        href={child.href}
                        className="rounded-md px-3 py-2 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:bg-foreground/5 hover:text-primary"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={item.id}
                href={item.href}
                className="font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-primary"
            iconClassName="size-4"
          />
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
      </div>
    </header>
  );
}
