import type { ContactContent } from "@portfolio/sections";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "./section-shell";

export function ContactSection({
  id,
  content,
  headingLevel,
}: {
  id: string;
  content: ContactContent;
  headingLevel: 2 | 3;
}) {
  return (
    <SectionShell
      eyebrow="Contact"
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
    >
      <Reveal>
        <a
          href={`mailto:${content.email}`}
          className="font-mono text-2xl text-foreground underline decoration-1 decoration-border underline-offset-4 transition-colors hover:decoration-accent sm:text-3xl"
        >
          {content.ctaLabel ?? content.email}
        </a>
      </Reveal>
    </SectionShell>
  );
}
