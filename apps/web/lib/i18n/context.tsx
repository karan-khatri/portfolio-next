"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, type AppLocale } from "./config";
import { DICTIONARIES, type Dictionary } from "./dictionaries";
import { localizeHref } from "./paths";

interface I18nValue {
  locale: AppLocale;
  t: Dictionary;
  href: (path: string) => string;
}

const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  t: DICTIONARIES[DEFAULT_LOCALE],
  href: (path) => path,
});

export function I18nProvider({ locale, children }: { locale: AppLocale; children: React.ReactNode }) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      t: DICTIONARIES[locale],
      href: (path) => localizeHref(path, locale),
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
