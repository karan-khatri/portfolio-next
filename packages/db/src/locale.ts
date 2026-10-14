import { Locale } from "./generated/client";

export const LOCALES: Locale[] = Object.values(Locale);
export const DEFAULT_LOCALE: Locale = "en";

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function resolveLocale(value: string | null | undefined): Locale {
  return value && isValidLocale(value) ? value : DEFAULT_LOCALE;
}
