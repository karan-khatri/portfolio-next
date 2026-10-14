import { DEFAULT_LOCALE, NON_DEFAULT_LOCALES, type AppLocale } from "./config";

const EXTERNAL_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function splitLocalePrefix(pathname: string): { locale: AppLocale; path: string } {
  for (const locale of NON_DEFAULT_LOCALES) {
    if (pathname === `/${locale}`) return { locale, path: "/" };
    if (pathname.startsWith(`/${locale}/`)) return { locale, path: pathname.slice(locale.length + 1) };
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}

function isFileLike(path: string): boolean {
  const pathOnly = path.split(/[?#]/)[0];
  const lastSegment = pathOnly.split("/").pop() ?? "";
  return lastSegment.includes(".");
}

export function localizePath(path: string, locale: AppLocale): string {
  if (locale === DEFAULT_LOCALE) return splitLocalePrefix(path).path;
  if (!path.startsWith("/") || path.startsWith("//") || isFileLike(path)) return path;
  const { path: bare } = splitLocalePrefix(path);
  if (bare === "/") return `/${locale}`;
  if (bare.startsWith("/?") || bare.startsWith("/#")) return `/${locale}${bare.slice(1)}`;
  return `/${locale}${bare}`;
}

export function localizeHref(href: string, locale: AppLocale): string {
  if (!href || EXTERNAL_PATTERN.test(href)) return href;
  if (href.startsWith("#")) return localizePath(`/${href}`, locale);
  if (href.startsWith("/")) return localizePath(href, locale);
  return href;
}

export function absoluteUrl(siteUrl: string, path: string): string {
  return path === "/" ? siteUrl : `${siteUrl}${path}`;
}
