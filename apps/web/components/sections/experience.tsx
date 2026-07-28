import type { ExperienceContent } from "@portfolio/sections";
import { formatDateRange } from "@/lib/format-date";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";
import { TimelineList } from "./timeline-list";

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
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message="No experience listed yet." />
      ) : (
        <TimelineList
          items={items.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.company,
            meta: formatDateRange(item.startDate, item.endDate),
            description: item.description,
          }))}
        />
      )}
    </SectionShell>
  );
}
