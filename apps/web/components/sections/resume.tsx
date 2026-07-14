import type { ResumeContent } from "@portfolio/sections";
import { DownloadIcon, FileTextIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "./section-shell";

export function ResumeSection({
  id,
  content,
  headingLevel,
}: {
  id: string;
  content: ResumeContent;
  headingLevel: 2 | 3;
}) {
  return (
    <SectionShell eyebrow="Resume" headingId={id} headingLevel={headingLevel} heading={content.heading}>
      <Reveal>
        <div className="glass-panel glow-primary flex max-w-xl flex-col items-start gap-4 rounded-xl p-6 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileTextIcon className="size-5" />
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The full story — roles, stack, and what I&rsquo;ve shipped.
            </p>
          </div>
          <a
            href={content.fileUrl}
            className={cn(
              buttonVariants({ size: "lg" }),
              "shrink-0 font-mono text-xs tracking-wide uppercase",
            )}
          >
            <DownloadIcon />
            {content.ctaLabel ?? "Download resume"}
          </a>
        </div>
      </Reveal>
    </SectionShell>
  );
}
