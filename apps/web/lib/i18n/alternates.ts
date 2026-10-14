import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "./config";
import { absoluteUrl, localizePath } from "./paths";

export type AlternatePaths = Partial<Record<AppLocale, string>>;

export function alternateUrls(siteUrl: string, alternates: AlternatePaths): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    const path = alternates[locale];
    if (path !== undefined) languages[locale] = absoluteUrl(siteUrl, localizePath(path, locale));
  }
  const defaultPath = alternates[DEFAULT_LOCALE];
  if (defaultPath !== undefined) {
    languages["x-default"] = absoluteUrl(siteUrl, localizePath(defaultPath, DEFAULT_LOCALE));
  }
  return languages;
}

export function staticAlternates(path: string): AlternatePaths {
  return Object.fromEntries(LOCALES.map((locale) => [locale, path])) as AlternatePaths;
}
