import type { HeroContent } from "@portfolio/sections";
import { ArrowRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionShell } from "./section-shell";

// Never wrapped in <Reveal> — this is the LCP element and must render
// immediately, unanimated.
export function HeroSection({
  id,
  content,
  headingLevel,
}: {
  id: string;
  content: HeroContent;
  headingLevel: 2 | 3;
}) {
  return (
    <SectionShell
      variant="hero"
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
    >
      {content.ctaLabel && content.ctaHref ? (
        <a
          href={content.ctaHref}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "mt-8 font-mono text-xs tracking-wide uppercase",
          )}
        >
          {content.ctaLabel}
          <ArrowRightIcon />
        </a>
      ) : null}
    </SectionShell>
  );
}
