"use client";

import { useI18n } from "@/lib/i18n/context";
import type { AppLocale } from "@/lib/i18n/config";

export function LocaleOnly({ locale, children }: { locale: AppLocale; children: React.ReactNode }) {
  const { locale: active } = useI18n();
  return active === locale ? <>{children}</> : null;
}
