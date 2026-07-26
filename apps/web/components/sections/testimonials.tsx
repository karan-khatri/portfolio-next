import type { TestimonialsContent } from "@portfolio/sections";
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
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message="No testimonials yet." />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id}>
                <div className="glass-panel glow-primary flex h-full flex-col rounded-xl p-6 transition-all duration-300 sm:p-8">
                  <span className="font-heading text-4xl leading-none text-primary/40">
                    &ldquo;
                  </span>
                  <p className="mt-2 text-lg leading-relaxed">{item.quote}</p>
                  <cite className="mt-6 block font-mono text-xs tracking-wide text-primary uppercase not-italic">
                    {item.authorName}
                    {item.authorRole ? (
                      <span className="text-muted-foreground"> — {item.authorRole}</span>
                    ) : null}
                  </cite>
                </div>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
