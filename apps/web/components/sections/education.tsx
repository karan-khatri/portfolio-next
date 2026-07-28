import type { EducationContent } from "@portfolio/sections";
import { formatDateRange } from "@/lib/format-date";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";
import { TimelineList } from "./timeline-list";

export interface EducationListItem {
  id: string;
  institution: string;
  degree: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
}

export function EducationSection({
  id,
  content,
  headingLevel,
  items,
}: {
  id: string;
  content: EducationContent;
  headingLevel: 2 | 3;
  items: EducationListItem[];
}) {
  return (
    <SectionShell
      eyebrow="Education"
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message="No education listed yet." />
      ) : (
        <TimelineList
          items={items.map((item) => ({
            id: item.id,
            title: item.degree,
            subtitle: item.location ? `${item.institution} — ${item.location}` : item.institution,
            meta: formatDateRange(item.startDate, item.endDate),
            description: item.description,
          }))}
        />
      )}
    </SectionShell>
  );
}
