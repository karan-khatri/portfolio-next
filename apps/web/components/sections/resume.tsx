import type { ResumeContent } from "@portfolio/sections";
import { DownloadIcon } from "lucide-react";
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
        <a
          href={content.fileUrl}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "font-mono text-xs tracking-wide uppercase",
          )}
        >
          <DownloadIcon />
          {content.ctaLabel ?? "Download resume"}
        </a>
      </Reveal>
    </SectionShell>
  );
}
