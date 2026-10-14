import type { Locale } from "@portfolio/db/server";

export type AppLocale = Locale;

export interface LocaleMeta {
  label: string;
  nativeName: string;
  htmlLang: string;
  ogLocale: string;
  dateLocale: string;
}

export const LOCALE_META: Record<AppLocale, LocaleMeta> = {
  en: { label: "English", nativeName: "English", htmlLang: "en", ogLocale: "en_US", dateLocale: "en-US" },
  it: { label: "Italian", nativeName: "Italiano", htmlLang: "it", ogLocale: "it_IT", dateLocale: "it-IT" },
};

export const LOCALES = Object.keys(LOCALE_META) as AppLocale[];
export const DEFAULT_LOCALE: AppLocale = "en";
export const NON_DEFAULT_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return typeof value === "string" && (LOCALES as string[]).includes(value);
}

export function resolveAppLocale(value: string | null | undefined): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}
