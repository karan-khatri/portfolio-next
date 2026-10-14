import { LuLanguages } from "react-icons/lu";
import type { SectionNavItem } from "@/components/sections/section-renderer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { AlternatePaths } from "@/lib/i18n/alternates";

export function PublicShell({
  locale,
  path = "/",
  alternates,
  isFallback = false,
  title,
  navItems,
  resumeUrl,
  githubUrl,
  linkedinUrl,
  children,
}: Readonly<{
  locale: AppLocale;
  path?: string;
  alternates?: AlternatePaths;
  isFallback?: boolean;
  title: string;
  navItems: SectionNavItem[];
  resumeUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  children: React.ReactNode;
}>) {
  const dictionary = getDictionary(locale);

  return (
    <div id="top" className="theme-site min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        {dictionary.common.skipToContent}
      </a>
      <SiteHeader
        locale={locale}
        path={path}
        alternates={alternates}
        title={title}
        navItems={navItems}
        resumeUrl={resumeUrl}
      />
      <main id="main-content" className="pt-20">
        {isFallback ? (
          <p
            role="note"
            className="mx-auto flex w-full max-w-7xl items-center gap-2 px-6 pt-6 font-mono text-xs text-muted-foreground sm:px-8 lg:px-12"
          >
            <LuLanguages className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {dictionary.notice.translationFallback}
          </p>
        ) : null}
        {children}
      </main>
      <SiteFooter locale={locale} title={title} githubUrl={githubUrl} linkedinUrl={linkedinUrl} />
    </div>
  );
}
