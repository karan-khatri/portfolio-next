import Link from "next/link";
import { LuLanguages } from "react-icons/lu";
import { LOCALES, LOCALE_META, DEFAULT_LOCALE, type AppLocale } from "@/lib/i18n/config";
import styles from "./locale-switch.module.scss";

export function LocaleLinkTabs({
  basePath,
  current,
  label = "Language",
}: {
  basePath: string;
  current: AppLocale;
  label?: string;
}) {
  return (
    <nav className={styles.switch} aria-label={label}>
      <span className={styles.label}>
        <LuLanguages className={styles.icon} aria-hidden="true" />
        {label}
      </span>
      <div className={styles.options}>
        {LOCALES.map((locale) => (
          <Link
            key={locale}
            href={locale === DEFAULT_LOCALE ? basePath : `${basePath}?lang=${locale}`}
            className={styles.option}
            aria-current={current === locale ? "page" : undefined}
          >
            {LOCALE_META[locale].nativeName}
          </Link>
        ))}
      </div>
    </nav>
  );
}
