import { LOCALE_META, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

function formatter(locale: AppLocale, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(LOCALE_META[locale].dateLocale, options);
}

export function formatDateRange(start: Date, end: Date | null, locale: AppLocale = "en"): string {
  const monthYear = formatter(locale, { month: "short", year: "numeric" });
  const startLabel = monthYear.format(start);
  const endLabel = end ? monthYear.format(end) : getDictionary(locale).common.present;
  return `${startLabel} — ${endLabel}`;
}

export function formatDate(date: Date, locale: AppLocale = "en"): string {
  return formatter(locale, { month: "short", day: "numeric", year: "numeric" }).format(date);
}
