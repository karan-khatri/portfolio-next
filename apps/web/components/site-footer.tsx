import { ArrowUpIcon, LinkIcon } from "lucide-react";

export function SiteFooter({
  title,
  githubUrl,
  linkedinUrl,
}: {
  title: string;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}) {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:px-8 md:flex-row lg:px-12">
        <div className="space-y-1 text-center md:text-left">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} {title}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <LinkIcon className="size-4" />
              GitHub
            </a>
          ) : null}
          {linkedinUrl ? (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <LinkIcon className="size-4" />
              LinkedIn
            </a>
          ) : null}
          <a
            href="#top"
            className="flex size-9 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-primary/10"
            aria-label="Back to top"
          >
            <ArrowUpIcon className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
