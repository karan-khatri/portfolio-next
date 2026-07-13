import type { AboutContent } from "@portfolio/sections";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "./section-shell";
import type { SectionImage } from "./hero";

export function AboutSection({
  id,
  content,
  headingLevel,
  image,
}: Readonly<{
  id: string;
  content: AboutContent;
  headingLevel: 2 | 3;
  image: SectionImage | null;
}>) {
  const paragraphs = content.body.split(/\n{2,}/).filter(Boolean);

  return (
    <SectionShell eyebrow="About" headingId={id} headingLevel={headingLevel} heading={content.heading}>
      <Reveal className="max-w-2xl space-y-4">
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? ""}
            width={image.width}
            height={image.height}
            className="mb-6 aspect-video w-full rounded-xl object-cover"
          />
        ) : null}
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-lg leading-relaxed text-foreground/90">
            {paragraph}
          </p>
        ))}
      </Reveal>
    </SectionShell>
  );
}
