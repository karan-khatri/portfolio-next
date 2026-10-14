import type { SectionNavItem } from "@/components/sections/section-renderer";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { resolveNavHref } from "@/lib/nav-href";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/paths";
import type { AlternatePaths } from "@/lib/i18n/alternates";

export function SiteHeader({
  locale,
  path = "/",
  alternates,
  title,
  navItems,
  resumeUrl,
}: {
  locale: AppLocale;
  path?: string;
  alternates?: AlternatePaths;
  title: string;
  navItems: SectionNavItem[];
  resumeUrl?: string | null;
}) {
  const dictionary = getDictionary(locale);

  return (
    <header className="fixed top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        <Link
          href={localizePath("/", locale)}
          className="mr-6 shrink-0 font-heading text-lg font-bold tracking-tight text-primary"
        >
          {title}
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden gap-5 lg:flex 2xl:gap-8">
            {navItems.map((item) =>
              item.children && item.children.length > 0 ? (
                <div key={item.id} className="group relative">
                  <a
                    href={resolveNavHref(item.href, locale)}
                    className="font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                  <div className="invisible absolute top-full left-0 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="glass-panel flex min-w-40 flex-col gap-1 rounded-lg p-2">
                      {item.children.map((child) => (
                        <a
                          key={child.id}
                          href={resolveNavHref(child.href, locale)}
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
                  href={resolveNavHref(item.href, locale)}
                  className="font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} path={path} alternates={alternates} className="hidden lg:flex" />
            <ThemeToggle
              className="hidden size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-primary lg:flex"
              iconClassName="size-4"
            />
            {resumeUrl ? (
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-md bg-primary px-4 py-2 font-heading text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_15px_var(--ring)] lg:inline-flex"
              >
                {dictionary.common.resume}
              </a>
            ) : null}
            <MobileNav
              navItems={navItems}
              resumeUrl={resumeUrl}
              languageSwitcher={<LanguageSwitcher locale={locale} path={path} alternates={alternates} />}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
