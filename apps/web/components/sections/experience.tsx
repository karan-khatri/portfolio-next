import type { ExperienceContent } from "@portfolio/sections";
import { Reveal } from "@/components/motion/reveal";
import { formatDateRange } from "@/lib/format-date";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";

export interface ExperienceListItem {
  id: string;
  company: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
}

export function ExperienceSection({
  id,
  content,
  headingLevel,
  items,
}: {
  id: string;
  content: ExperienceContent;
  headingLevel: 2 | 3;
  items: ExperienceListItem[];
}) {
  return (
    <SectionShell
      eyebrow="Experience"
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
    >
      {items.length === 0 ? (
        <EmptyState message="No experience listed yet." />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item, index) => (
            <li key={item.id} className="py-6 first:pt-0 last:pb-0">
              <Reveal
                delay={Math.min(index * 0.05, 0.3)}
                className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,140px)_1fr]"
              >
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {formatDateRange(item.startDate, item.endDate)}
                </span>
                <div>
                  <p className="font-medium">
                    {item.title} <span className="text-muted-foreground">— {item.company}</span>
                  </p>
                  {item.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
