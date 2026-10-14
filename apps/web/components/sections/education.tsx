import type { EducationContent } from "@portfolio/sections";
import { formatDateRange } from "@/lib/format-date";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
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
  locale,
  id,
  content,
  headingLevel,
  items,
}: {
  locale: AppLocale;
  id: string;
  content: EducationContent;
  headingLevel: 1 | 2 | 3;
  items: EducationListItem[];
}) {
  const t = getDictionary(locale);

  return (
    <SectionShell
      eyebrow={t.eyebrow.education}
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message={t.empty.education} />
      ) : (
        <TimelineList
          items={items.map((item) => ({
            id: item.id,
            title: item.degree,
            subtitle: item.location ? `${item.institution} — ${item.location}` : item.institution,
            meta: formatDateRange(item.startDate, item.endDate, locale),
            description: item.description,
          }))}
        />
      )}
    </SectionShell>
  );
}
