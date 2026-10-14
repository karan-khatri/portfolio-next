import Link from "next/link";
import { cn } from "@/lib/utils";
import { LOCALES, LOCALE_META, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/paths";
import type { AlternatePaths } from "@/lib/i18n/alternates";

export function LanguageSwitcher({
  locale,
  path,
  alternates,
  className,
}: {
  locale: AppLocale;
  path: string;
  alternates?: AlternatePaths;
  className?: string;
}) {
  if (LOCALES.length < 2) return null;
  const label = getDictionary(locale).common.switchLanguage;

  return (
    <div role="group" aria-label={label} className={cn("flex items-center gap-1", className)}>
      {LOCALES.map((target) => {
        const active = target === locale;
        return (
          <Link
            key={target}
            href={localizePath(alternates?.[target] ?? path, target)}
            hrefLang={LOCALE_META[target].htmlLang}
            lang={LOCALE_META[target].htmlLang}
            title={LOCALE_META[target].nativeName}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-md px-2 py-1 font-mono text-xs tracking-widest uppercase transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-primary",
            )}
          >
            {target}
          </Link>
        );
      })}
    </div>
  );
}
