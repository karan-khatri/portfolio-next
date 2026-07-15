import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import styles from "./pagination.module.scss";

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  query,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function pageHref(page: number) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(query ?? {})) {
      if (val) params.set(key, val);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav aria-label="Pagination" className={styles.nav}>
      {currentPage > 1 ? (
        <Link href={pageHref(currentPage - 1)} className={styles.link}>
          <ChevronLeftIcon className={styles.icon} />
          Prev
        </Link>
      ) : (
        <span className={styles.linkDisabled}>
          <ChevronLeftIcon className={styles.icon} />
          Prev
        </span>
      )}

      <span className={styles.status}>
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link href={pageHref(currentPage + 1)} className={styles.link}>
          Next
          <ChevronRightIcon className={styles.icon} />
        </Link>
      ) : (
        <span className={styles.linkDisabled}>
          Next
          <ChevronRightIcon className={styles.icon} />
        </span>
      )}
    </nav>
  );
}
