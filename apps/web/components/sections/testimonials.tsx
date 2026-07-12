import type { TestimonialsContent } from "@portfolio/sections";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";

export interface TestimonialListItem {
  id: string;
  authorName: string;
  authorRole: string | null;
  quote: string;
}

export function TestimonialsSection({
  id,
  content,
  headingLevel,
  items,
}: {
  id: string;
  content: TestimonialsContent;
  headingLevel: 2 | 3;
  items: TestimonialListItem[];
}) {
  return (
    <SectionShell
      eyebrow="Testimonials"
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
    >
      {items.length === 0 ? (
        <EmptyState message="No testimonials yet." />
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2">
          {items.map((item, index) => (
            <li key={item.id}>
              <Reveal delay={Math.min(index * 0.05, 0.3)}>
                <blockquote className="border-l-2 border-border pl-6 transition-colors hover:border-accent">
                  <p className="text-lg leading-relaxed">{item.quote}</p>
                  <cite className="mt-4 block font-mono text-xs tracking-wide text-muted-foreground uppercase not-italic">
                    {item.authorName}
                    {item.authorRole ? ` — ${item.authorRole}` : ""}
                  </cite>
                </blockquote>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
