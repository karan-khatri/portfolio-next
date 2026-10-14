import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from "./config";
import { localizePath, splitLocalePrefix } from "./paths";

export const LOCALE_COOKIE = "locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const COUNTRY_LOCALES: Record<string, AppLocale> = {
  IT: "it",
  SM: "it",
  VA: "it",
};

const BOT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|whatsapp|telegram|lighthouse|headless|preview|monitor|uptime/i;

const SKIPPED_PREFIXES = ["/preview"];

export function localeFromCountry(country: string | null | undefined): AppLocale | null {
  if (!country) return null;
  return COUNTRY_LOCALES[country.trim().toUpperCase()] ?? null;
}

export function resolveLocaleRedirect(input: {
  method: string;
  pathname: string;
  search?: string;
  cookie?: string | null;
  country?: string | null;
  userAgent?: string | null;
}): string | null {
  if (input.method !== "GET" && input.method !== "HEAD") return null;
  if (SKIPPED_PREFIXES.some((prefix) => input.pathname.startsWith(prefix))) return null;
  if (input.userAgent && BOT_PATTERN.test(input.userAgent)) return null;
  if (splitLocalePrefix(input.pathname).locale !== DEFAULT_LOCALE) return null;

  const preferred = isAppLocale(input.cookie) ? input.cookie : localeFromCountry(input.country);
  if (!preferred || preferred === DEFAULT_LOCALE) return null;

  return `${localizePath(input.pathname, preferred)}${input.search ?? ""}`;
}
