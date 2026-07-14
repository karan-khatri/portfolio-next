import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import styles from "./pagination.module.scss";

// Admin-side pagination (SCSS module, matches .theme-admin). See
// components/pagination.tsx for the Tailwind public-site equivalent.
export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const pageHref = (page: number) => (page <= 1 ? basePath : `${basePath}?page=${page}`);

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
