import type { AboutContent } from "@portfolio/sections";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "./section-shell";

export function AboutSection({
  id,
  content,
  headingLevel,
}: {
  id: string;
  content: AboutContent;
  headingLevel: 2 | 3;
}) {
  const paragraphs = content.body.split(/\n{2,}/).filter(Boolean);

  return (
    <SectionShell eyebrow="About" headingId={id} headingLevel={headingLevel} heading={content.heading}>
      <Reveal className="max-w-2xl space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-lg leading-relaxed text-foreground/90">
            {paragraph}
          </p>
        ))}
      </Reveal>
    </SectionShell>
  );
}
