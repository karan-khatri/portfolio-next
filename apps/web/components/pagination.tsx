import Link from "next/link";
import { LuArrowLeft, LuArrowRight, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import adminStyles from "./admin/pagination.module.scss";
import type { AppLocale } from "@/lib/i18n/config";
import { formatMessage, getDictionary } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/paths";

function buildPageHref(basePath: string, page: number, query?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(query ?? {})) {
    if (val) params.set(key, val);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  query,
  variant = "site",
  locale = "en",
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
  variant?: "site" | "admin";
  locale?: AppLocale;
}) {
  if (totalPages <= 1) return null;

  const t = getDictionary(locale);
  const pageHref = (page: number) =>
    buildPageHref(variant === "site" ? localizePath(basePath, locale) : basePath, page, query);

  if (variant === "admin") {
    return (
      <nav aria-label="Pagination" className={adminStyles.nav}>
        {currentPage > 1 ? (
          <Link href={pageHref(currentPage - 1)} className={adminStyles.link}>
            <LuChevronLeft className={adminStyles.icon} />
            Prev
          </Link>
        ) : (
          <span className={adminStyles.linkDisabled}>
            <LuChevronLeft className={adminStyles.icon} />
            Prev
          </span>
        )}

        <span className={adminStyles.status}>
          Page {currentPage} of {totalPages}
        </span>

        {currentPage < totalPages ? (
          <Link href={pageHref(currentPage + 1)} className={adminStyles.link}>
            Next
            <LuChevronRight className={adminStyles.icon} />
          </Link>
        ) : (
          <span className={adminStyles.linkDisabled}>
            Next
            <LuChevronRight className={adminStyles.icon} />
          </span>
        )}
      </nav>
    );
  }

  return (
    <nav aria-label={t.pagination.label} className="mt-16 flex items-center justify-between gap-4">
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className="group flex items-center gap-2 font-mono text-xs text-primary"
        >
          <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          {t.pagination.prev}
        </Link>
      ) : (
        <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground/40">
          <LuArrowLeft className="size-3.5" />
          {t.pagination.prev}
        </span>
      )}

      <span className="font-mono text-xs text-muted-foreground">
        {formatMessage(t.pagination.pageOf, { current: currentPage, total: totalPages })}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className="group flex items-center gap-2 font-mono text-xs text-primary"
        >
          {t.pagination.next}
          <LuArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : (
        <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground/40">
          {t.pagination.next}
          <LuArrowRight className="size-3.5" />
        </span>
      )}
    </nav>
  );
}
