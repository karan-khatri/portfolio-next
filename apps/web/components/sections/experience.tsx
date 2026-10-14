import type { ExperienceContent } from "@portfolio/sections";
import { formatDateRange } from "@/lib/format-date";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
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
  locale,
  id,
  content,
  headingLevel,
  items,
}: {
  locale: AppLocale;
  id: string;
  content: ExperienceContent;
  headingLevel: 1 | 2 | 3;
  items: ExperienceListItem[];
}) {
  const t = getDictionary(locale);

  return (
    <SectionShell
      eyebrow={t.eyebrow.experience}
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message={t.empty.experience} />
      ) : (
        <TimelineList
          items={items.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.company,
            meta: formatDateRange(item.startDate, item.endDate, locale),
            description: item.description,
          }))}
        />
      )}
    </SectionShell>
  );
}
