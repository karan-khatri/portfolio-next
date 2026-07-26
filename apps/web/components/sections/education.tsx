import type { EducationContent } from "@portfolio/sections";
import { formatDateRange } from "@/lib/format-date";
import { ProseContent } from "@/components/prose-content";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";

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
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-4 w-px bg-linear-to-b from-primary to-secondary opacity-30 md:left-8" />
          <ul className="space-y-12">
            {items.map((item) => (
              <li key={item.id} className="relative pl-12 md:pl-20">
                <span className="absolute top-0 left-3 z-10 size-2.5 rounded-full bg-primary shadow-[0_0_10px_var(--ring)] md:left-7.25" />
                  <div className="glass-panel glow-primary rounded-xl p-6 transition-all duration-300">
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-heading text-xl font-medium">{item.degree}</h3>
                        <p className="font-mono text-sm text-primary">
                          {item.institution}
                          {item.location ? ` — ${item.location}` : ""}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatDateRange(item.startDate, item.endDate)}
                      </span>
                    </div>
                    {item.description ? (
                      <ProseContent html={item.description} className="text-muted-foreground" />
                    ) : null}
                  </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionShell>
  );
}
