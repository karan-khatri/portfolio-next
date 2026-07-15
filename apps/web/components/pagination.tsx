import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

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
    <nav aria-label="Pagination" className="mt-16 flex items-center justify-between gap-4">
      {currentPage > 1 ? (
        <a
          href={pageHref(currentPage - 1)}
          className="group flex items-center gap-2 font-mono text-xs text-primary"
        >
          <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Prev
        </a>
      ) : (
        <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground/40">
          <ArrowLeftIcon className="size-3.5" />
          Prev
        </span>
      )}

      <span className="font-mono text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <a
          href={pageHref(currentPage + 1)}
          className="group flex items-center gap-2 font-mono text-xs text-primary"
        >
          Next
          <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1" />
        </a>
      ) : (
        <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground/40">
          Next
          <ArrowRightIcon className="size-3.5" />
        </span>
      )}
    </nav>
  );
}
