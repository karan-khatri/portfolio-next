export function SiteFooter({ title }: { title: string }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 sm:px-8 lg:px-12">
        <p className="font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} {title}
        </p>
        <a
          href="#top"
          className="font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          Back to top
        </a>
      </div>
    </footer>
  );
}
