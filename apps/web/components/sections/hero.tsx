import type { HeroContent } from "@portfolio/sections";
import { ArrowRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionShell } from "./section-shell";

export interface SectionImage {
  url: string;
  width: number;
  height: number;
  blurDataUrl: string | null;
  altText: string | null;
}

// Never wrapped in <Reveal> — this is the LCP element and must render
// immediately, unanimated.
export function HeroSection({
  id,
  content,
  headingLevel,
  image,
}: {
  id: string;
  content: HeroContent;
  headingLevel: 2 | 3;
  image: SectionImage | null;
}) {
  return (
    <SectionShell
      variant="hero"
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
    >
      {image ? (
        <img
          src={image.url}
          alt={image.altText ?? ""}
          width={image.width}
          height={image.height}
          className="mt-8 max-h-105 w-full max-w-2xl rounded-xl object-cover"
        />
      ) : null}
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
