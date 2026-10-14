import type { TestimonialsContent } from "@portfolio/sections";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";

export interface TestimonialListItem {
  id: string;
  authorName: string;
  authorRole: string | null;
  quote: string;
}

export function TestimonialsSection({
  locale,
  id,
  content,
  headingLevel,
  items,
}: {
  locale: AppLocale;
  id: string;
  content: TestimonialsContent;
  headingLevel: 1 | 2 | 3;
  items: TestimonialListItem[];
}) {
  const t = getDictionary(locale);

  return (
    <SectionShell
      eyebrow={t.eyebrow.testimonials}
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message={t.empty.testimonials} />
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
