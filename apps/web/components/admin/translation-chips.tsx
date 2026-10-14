import { LOCALES, type AppLocale } from "@/lib/i18n/config";
import styles from "./translation-chips.module.scss";

export function TranslationChips({ present, current }: { present: AppLocale[]; current: AppLocale }) {
  return (
    <span className={styles.chips} aria-label="Available languages">
      {LOCALES.map((locale) => (
        <span
          key={locale}
          className={styles.chip}
          data-present={present.includes(locale)}
          data-current={locale === current}
        >
          {locale}
        </span>
      ))}
    </span>
  );
}
