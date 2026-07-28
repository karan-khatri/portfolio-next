import { Locale } from "./generated/client";

const VALID_LOCALES: string[] = Object.values(Locale);

export function isValidLocale(value: string): value is Locale {
  return VALID_LOCALES.includes(value);
}
