"use client";

import { LuLanguages } from "react-icons/lu";
import { LOCALES, LOCALE_META, type AppLocale } from "@/lib/i18n/config";
import styles from "./locale-switch.module.scss";

export function LocaleSwitch({
  value,
  onChange,
  label = "Editing language",
}: {
  value: AppLocale;
  onChange: (locale: AppLocale) => void;
  label?: string;
}) {
  return (
    <div className={styles.switch} role="group" aria-label={label}>
      <span className={styles.label}>
        <LuLanguages className={styles.icon} aria-hidden="true" />
        {label}
      </span>
      <div className={styles.options}>
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            className={styles.option}
            aria-pressed={value === locale}
            onClick={() => onChange(locale)}
          >
            {LOCALE_META[locale].nativeName}
          </button>
        ))}
      </div>
    </div>
  );
}
