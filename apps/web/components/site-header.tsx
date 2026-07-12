import type { SectionNavItem } from "@/components/sections/section-renderer";

export function SiteHeader({ title, navItems }: { title: string; navItems: SectionNavItem[] }) {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-12">
        <h1 className="font-mono text-xs font-medium tracking-[0.2em] uppercase">
          <a href="#top">{title}</a>
        </h1>
        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
