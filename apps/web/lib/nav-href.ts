import { localizeHref } from "@/lib/i18n/paths";
import type { AppLocale } from "@/lib/i18n/config";

export function resolveNavHref(href: string, locale: AppLocale = "en"): string {
  return localizeHref(href, locale);
}
